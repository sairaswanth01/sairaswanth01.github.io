(() => {
    const config = window.PORTFOLIO_CONFIG;
    const supabaseUrl = String(config?.supabaseUrl ?? "").replace(/\/$/, "");
    const anonKey = String(config?.supabaseAnonKey ?? "");

    if (!supabaseUrl || !anonKey) return;

    const sections = {
        certifications: {
            target: document.querySelector(".certifications-container"),
            categories: new Set(["certification", "conference", "award"])
        },
        research: {
            target: document.getElementById("portfolioResearchPosts"),
            categories: new Set(["research_paper", "publication"])
        },
        projects: {
            target: document.querySelector(".projects-grid"),
            categories: new Set(["project"])
        }
    };

    const categoryLabels = {
        certification: "Certification",
        research_paper: "Research paper",
        publication: "Publication",
        conference: "Conference",
        award: "Award",
        project: "Project"
    };

    function setStatus(scope, message) {
        const status = document.querySelector(`[data-feed-status="${scope}"]`);
        if (status) status.textContent = message;
    }

    function makeText(tagName, className, value) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        element.textContent = value;
        return element;
    }

    function safeHttpsUrl(value) {
        if (!value) return "";
        try {
            const url = new URL(value);
            return url.protocol === "https:" ? url.href : "";
        } catch {
            return "";
        }
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime())
            ? ""
            : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
    }

    function makeLink(url, label) {
        const safeUrl = safeHttpsUrl(url);
        if (!safeUrl) return null;
        const link = makeText("a", "", label);
        link.href = safeUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        return link;
    }

    function appendActions(container, post) {
        const actions = document.createElement("div");
        actions.className = "portfolio-post-actions";
        const fileLink = makeLink(
            post.file_url,
            post.file_mime_type === "application/pdf" ? "View PDF" : "View attachment"
        );
        const verificationLink = makeLink(post.verification_url, "Verify");
        if (fileLink) actions.append(fileLink);
        if (verificationLink) actions.append(verificationLink);
        if (actions.childElementCount) container.append(actions);
    }

    function appendTags(container, tags) {
        if (!Array.isArray(tags) || !tags.length) return;
        const tagList = document.createElement("div");
        tagList.className = "portfolio-post-tags";
        tags.forEach((tag) => tagList.append(makeText("span", "", `#${tag}`)));
        container.append(tagList);
    }

    function appendImagePreview(card, post, altText) {
        const imageUrl = safeHttpsUrl(post.thumbnail_url);
        if (!imageUrl) return;
        const link = makeLink(post.file_url || imageUrl, "Open certificate preview");
        if (!link) return;
        link.className = "portfolio-post-preview-link";
        const image = document.createElement("img");
        image.className = "portfolio-post-preview";
        image.src = imageUrl;
        image.alt = altText;
        image.loading = "lazy";
        link.append(image);
        card.append(link);
    }

    function makeAchievementCard(post, index) {
        const card = document.createElement("article");
        card.className = "achievement-card portfolio-dynamic-post";
        card.dataset.postCategory = post.category;
        card.dataset.postSearch = [post.title, post.description, post.organization, ...(post.tags ?? [])]
            .join(" ").toLowerCase();
        card.append(makeText("div", "achievement-number", String(index + 1).padStart(2, "0")));
        appendImagePreview(card, post, `${post.title} certificate`);

        const content = document.createElement("div");
        content.className = "achievement-content";
        content.append(makeText("span", "achievement-type", categoryLabels[post.category] ?? "Achievement"));
        content.append(makeText("h3", "", post.title));
        if (post.organization) content.append(makeText("p", "", post.organization));
        if (post.description) content.append(makeText("p", "", post.description));
        const date = formatDate(post.achievement_date);
        if (date) content.append(makeText("span", "achievement-year", date));
        if (post.credential_id) content.append(makeText("p", "", `Credential ID: ${post.credential_id}`));
        appendTags(content, post.tags);
        appendActions(content, post);
        card.append(content);
        return card;
    }

    function makeResearchCard(post) {
        const card = document.createElement("article");
        card.className = "research-card portfolio-dynamic-post";
        card.dataset.postCategory = post.category;
        card.dataset.postSearch = [post.title, post.description, post.organization, ...(post.tags ?? [])]
            .join(" ").toLowerCase();

        const top = document.createElement("div");
        top.className = "research-card-top";
        top.append(makeText("span", "research-category", categoryLabels[post.category] ?? "Publication"));
        card.append(top, makeText("h3", "", post.title));
        if (post.description) card.append(makeText("p", "", post.description));

        const metadata = document.createElement("div");
        metadata.className = "research-meta";
        if (post.organization) metadata.append(makeText("span", "", post.organization));
        const date = formatDate(post.achievement_date);
        if (date) metadata.append(makeText("span", "", date));
        if (post.credential_id) metadata.append(makeText("span", "", `ID: ${post.credential_id}`));
        if (metadata.childElementCount) card.append(metadata);
        appendTags(card, post.tags);
        appendActions(card, post);
        return card;
    }

    function makeProjectCard(post) {
        const card = document.createElement("article");
        card.className = "project-card glass-card tilt-effect portfolio-dynamic-post";
        card.dataset.category = "project";
        card.dataset.postCategory = post.category;
        card.dataset.postSearch = [post.title, post.description, post.organization, ...(post.tags ?? [])]
            .join(" ").toLowerCase();

        const visual = document.createElement("div");
        visual.className = "project-img";
        const imageUrl = safeHttpsUrl(post.thumbnail_url);
        if (imageUrl) {
            const image = document.createElement("img");
            image.className = "portfolio-project-image";
            image.src = imageUrl;
            image.alt = `${post.title} project preview`;
            image.loading = "lazy";
            visual.append(image);
        }

        const content = document.createElement("div");
        content.className = "project-info";
        content.append(makeText("span", "project-category", categoryLabels.project));
        content.append(makeText("h3", "", post.title));
        if (post.description) content.append(makeText("p", "", post.description));
        if (post.organization) content.append(makeText("p", "", post.organization));
        appendTags(content, post.tags);
        appendActions(content, post);
        card.append(visual, content);
        return card;
    }

    function applyFilters(scope) {
        const section = sections[scope];
        const controls = document.querySelector(`[data-feed-scope="${scope}"]`);
        if (!section?.target || !controls) return;
        const query = controls.querySelector(`[data-feed-search="${scope}"]`)?.value.trim().toLowerCase() ?? "";
        const category = controls.querySelector(`[data-feed-category="${scope}"]`)?.value ?? "";
        section.target.querySelectorAll(".portfolio-dynamic-post").forEach((post) => {
            const matchesQuery = !query || post.dataset.postSearch.includes(query);
            const matchesCategory = !category || post.dataset.postCategory === category;
            post.hidden = !matchesQuery || !matchesCategory;
        });
    }

    function renderPosts(posts) {
        Object.entries(sections).forEach(([scope, section]) => {
            const matchingPosts = posts.filter((post) => section.categories.has(post.category));
            if (!section.target) return;
            section.target.querySelectorAll(".portfolio-dynamic-post").forEach((post) => post.remove());

            matchingPosts.forEach((post, index) => {
                const card = scope === "certifications"
                    ? makeAchievementCard(post, index)
                    : scope === "research"
                        ? makeResearchCard(post)
                        : makeProjectCard(post);
                section.target.append(card);
            });
            setStatus(scope, matchingPosts.length ? "" : "No additional published posts yet.");
            applyFilters(scope);
        });
    }

    async function loadPublishedPosts() {
        Object.keys(sections).forEach((scope) => setStatus(scope, "Loading published posts…"));
        try {
            const endpoint = new URL("/rest/v1/portfolio_posts", supabaseUrl);
            endpoint.searchParams.set("select", "id,title,description,category,organization,achievement_date,credential_id,verification_url,file_url,thumbnail_url,file_mime_type,tags,status,created_at");
            endpoint.searchParams.set("status", "eq.published");
            endpoint.searchParams.set("order", "achievement_date.desc.nullslast,created_at.desc");
            endpoint.searchParams.set("limit", "100");

            const response = await fetch(endpoint, {
                headers: {
                    apikey: anonKey,
                    authorization: `Bearer ${anonKey}`,
                    accept: "application/json"
                }
            });
            if (!response.ok) throw new Error(`Portfolio feed returned ${response.status}.`);
            const posts = await response.json();
            if (!Array.isArray(posts)) throw new Error("Portfolio feed returned an invalid response.");
            renderPosts(posts);
        } catch (error) {
            console.error("Published portfolio feed could not be loaded.", error);
            Object.keys(sections).forEach((scope) => {
                setStatus(scope, "Online posts are temporarily unavailable. Existing portfolio content is still available.");
            });
        }
    }

    document.querySelectorAll("[data-feed-search]").forEach((input) => {
        input.addEventListener("input", () => applyFilters(input.dataset.feedSearch));
    });
    document.querySelectorAll("[data-feed-category]").forEach((select) => {
        select.addEventListener("change", () => applyFilters(select.dataset.feedCategory));
    });

    const validConfigUrl = safeHttpsUrl(supabaseUrl);
    if (validConfigUrl) loadPublishedPosts();
    else console.error("PORTFOLIO_CONFIG.supabaseUrl must be an HTTPS Supabase project URL.");
})();