create table if not exists public.portfolio_posts (
    id uuid primary key default gen_random_uuid(),
    source_update_id bigint unique,
    title text not null check (char_length(btrim(title)) between 1 and 160),
    description text not null default '' check (char_length(description) <= 5000),
    category text not null check (category in (
        'certification',
        'research_paper',
        'publication',
        'conference',
        'award',
        'project'
    )),
    organization text check (organization is null or char_length(organization) <= 180),
    achievement_date date,
    credential_id text check (credential_id is null or char_length(credential_id) <= 180),
    verification_url text check (
        verification_url is null or verification_url ~ '^https?://'
    ),
    file_url text,
    thumbnail_url text,
    staging_path text,
    published_path text,
    file_mime_type text check (
        file_mime_type is null or file_mime_type in (
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp'
        )
    ),
    tags text[] not null default '{}',
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (cardinality(tags) <= 12),
    check (array_position(tags, '') is null)
);

create index if not exists portfolio_posts_published_category_date_idx
    on public.portfolio_posts (category, achievement_date desc)
    where status = 'published';

create index if not exists portfolio_posts_tags_idx
    on public.portfolio_posts using gin (tags);

create or replace function public.set_portfolio_posts_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists portfolio_posts_updated_at on public.portfolio_posts;
create trigger portfolio_posts_updated_at
    before update on public.portfolio_posts
    for each row execute function public.set_portfolio_posts_updated_at();

alter table public.portfolio_posts enable row level security;
revoke all on public.portfolio_posts from anon, authenticated;
grant select (
    id,
    title,
    description,
    category,
    organization,
    achievement_date,
    credential_id,
    verification_url,
    file_url,
    thumbnail_url,
    file_mime_type,
    tags,
    status,
    created_at,
    updated_at
) on public.portfolio_posts to anon, authenticated;

drop policy if exists "Public can read published portfolio posts" on public.portfolio_posts;
create policy "Public can read published portfolio posts"
    on public.portfolio_posts
    for select
    to anon, authenticated
    using (status = 'published');

create table if not exists public.publisher_rate_limits (
    actor_id text primary key,
    window_started_at timestamptz not null,
    request_count integer not null check (request_count > 0)
);

alter table public.publisher_rate_limits enable row level security;
revoke all on public.publisher_rate_limits from public, anon, authenticated;

create or replace function public.consume_publisher_rate_limit(
    p_actor_id text,
    p_limit integer default 20,
    p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_count integer;
begin
    if p_actor_id is null or p_actor_id = '' or p_limit < 1 or p_window_seconds < 1 then
        return false;
    end if;

    insert into public.publisher_rate_limits as limits (actor_id, window_started_at, request_count)
    values (p_actor_id, now(), 1)
    on conflict (actor_id) do update set
        window_started_at = case
            when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
            else limits.window_started_at
        end,
        request_count = case
            when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
            else limits.request_count + 1
        end
    returning request_count into current_count;

    return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_publisher_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_publisher_rate_limit(text, integer, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    (
        'portfolio-staging',
        'portfolio-staging',
        false,
        10485760,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    ),
    (
        'portfolio-published',
        'portfolio-published',
        true,
        10485760,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    )
on conflict (id) do update
set
    name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;