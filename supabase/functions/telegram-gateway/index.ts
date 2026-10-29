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

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const telegramSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") ?? "";
  const suppliedSecret = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!telegramSecret || !(await matchesSecret(suppliedSecret, telegramSecret))) {
    return json({ error: "Unauthorized." }, 401);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) return json({ error: "Update is too large." }, 413);

  let update: Record<string, unknown>;
  try {
    update = await request.json();
  } catch {
    return json({ error: "Invalid Telegram update." }, 400);
  }

  const message = update.message as Record<string, unknown> | undefined;
  const callback = update.callback_query as Record<string, unknown> | undefined;
  const sender = (message?.from ?? callback?.from) as Record<string, unknown> | undefined;
  const ownerId = Deno.env.get("TELEGRAM_OWNER_ID") ?? "";
  if (!ownerId || String(sender?.id ?? "") !== ownerId) return json({ ok: true, ignored: true });

  const n8nUrl = Deno.env.get("N8N_TELEGRAM_WEBHOOK_URL");
  const n8nSecret = Deno.env.get("N8N_TELEGRAM_WEBHOOK_SECRET");
  if (!n8nUrl || !n8nSecret) return json({ error: "Automation webhook is not configured." }, 500);

  try {
    const forwarded = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${n8nSecret}`,
      },
      body: JSON.stringify(update),
    });
    if (!forwarded.ok) {
      console.error("n8n webhook returned an error", forwarded.status);
      return json({ error: "Automation webhook failed." }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error("n8n webhook request failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Automation webhook is unavailable." }, 502);
  }
});