import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const CATEGORIES = new Set([
  "certification",
  "research_paper",
  "publication",
  "conference",
  "award",
  "project",
]);
const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

async function matchesSecret(actual: string, expected: string) {
  const encoder = new TextEncoder();
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(actual)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const actualBytes = new Uint8Array(actualHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let mismatch = 0;
  for (let index = 0; index < actualBytes.length; index += 1) {
    mismatch |= actualBytes[index] ^ expectedBytes[index];
  }
  return mismatch === 0;
}

function normalizedMetadata(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Metadata is required.");
  const input = value as Record<string, unknown>;
  const title = String(input.title ?? "").trim();
  const description = String(input.description ?? "").trim();
  const category = String(input.category ?? "").trim().toLowerCase();
  const organization = String(input.organization ?? "").trim();
  const achievementDate = String(input.achievement_date ?? "").trim();
  const credentialId = String(input.credential_id ?? "").trim();
  const verificationUrl = String(input.verification_url ?? "").trim();
  const rawTags = Array.isArray(input.tags)
    ? input.tags
    : String(input.tags ?? "").split(",");
  const tags = [...new Set(rawTags.map((tag) => String(tag).trim()).filter(Boolean))];

  if (title.length < 1 || title.length > 160) throw new Error("Title must be 1-160 characters.");
  if (description.length > 5000) throw new Error("Description must be at most 5000 characters.");
  if (!CATEGORIES.has(category)) throw new Error("Choose a supported category.");
  if (organization.length > 180) throw new Error("Organization must be at most 180 characters.");
  if (credentialId.length > 180) throw new Error("Credential ID must be at most 180 characters.");
  if (tags.length > 12 || tags.some((tag) => tag.length > 40)) {
    throw new Error("Use up to 12 tags, each no longer than 40 characters.");
  }
  if (achievementDate && (!/^\d{4}-\d{2}-\d{2}$/.test(achievementDate) || Number.isNaN(Date.parse(achievementDate)))) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }
  if (verificationUrl) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(verificationUrl);
    } catch {
      throw new Error("Verification URL is invalid.");
    }
    if (parsedUrl.protocol !== "https:") throw new Error("Verification URL must use HTTPS.");
  }

  return {
    title,
    description,
    category,
    organization: organization || null,
    achievement_date: achievementDate || null,
    credential_id: credentialId || null,
    verification_url: verificationUrl || null,
    tags,
  };
}

function hasExpectedSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  if (mimeType === "image/webp") {
    return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

function safeFileName(value: string) {
  return value
    .split(/[\\/]/)
    .pop()!
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .slice(-100) || "portfolio-file";
}

async function downloadTelegramFile(fileId: string, suppliedName: string) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!botToken) throw new Error("Telegram file service is not configured.");

  const lookup = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`,
  );
  if (!lookup.ok) throw new Error("Telegram could not locate the attached file.");
  const lookupBody = await lookup.json();
  const filePath = String(lookupBody?.result?.file_path ?? "");
  const declaredSize = Number(lookupBody?.result?.file_size ?? 0);
  if (!filePath) throw new Error("Telegram returned an invalid file path.");
  if (declaredSize > MAX_FILE_BYTES) throw new Error("Files must be 10 MB or smaller.");

  const extension = (safeFileName(suppliedName || filePath).split(".").pop() ?? "").toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension];
  if (!mimeType) throw new Error("Supported files are PDF, JPG, PNG, and WebP.");

  const download = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
  if (!download.ok) throw new Error("Telegram file download failed.");
  const bytes = new Uint8Array(await download.arrayBuffer());
  if (bytes.byteLength > MAX_FILE_BYTES) throw new Error("Files must be 10 MB or smaller.");
  if (!hasExpectedSignature(bytes, mimeType)) throw new Error("The file content does not match its file type.");

  return {
    blob: new Blob([bytes], { type: mimeType }),
    mimeType,
    fileName: safeFileName(suppliedName || filePath),
  };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const expectedSecret = Deno.env.get("PUBLISHER_WEBHOOK_SECRET") ?? "";
  const providedSecret = request.headers.get("x-publisher-secret") ?? "";
  if (!expectedSecret || !(await matchesSecret(providedSecret, expectedSecret))) {
    return json({ error: "Unauthorized." }, 401);
  }

  const serviceUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceUrl || !serviceKey) return json({ error: "Publisher service is not configured." }, 500);

  const ownerId = Deno.env.get("TELEGRAM_OWNER_ID") ?? "";
  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 32_000) return json({ error: "Request is too large." }, 413);
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (!ownerId || String(body.telegram_user_id ?? "") !== ownerId) {
    return json({ error: "This Telegram account is not authorized to publish." }, 403);
  }

  const supabase = createClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const action = String(body.action ?? "");

    if (action === "create_draft") {
      const metadata = normalizedMetadata(body.metadata);
      const postId = crypto.randomUUID();
      let stagingPath: string | null = null;
      let fileMimeType: string | null = null;

      if (body.file_id) {
        const file = await downloadTelegramFile(
          String(body.file_id),
          String(body.file_name ?? ""),
        );
        stagingPath = `${postId}/${crypto.randomUUID()}-${file.fileName}`;
        fileMimeType = file.mimeType;
        const uploaded = await supabase.storage
          .from("portfolio-staging")
          .upload(stagingPath, file.blob, { contentType: file.mimeType, upsert: false });
        if (uploaded.error) throw new Error("Draft file upload failed.");
      }

      const inserted = await supabase.from("portfolio_posts").insert({
        id: postId,
        ...metadata,
        staging_path: stagingPath,
        file_mime_type: fileMimeType,
        status: "draft",
      }).select("id,title,description,category,organization,achievement_date,credential_id,verification_url,tags,status")
        .single();

      if (inserted.error) {
        if (stagingPath) await supabase.storage.from("portfolio-staging").remove([stagingPath]);
        throw new Error("Draft could not be saved.");
      }
      return json({ ok: true, action, post: inserted.data });
    }

    const postId = String(body.draft_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(postId)) return json({ error: "Invalid post ID." }, 400);

    if (action === "publish") {
      const lookup = await supabase.from("portfolio_posts").select("*")
        .eq("id", postId).eq("status", "draft").maybeSingle();
      if (lookup.error || !lookup.data) return json({ error: "Draft not found or already handled." }, 404);

      let publishedPath: string | null = null;
      let fileUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      if (lookup.data.staging_path) {
        const downloaded = await supabase.storage.from("portfolio-staging").download(lookup.data.staging_path);
        if (downloaded.error || !downloaded.data) throw new Error("Draft file is unavailable.");
        const fileName = lookup.data.staging_path.split("/").pop() ?? "attachment";
        publishedPath = `${postId}/${fileName}`;
        const uploaded = await supabase.storage.from("portfolio-published").upload(
          publishedPath,
          downloaded.data,
          { contentType: lookup.data.file_mime_type ?? "application/octet-stream", cacheControl: "3600", upsert: false },
        );
        if (uploaded.error) throw new Error("Published file could not be prepared.");
        fileUrl = supabase.storage.from("portfolio-published").getPublicUrl(publishedPath).data.publicUrl;
        if (String(lookup.data.file_mime_type ?? "").startsWith("image/")) thumbnailUrl = fileUrl;
      }

      const updated = await supabase.from("portfolio_posts").update({
        status: "published",
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        published_path: publishedPath,
        staging_path: null,
      }).eq("id", postId).eq("status", "draft").select("id,title,status").maybeSingle();

      if (updated.error || !updated.data) {
        if (publishedPath) await supabase.storage.from("portfolio-published").remove([publishedPath]);
        throw new Error("Draft could not be published.");
      }
      if (lookup.data.staging_path) {
        const removed = await supabase.storage.from("portfolio-staging").remove([lookup.data.staging_path]);
        if (removed.error) console.error("Published draft staging cleanup failed", postId);
      }
      return json({ ok: true, action, post: updated.data });
    }

    if (action === "cancel") {
      const lookup = await supabase.from("portfolio_posts").select("staging_path")
        .eq("id", postId).eq("status", "draft").maybeSingle();
      if (lookup.error || !lookup.data) return json({ error: "Draft not found or already handled." }, 404);
      const removedRow = await supabase.from("portfolio_posts").delete()
        .eq("id", postId).eq("status", "draft");
      if (removedRow.error) throw new Error("Draft could not be cancelled.");
      if (lookup.data.staging_path) {
        const removedFile = await supabase.storage.from("portfolio-staging").remove([lookup.data.staging_path]);
        if (removedFile.error) console.error("Cancelled draft cleanup failed", postId);
      }
      return json({ ok: true, action, draft_id: postId });
    }

    if (action === "archive") {
      const lookup = await supabase.from("portfolio_posts").select("published_path,file_mime_type")
        .eq("id", postId).eq("status", "published").maybeSingle();
      if (lookup.error || !lookup.data) return json({ error: "Published post not found." }, 404);
      let stagingPath: string | null = null;

      if (lookup.data.published_path) {
        const downloaded = await supabase.storage.from("portfolio-published").download(lookup.data.published_path);
        if (downloaded.error || !downloaded.data) throw new Error("Published file could not be archived.");
        stagingPath = `${postId}/archived-${crypto.randomUUID()}`;
        const uploaded = await supabase.storage.from("portfolio-staging").upload(
          stagingPath,
          downloaded.data,
          { contentType: lookup.data.file_mime_type ?? "application/octet-stream", upsert: false },
        );
        if (uploaded.error) throw new Error("Archived file could not be secured.");
      }

      const updated = await supabase.from("portfolio_posts").update({
        status: "archived",
        file_url: null,
        thumbnail_url: null,
        published_path: null,
        staging_path: stagingPath,
      }).eq("id", postId).eq("status", "published").select("id,status").maybeSingle();

      if (updated.error || !updated.data) {
        if (stagingPath) await supabase.storage.from("portfolio-staging").remove([stagingPath]);
        throw new Error("Post could not be archived.");
      }
      if (lookup.data.published_path) {
        const removed = await supabase.storage.from("portfolio-published").remove([lookup.data.published_path]);
        if (removed.error) console.error("Archived public file cleanup failed", postId);
      }
      return json({ ok: true, action, post: updated.data });
    }

    return json({ error: "Unsupported action." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected publisher error.";
    console.error("Portfolio publisher request failed", message);
    return json({ error: message }, 400);
  }
});