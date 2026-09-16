# RationLens — 2-Day Build & Deploy Plan

**Goal:** a working, deployed demo of the core RationLens loop, ready in ~48 hours for a hackathon *selection* round (not the final build — that comes later if you're picked).

---

## 0. Reality check before you open Cursor

Your spec document is a full production-grade system (16+ feature sections, admin analytics, conflict detection, WhatsApp/SMS, demand heatmaps, etc.). If you try to build all of it in 2 days, you'll ship nothing that works. The spec itself says this in Section 71 — the thing that gets teams selected is **one polished, believable, end-to-end loop**, not feature count.

So this plan deliberately cuts the spec down to a **buildable subset** that still hits every judging criterion in the official SC-09 brief (stock display for several shops, an update method, a credible trust mechanism) plus the differentiators (AI, regional language, verification).

**Build these (MVP — this is your entire 2 days):**
1. Citizen view: 4–5 seeded shops, stock list + map, distance
2. Regional-language text query (English + Malayalam) → AI extracts intent/item → backend does the actual search
3. Shop detail with trust info: last updated, source, verification status
4. "Notify Me" on out-of-stock items → in-app notification when stock changes
5. Shopkeeper login → dashboard for their one shop
6. Manual stock update (status + quantity) and quick +/− buttons
7. Image upload → AI extraction → shopkeeper edits/confirms → publish (this is your single strongest AI + trust demo moment)
8. Audit/history log per stock item

**Explicitly cut — do not start these unless everything above is done and demoed end-to-end with time to spare:**
- Voice input/output
- Admin dashboard, stock-health %, demand analytics/heatmap
- Conflict detection between citizen reports and official stock
- Citizen discrepancy reporting (nice-to-have, cut first if behind)
- Low-stock threshold alerts, saved household items
- SMS/WhatsApp/IVR/USSD, ration-card integration, real government API

If you finish the 8 core items with time left, add discrepancy reporting or low-stock alerts next — they're the cheapest of the "advanced" tier.

---

## 1. Tech stack (optimized for 2 days + Cursor, not for scale)

| Layer | Choice | Why |
|---|---|---|
| Frontend + Backend | **Next.js 14 (App Router) + TypeScript + Tailwind** | One repo, one deploy. API routes give you the "backend" the spec asks for without standing up a separate FastAPI/Express service — halves your setup time. |
| Database + Auth + Storage | **Supabase (Postgres)** | Free managed Postgres, built-in auth with roles, Row Level Security for the "shopkeeper can only edit their shop" requirement, and file storage for stock images — covers spec sections 53–58 (security/privacy) almost for free. |
| Map | **Leaflet + react-leaflet + OpenStreetMap tiles** | Zero API key, zero billing setup, works in an afternoon. (Spec explicitly lists OpenStreetMap as an acceptable option — use it.) |
| AI (language + vision) | **One multimodal LLM API** (Claude or GPT-4o class model) for both: (a) intent/entity extraction from text, (b) image → structured stock data | Using one provider for both jobs means one API key, one client, less integration surface. |
| Deployment | **Vercel** (app) + **Supabase** (DB/storage, already hosted) | `git push` → live URL in minutes. |

This is a deliberate downgrade from the spec's "Python/FastAPI + separate services" recommendation. That architecture is right for the real product; it is not right for 48 hours. Say so plainly if a judge asks — "we chose a monolithic Next.js + Supabase stack for the hackathon timeline; the AI/verification/audit boundaries are still modular internally and map directly onto separate services for production."

---

## 2. Day 1 — Foundation (aim: by end of Day 1, the app works with *zero* AI, just real data)

### Hours 0–1: Project setup
- `npx create-next-app@latest rationlens --typescript --tailwind --app`
- Create a free Supabase project. Grab the URL + anon key + service role key.
- Install: `@supabase/supabase-js`, `@supabase/ssr`, `react-leaflet leaflet`, `date-fns` (for "10 minutes ago" formatting).
- In Cursor: open the repo, paste this whole document into a new file `PROJECT_CONTEXT.md` in the repo root and reference it in your prompts ("read PROJECT_CONTEXT.md, then do X"). This keeps every Cursor session grounded in the same scope instead of drifting back toward the full spec.

### Hours 1–3: Database schema
Run this in the Supabase SQL editor (trimmed from the spec's Section 44 to only what the MVP needs):

```sql
create extension if not exists "uuid-ossp";

create type user_role as enum ('citizen','shopkeeper','admin');
create type stock_status as enum ('available','low_stock','out_of_stock','unknown');
create type verification_status as enum ('shop_verified','ai_assisted','community_report');

create table profiles (
  id uuid primary key references auth.users(id),
  name text,
  role user_role not null default 'citizen',
  language text default 'en',
  shop_id uuid, -- set for shopkeepers
  created_at timestamptz default now()
);

create table shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz default now()
);

create table items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  localized_names jsonb default '{}', -- {"ml": "അരി", "hi": "चावल"}
  unit text default 'kg'
);

create table stock (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id),
  item_id uuid references items(id),
  quantity numeric default 0,
  status stock_status default 'unknown',
  last_updated_at timestamptz default now(),
  verification_status verification_status default 'shop_verified',
  updated_by uuid references profiles(id),
  unique(shop_id, item_id)
);

create table stock_updates ( -- audit log
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id),
  item_id uuid references items(id),
  old_quantity numeric,
  new_quantity numeric,
  old_status stock_status,
  new_status stock_status,
  method text, -- 'manual' | 'quick' | 'ai_image'
  updated_by uuid references profiles(id),
  human_confirmed boolean default true,
  created_at timestamptz default now()
);

create table alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  item_id uuid references items(id),
  shop_id uuid references shops(id),
  status text default 'active', -- 'active' | 'triggered' | 'cancelled'
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  message text,
  read boolean default false,
  created_at timestamptz default now()
);
```

Enable Row Level Security and add a policy so a shopkeeper can only write to `stock`/`stock_updates` rows where `shop_id = their profile.shop_id`. This single policy is your answer to the spec's "server-side + DB-level authorization" requirement (Section 53/M) — don't skip it, it's cheap and it's a real judge question.

### Hours 3–5: Seed data
Insert 4–5 shops with real-ish lat/lng near each other (pick a real town so the map looks credible), 4–6 items (rice, wheat, sugar, kerosene, atta — include Malayalam `localized_names`), and stock rows with **different `last_updated_at` timestamps** (10 min ago, 25 min ago, 2 hours ago) and mixed statuses so the demo shows a genuine spread, not all-green.

### Hours 5–9: Citizen dashboard (no AI yet)
- List view: shop cards with distance (haversine from a hardcoded or browser-geolocation point), each item's status as a colored pill.
- Shop detail page: full stock table + trust block (last updated, formatted as "X minutes ago"; source label; verification badge).
- Map view: Leaflet markers, click → popup with the same shop summary.
- Search box that does a **plain database filter** for now (e.g. typing "rice" filters items) — this is your reminder of the spec's own performance rule (Section R): don't call an LLM for a literal item name, only for natural-language queries. You'll wire the AI path on Day 2 without touching this.

### Hours 9–12: Shopkeeper dashboard (manual path only)
- Simple auth: Supabase email/password login, role check redirects to `/shopkeeper` or `/citizen`.
- Shopkeeper sees only their shop's stock.
- Manual update form: status radio buttons + quantity field + quick +/− buttons.
- Every update writes to `stock` **and** inserts a `stock_updates` row (method = `manual` or `quick`). This audit insert is non-negotiable — do it from hour one so you never demo a system where history can be missing.

**Checkpoint at end of Day 1:** citizen can browse shops/map/stock with trust info, shopkeeper can log in and manually update stock, and every update is audited. Nothing AI-related exists yet. If you're behind schedule, this checkpoint is where you stop cutting scope — everything from here on is what makes RationLens different from a plain inventory app, so protect Day 2 time for it.

---

## 3. Day 2 — AI, trust loop, notifications, deploy

### Hours 0–3: Regional-language query → AI intent extraction
This is the spec's most important architectural rule (Section 6): **the AI never states availability, it only extracts intent; the database answers.**

Add an API route `/api/query` that:
1. Takes raw text (English or Malayalam).
2. Sends it to the LLM with a strict system prompt and forces JSON-only output, e.g.:

```
You extract structured search parameters from a user's ration-shop stock query.
Never state whether an item is in stock — you have no access to real stock data.
Return ONLY this JSON shape, nothing else:
{"language":"en|ml","intent":"check_stock|find_nearby_shop|subscribe_notification","item":"string or null","radius_km": number or null}
```

3. Your API route then runs the **real** database query using the extracted `item`/`intent` and returns actual stock rows — the LLM response is never shown to the user directly.
4. On the frontend, show the parsed intent chip ("Understood: check stock — Rice — nearby") above the real results, exactly like the spec's example — this visibly proves the AI-interprets/DB-answers separation to a judge.

Test with the exact Malayalam example from the spec (`എന്റെ അടുത്തുള്ള റേഷൻ കടയിൽ അരി ഉണ്ടോ?`) until it reliably returns `item: "rice"`.

### Hours 3–7: Image upload → AI extraction → human confirmation → publish
This is your strongest single demo beat — budget real time for it.
- Shopkeeper dashboard: "Update via Image" button → file upload to Supabase Storage (private bucket).
- API route `/api/stock/analyze-image`: sends the image to the multimodal LLM with a prompt like:

```
Extract stock information from this ration shop inventory image.
Return ONLY JSON: {"items":[{"item":"string","quantity":number,"unit":"string"}], "confidence":"high|medium|low"}
If the image is unreadable, blurry, or values are ambiguous, return {"items":[], "confidence":"low"}.
Never invent quantities you cannot read.
```

- This route does **not** touch the `stock` table — it only returns a proposal to the frontend.
- Frontend shows "AI Detected" editable rows (prefilled from the JSON) with `[Edit]` and `[Confirm & Publish]`, matching the spec's Section 17 UI exactly.
- A **separate** route `/api/stock/confirm-analysis` takes the (possibly edited) values and only then writes to `stock` + `stock_updates` (method = `ai_image`, `human_confirmed = true`).
- Handle the low-confidence/empty case: show "Unable to confidently read the stock information — Retake Image / Enter Manually" instead of silently failing.

Prepare 1–2 clean, well-lit sample stock-register photos in advance and test extraction on them repeatedly — don't leave this to demo day.

### Hours 7–9: Trust indicators + notifications loop
- Confirm every stock display shows: status, last-updated ("X minutes ago" via `date-fns`), source (`Authorized Shopkeeper` / `AI-Assisted + Human Confirmed`), verification badge.
- "Notify Me" button on out-of-stock items → inserts into `alerts`.
- When a stock update changes an item from `out_of_stock`/`low_stock` to `available` (do this check inside your update API route, not a background job — you don't have time for job infra), query `alerts` for matching active rows and insert a row into `notifications` for each user, then flip the alert to `triggered`.
- Simple in-app notification bell/list on the citizen side (poll or refetch on page load — a real-time subscription via Supabase is a nice-to-have, not required).

### Hours 9–10: Audit/history view
- On the shop detail page (or a shopkeeper "History" tab), list `stock_updates` rows for that shop: timestamp, item, old→new, method, who, human-confirmed. This directly answers the spec's Section 23/24 requirement and is the payoff line in your demo ("here's proof of how this update happened").

### Hours 10–12: Deploy + demo rehearsal
- Push to GitHub, import into Vercel, set environment variables (Supabase URL/keys, LLM API key).
- Do a full run-through of the loop below on the **deployed** URL, not localhost — deployed environments break things (env vars, image upload paths, CORS) that work locally.
- Re-seed clean demo data right before you rehearse, so the timestamps ("10 minutes ago") are fresh when you actually present.

---

## 4. The demo path to rehearse (condensed from the spec's Section 73)

1. **Problem** (30s): one line on unnecessary travel + outdated info + language barrier.
2. **Citizen query** in Malayalam or English → show the parsed intent chip → nearby shops with distance/status.
3. **Trust**: open a shop, point at last-updated + source + verification.
4. **Notify Me** on an out-of-stock item.
5. **Switch to shopkeeper**, upload the prepared stock image, show AI-extracted values, edit one value on camera to prove it's not blindly trusted, confirm & publish.
6. **Back to citizen**: show the notification that just arrived.
7. **Audit log**: show the history entry proving who/how/when, and say the one line that matters most to judges: *"AI never decided the stock was available — it assisted extraction; the verified database and a human shopkeeper confirmation are what actually update the stock."*

Time this rehearsal — it should land at 3–4 minutes so you have slack for questions.

---

## 5. Cursor workflow notes

- Keep `PROJECT_CONTEXT.md` (this plan, trimmed) in the repo and open it in every Cursor chat/composer session so the agent doesn't reach for the full original spec's scope.
- Work in the same order as the hour blocks above — commit after each working checkpoint so you always have a deployable fallback if a later change breaks something the night before.
- When asking Cursor to implement a feature, name the exact route/table/behavior (e.g. "implement `/api/stock/confirm-analysis`: it writes to `stock` and `stock_updates`, sets `verification_status='ai_assisted'`, and must reject if `human_confirmed` is not explicitly true") — vague prompts are what pull the agent back toward over-building.
- After each of the two checkpoints (end of Day 1, end of Day 2 AI section), manually click through the feature yourself before moving on. Don't trust "it should work" from generated code with this little runway.

---

## 6. If you fall behind

Cut in this order, latest-cut-first meaning cut these last:
1. Cut first: audit history UI (keep the DB inserts, just skip the display page)
2. Cut second: in-app notifications (keep "Notify Me" as a button that just shows "You'll be notified" — even non-functional, it demonstrates the concept)
3. Cut third: map view (list view with distance is enough — mention the map is "in progress" if asked)
4. Never cut: the AI image → human confirmation → publish loop and the trust indicators. That pairing is what separates RationLens from a CRUD app, and it's what the spec's own selection criteria (Section 84.X) center on.
