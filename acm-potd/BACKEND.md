# POTD Backend Architecture

This document describes how to migrate from the local `problems.json` data source
to a production backend when the team is ready.

---

## Recommended Stack

| Layer        | Tool           | Reason                                               |
|---|---|---|
| Database     | Supabase       | Managed PostgreSQL, built-in auth, REST API, RLS     |
| Auth         | Supabase Auth  | Email/password for admins, no custom auth server     |
| Admin UI     | React (this app, gated routes) | Team uploads via form, not raw SQL |
| Frontend     | This Vite app  | Reads from Supabase REST instead of JSON             |
| Deployment   | Vercel         | Auto-deploy on push, free tier                       |

---

## Database Schema

```sql
-- Events table
create table events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,               -- "Spring 2026"
  is_active   boolean not null default false,
  created_at  timestamptz default now()
);

-- Phases table (3 rows per event)
create table phases (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  name        text not null check (name in ('beginner','intermediate','advanced')),
  start_date  date not null,
  end_date    date not null,
  created_at  timestamptz default now(),
  unique(event_id, name)
);

-- Problems table
create table problems (
  id           uuid primary key default gen_random_uuid(),
  phase_id     uuid not null references phases(id) on delete cascade,
  day          integer not null,
  date         date not null,
  title        text not null,
  problem_url  text not null,              -- LeetCode / Codeforces etc.
  solution_url text not null,              -- Hugo site page URL
  is_published boolean not null default false,
  uploaded_by  uuid references auth.users(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(phase_id, day),
  unique(phase_id, date)
);

-- User roles (extends Supabase auth.users)
create table user_roles (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  role     text not null check (role in ('admin','member'))
);
```

---

## Row Level Security (RLS)

Enable RLS on all tables. Apply the following policies:

```sql
-- Anyone can read published problems
create policy "public read problems"
  on problems for select
  using (is_published = true);

-- Members and admins can read drafts
create policy "team read drafts"
  on problems for select
  using (
    exists (select 1 from user_roles where user_id = auth.uid())
  );

-- Members and admins can insert problems
create policy "team insert problems"
  on problems for insert
  with check (
    exists (select 1 from user_roles where user_id = auth.uid())
  );

-- Members can update their own; admins can update any
create policy "team update problems"
  on problems for update
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from user_roles where user_id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can delete
create policy "admin delete problems"
  on problems for delete
  using (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role = 'admin'
    )
  );

-- Events and phases: public read, admin write
create policy "public read events" on events for select using (true);
create policy "public read phases" on phases for select using (true);

create policy "admin manage events"
  on events for all
  using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "admin manage phases"
  on phases for all
  using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );
```

---

## Migrating the Frontend

Replace `fetch('/data/problems.json')` in `src/hooks/useProblems.js` with
Supabase client queries:

```js
// 1. Install: npm install @supabase/supabase-js
// 2. Create src/lib/supabase.js:
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// 3. Replace the fetch in useProblems.js with:
const { data: events } = await supabase.from('events').select('*')
const { data: phases  } = await supabase.from('phases').select('*')
const { data: problems } = await supabase
  .from('problems')
  .select('*, phases(event_id, name, start_date, end_date)')
  .eq('is_published', true)
```

Add a `.env.local` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Admin Workflow (Protected Routes)

Add `/admin/*` routes to `App.jsx` guarded by a Supabase session check.
The admin UI needs these pages:

| Route                  | Purpose                                      |
|---|---|
| `/admin/login`         | Email/password sign-in via Supabase Auth     |
| `/admin`               | Dashboard: active event, this week's problems|
| `/admin/upload`        | Form: date, title, problem URL, solution URL, draft/publish toggle |
| `/admin/problems`      | Table of all problems with edit/delete        |
| `/admin/phases`        | Toggle active phase, set phase date ranges    |
| `/admin/events`        | Create new event (name + phase dates)        |

The upload form maps directly to an `INSERT` on the `problems` table.
The published toggle maps to `UPDATE problems SET is_published = true`.

---

## Hugo Solution Site

The `solution_url` field in every problem points to a static Hugo site
(e.g., `https://solutions.acmigdtuw.com`).

Hugo site structure recommendation:
```
content/
  spring-2026/
    beginner/
      day-1.md    ← front matter: title, date, phase, problem_url
      day-2.md
    intermediate/
      day-1.md
  fall-2025/
    ...
```

This site is deployed separately (Vercel or GitHub Pages).
The POTD React app never fetches from it — it only links to it.

---

## Running a New Event

1. Insert 1 row into `events` with the new name
2. Insert 3 rows into `phases` (beginner / intermediate / advanced) with date ranges
3. Set the new event's `is_active = true`, old event `is_active = false`
4. Start uploading problems daily via the admin UI

No code changes required.

---

## Deployment

```
acm-potd (this repo)
  └── Vercel project
        ├── Build command: npm run build
        ├── Output dir:    dist
        └── Root dir:      /   (repo root)

Supabase Cloud (free tier)
  └── PostgreSQL DB
        ├── events / phases / problems tables
        └── auth.users + user_roles

Hugo solutions site
  └── Separate Vercel or GitHub Pages deployment
        └── Custom domain: solutions.acmigdtuw.com
```
