// Cloudflare Pages Function: POST /api/claude
// Keeps the Anthropic API key on the server so buyers' browsers never see it.
//
// Environment variables (Cloudflare Pages → Settings → Environment variables):
//   ANTHROPIC_API_KEY  required, set as a secret
//   ACCESS_CODES       optional, comma-separated codes; when set, requests must send one
//   MODEL              optional, defaults to claude-opus-5
import Anthropic from "@anthropic-ai/sdk";

const MAX_PROMPT_CHARS = 60000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function codes(env) {
  return String(env.ACCESS_CODES || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

// GET tells the page whether the server is set up and whether it needs an access code.
export function onRequestGet({ env }) {
  return json({ ok: Boolean(env.ANTHROPIC_API_KEY), needsCode: codes(env).length > 0 });
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ code: "not_configured" }, 503);

  const allowed = codes(env);
  if (allowed.length && !allowed.includes(request.headers.get("x-access-code") || "")) {
    return json({ code: "needs_code" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ code: "invalid_request" }, 400);
  }
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt.trim()) return json({ code: "invalid_request" }, 400);
  if (prompt.length > MAX_PROMPT_CHARS) return json({ code: "prompt_too_large" }, 413);

  // "quick" keeps per-line updates fast; "default" is used for the full redesign.
  const effort = body.tier === "quick" ? "low" : "high";
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    const response = await client.beta.messages.create({
      model: env.MODEL || "claude-opus-5",
      max_tokens: 16000,
      output_config: { effort },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{ role: "user", content: prompt }],
    });
    if (response.stop_reason === "refusal") return json({ code: "refused" }, 422);
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    if (!text.trim()) return json({ code: "empty_completion" }, 502);
    return json({ text, truncated: response.stop_reason === "max_tokens" });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ code: "rate_limited" }, 429);
    if (error instanceof Anthropic.AuthenticationError) return json({ code: "not_configured" }, 503);
    if (error instanceof Anthropic.BadRequestError) return json({ code: "invalid_request", message: error.message }, 400);
    return json({ code: "upstream_error" }, 502);
  }
}
