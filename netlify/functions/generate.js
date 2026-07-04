// netlify/functions/generate.js
// -----------------------------------------------------------------------------
// SnippetForge — secure Netlify serverless proxy to the OpenAI API.
//
// WHY THIS FILE EXISTS:
//   The browser must NEVER see your OpenAI secret key. This function runs on
//   Netlify's servers, reads the key from an environment variable
//   (process.env.OPENAI_API_KEY), calls OpenAI on the client's behalf, and
//   returns ONLY the generated text. The key stays server-side, always.
//
// DEPLOY:
//   Set OPENAI_API_KEY in Netlify → Site configuration → Environment variables.
//   netlify.toml redirects /api/generate  ->  /.netlify/functions/generate,
//   so the SAME frontend fetch('/api/generate') works on Vercel AND Netlify.
//   No npm dependencies — uses the built-in global fetch (Node 18+).
// -----------------------------------------------------------------------------

// Build a tuned prompt per copy "kind" so output length/tone fits search & social.
function buildPrompt(kind, context) {
  const ctx = (context || "").toString().slice(0, 500);
  switch (kind) {
    case "headline":
      return {
        system:
          "You are an expert SEO and social copywriter. Write a single punchy Open Graph share-card headline. Max 60 characters. No quotes, no emoji, no trailing period. Return ONLY the headline.",
        user: `Context / subhead: ${ctx || "a modern web tool"}`,
      };
    case "title":
      return {
        system:
          "You are an expert SEO copywriter. Write a single search-engine <title> tag text. Aim for 50-60 characters so Google will not truncate it. Front-load the primary keyword. No quotes. Return ONLY the title.",
        user: `Page description/context: ${ctx || "a landing page"}`,
      };
    case "description":
      return {
        system:
          "You are an expert SEO copywriter. Write a single compelling meta description. Aim for 140-155 characters. Include the value proposition and a subtle call to action. No quotes. Return ONLY the description.",
        user: `Page title/context: ${ctx || "a landing page"}`,
      };
    default:
      return {
        system:
          "You are an expert SEO and social copywriter. Return concise, high-converting copy with no surrounding quotes.",
        user: ctx || "Write short marketing copy for a web page.",
      };
  }
}

const CORS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function json(status, obj) {
  return new Response(JSON.stringify(obj), { status, headers: CORS });
}

// Netlify Functions (v2) — modern Request/Response handler.
export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(500, {
      error:
        "OPENAI_API_KEY is not configured on the server. Add it in Netlify → Site configuration → Environment variables.",
    });
  }

  try {
    let body = {};
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }
    const { kind = "copy", context = "" } = body || {};
    const { system, user } = buildPrompt(kind, context);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 120,
        temperature: 0.8,
      }),
    });

    if (!openaiRes.ok) {
      const detail = await openaiRes.text();
      return json(502, {
        error: "Upstream OpenAI error",
        status: openaiRes.status,
        detail: detail.slice(0, 500),
      });
    }

    const data = await openaiRes.json();
    let text = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "").trim();
    // strip wrapping quotes the model sometimes adds
    text = text.replace(/^["'“”]+|["'“”]+$/g, "").trim();

    return json(200, { text, kind });
  } catch (err) {
    return json(500, { error: "Server error", detail: String(err).slice(0, 300) });
  }
}
