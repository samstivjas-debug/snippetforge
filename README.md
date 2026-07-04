# ⚡ SnippetForge

**A free, deploy-anywhere SEO & social-preview toolkit** — meta tags, share images, robots.txt, sitemap, and schema, plus optional AI copywriting — that makes every page you publish search-friendly and share-ready in minutes.

Single self-contained `index.html` (no build step) + a secure serverless AI proxy (Vercel **and** Netlify versions) + full deploy config.

---

## 🧰 The 5 core tools (all free)

1. **🖼️ Social Preview & OG Image Maker** — compose a 1200×630 share card on an HTML5 canvas, choose a **layout template** (centered / left-aligned / photo background / minimal), pick colors & emoji, download a pixel-perfect PNG, and copy matching Open Graph + Twitter meta tags.
2. **🏷️ Meta Tag Generator** — live Google **SERP preview**, character-count warnings (title ~60, desc ~155), clean copy-paste `<head>` tags.
3. **🤖 robots.txt Tester & Builder** — add/remove Allow/Disallow rules, sitemap + crawl-delay, and validation that flags dangerous rules like `Disallow: /`.
4. **🗺️ sitemap.xml Generator** — list URLs with optional `lastmod` / `changefreq` / `priority`, get valid `<urlset>` XML with a copy button.
5. **📐 Schema / JSON-LD Generator** — Article, FAQ, Breadcrumb, Product (rating/reviews), Organization, **Event, Recipe, VideoObject, LocalBusiness** — with adaptive forms and standards-compliant `<script type="application/ld+json">` output.

**✨ Optional AI layer** drafts SEO-aware headlines, titles, and meta descriptions via OpenAI — routed through a secure serverless proxy so your key is never exposed.

---

## 📁 Files in this project

| File | What it does |
|------|--------------|
| `index.html` | The entire frontend (inline CSS/JS). No build step. |
| `api/generate.js` | **Vercel** serverless AI proxy. Reads `OPENAI_API_KEY` from env. |
| `netlify/functions/generate.js` | **Netlify** serverless AI proxy. Reads `OPENAI_API_KEY` from env. |
| `vercel.json` | Vercel config (functions + security headers). |
| `netlify.toml` | Netlify config: publish root, functions dir, and `/api/generate` → function redirect. |
| `.env.example` | Template of environment variables. |
| `.gitignore` | Keeps `.env`, `node_modules`, etc. out of git. |
| `README.md` | This guide. |

> The frontend always calls `fetch('/api/generate')`. On Vercel that hits `api/generate.js`; on Netlify the `netlify.toml` redirect points the same path at the Netlify function. **Zero host-specific frontend code.**

---

# 🚀 How to add your API keys and get paid (step-by-step, for non-experts)

You need **two** things to unlock the paid AI features and collect money:

- an **OpenAI API key** (so the ✨ AI buttons work), and
- a **PayPal LIVE Client ID** (so payments land in *your* PayPal balance).

Neither is a "secret in your code": the OpenAI key goes into a host **environment variable**, and the PayPal Client ID is a public value you paste into `index.html`. Follow along. 👇

---

## Step 1 — Get an OpenAI API key

1. Go to **[platform.openai.com/api-keys](https://platform.openai.com/api-keys)** and sign in.
2. Click **“Create new secret key”**, give it a name (e.g. `snippetforge`), and **copy it**. It starts with `sk-`. ⚠️ You only see it once — save it somewhere safe.
3. **Add billing/credit:** OpenAI's API is pay-as-you-go. Add a payment method at **[Billing](https://platform.openai.com/settings/organization/billing)**. Without credit, the API returns errors.

> 🔒 This `sk-…` key is a **secret**. Never paste it into `index.html`, never commit it to git, never share it. It only ever goes into a host environment variable (Step 3).

---

## Step 2 — Put your code on GitHub

1. Create a new GitHub repository.
2. Upload/push **all the files above** to the repo root (they should sit at the top level, not inside a subfolder).

---

## Step 3 — Deploy and add `OPENAI_API_KEY` (pick ONE host)

### Option A — Vercel ▲

1. Go to **[vercel.com/new](https://vercel.com/new)** and **import** your GitHub repo. Framework preset: **Other**. No build command needed.
2. Open **Project → Settings → Environment Variables**.
3. Add a variable:
   - **Name:** `OPENAI_API_KEY`  *(exactly this — all caps, underscore)*
   - **Value:** your `sk-…` key
   - Apply to **Production** (and Preview if you want).
4. Click **Deploy**. Done in ~1 minute.
5. **After changing any env var, click Redeploy** so it takes effect.

`api/generate.js` reads the key via `process.env.OPENAI_API_KEY` and never sends it to the browser.

### Option B — Netlify ◇

1. Go to **[app.netlify.com/start](https://app.netlify.com/start)** → **Import an existing project** → pick your GitHub repo. The included `netlify.toml` sets everything up (publish root + functions folder) — no build command needed.
2. Open **Site configuration → Environment variables** (older UI: *Site settings → Build & deploy → Environment*).
3. Click **Add a variable**:
   - **Key:** `OPENAI_API_KEY`  *(exactly this)*
   - **Value:** your `sk-…` key
4. Click **Deploy site**. 
5. **After changing env vars, trigger a redeploy** (*Deploys → Trigger deploy*).

`netlify/functions/generate.js` reads the key via `process.env.OPENAI_API_KEY`, and `netlify.toml` redirects `/api/generate` to it — so the frontend works unchanged.

> ⚠️ The variable name must be **exactly** `OPENAI_API_KEY`. A typo (e.g. `OPENAI_KEY`) means the AI buttons return an error.

---

## Step 4 — Get your PayPal LIVE Client ID (so money reaches you)

1. Go to **[developer.paypal.com → Apps & Credentials](https://developer.paypal.com/dashboard/applications/live)** and log in with your **PayPal business account**.
2. At the top, switch the toggle from **Sandbox** to **Live**.
3. Under **REST API apps**, click your app (or **Create App**), then **copy the Client ID**.

Now open **`index.html`**, find these two lines near the top of the `<script>` block, and edit them:

```js
// Replace "sb" with your LIVE PayPal Client ID
const PAYPAL_CLIENT_ID = "sb";
// Set your one-time Pro price (USD)
const PRO_PRICE = "9.00";
```

- Replace `"sb"` with your **Live Client ID**.
- Optionally change `PRO_PRICE` to whatever you want to charge.

Payments go **directly to the PayPal account that owns that Live Client ID.** On a successful payment, the buyer's browser unlocks Pro (the AI buttons), stored in `localStorage` on their device.

> The PayPal **Client ID is public** and is *meant* to live in `index.html` — that's normal and safe. There is **no PayPal secret** anywhere in this project.

---

## Step 5 — Test with Sandbox first, then flip to Live

1. **Test safely:** on the same PayPal page, toggle to **Sandbox**, copy the **Sandbox** Client ID, and temporarily set `PAYPAL_CLIENT_ID` to it. Pay using a **[sandbox test buyer account](https://developer.paypal.com/dashboard/accounts)** — no real money moves. Confirm the ✨ AI buttons unlock after payment.
2. **Go live:** switch `PAYPAL_CLIENT_ID` back to your **Live** Client ID, commit, and **redeploy**. Real payments now unlock Pro and land in your balance.

The default placeholder `"sb"` is PayPal's built-in sandbox — fine for a quick smoke test, but it **cannot collect real money**, so replace it before launch.

---

## ⏱️ The whole flow (~5 minutes)

```
push to GitHub
   → import to Vercel (or Netlify)
   → add OPENAI_API_KEY env var
   → swap PAYPAL_CLIENT_ID in index.html for your LIVE id
   → deploy
   → live 🎉
```

Any time you change an env var or the PayPal ID: **redeploy** (Vercel) / **trigger deploy** (Netlify).

---

## 💻 Local development (optional)

The static tools work by just opening `index.html`, but the **AI buttons need the serverless proxy running**, so use a dev server:

**Vercel CLI**
```bash
npm i -g vercel
cp .env.example .env        # then edit .env and paste your real sk-... key
vercel dev                  # serves index.html + /api/generate locally
```

**Netlify CLI**
```bash
npm i -g netlify-cli
cp .env.example .env        # then edit .env and paste your real sk-... key
netlify dev                 # serves index.html + the function + /api/generate redirect
```

> If you open `index.html` directly from disk (`file://`) the AI buttons will show a friendly “needs the deployed proxy” message — that's expected. Deploy, or use `vercel dev` / `netlify dev`.

---

## 🛡️ Security notes

- **OpenAI key** lives **only** in host environment variables and is read server-side by the proxy. It never appears in `index.html`, the browser network tab, or git history (`.gitignore` excludes `.env`).
- **PayPal Client ID** is public by design and belongs in `index.html`. There is no PayPal secret in this project.
- The browser only ever talks to your own `/api/generate` endpoint — never directly to OpenAI.

---

## 📄 License

MIT — free to use, modify, and ship. Attribution appreciated but not required.
