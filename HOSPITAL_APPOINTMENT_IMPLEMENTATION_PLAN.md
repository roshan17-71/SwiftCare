# SwiftCare — Hospital OPD Doctor Appointment Booking Platform
## Complete Implementation Plan (Beginner Edition)

This document is your master guide. Follow it top to bottom, phase by phase. Do not skip ahead. Every phase assumes the previous phases are done and tested.

---

# Architecture Decisions

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Language | JavaScript (`.js` / `.jsx`) — **no TypeScript** |
| Styling | Tailwind CSS |
| Backend | Supabase (managed backend — **no Express, no custom Node server**) |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Database security | Supabase Row Level Security (RLS) |
| Server-side logic | Supabase Edge Functions — only where genuinely required |
| Hosting (frontend) | Vercel or Netlify |
| Hosting (backend) | Supabase (already hosted for you) |
| Version control | Git + GitHub |

### Why this architecture for SwiftCare

SwiftCare is fundamentally a **CRUD + auth + scheduling** app: doctors, slots, and appointments, guarded by login and roles. That is precisely the problem Supabase is built to solve out of the box — a hosted Postgres database, built-in authentication, and auto-generated APIs, all reachable directly from the browser.

Building a separate Express/Node backend would mean re-inventing things Supabase already gives you for free (user signup/login, password hashing, session tokens, database access control) and would double the amount of code a beginner has to maintain. The real security boundary in this project isn't a custom API layer — it's the **database itself**, enforced by RLS. That is why RLS is treated as a first-class, non-optional part of the plan rather than an afterthought.

React + Vite is the simplest modern way to build a single-page app with fast reload times. Tailwind CSS lets you style without writing separate CSS files. TypeScript is intentionally excluded to reduce the beginner learning curve — you can add it later once the app works.

---

# 1. Project Overview

SwiftCare lets a hospital's patients:
- Browse the hospital's doctors
- View a doctor's OPD (Out-Patient Department) availability
- Book a specific time slot with that doctor
- View and manage their own appointments

And lets hospital admins:
- Manage the list of doctors
- Define OPD slots per doctor per date
- View and manage all appointments

SwiftCare is **not** a full Hospital Management System. There is no billing, no payments, no pharmacy, no lab reports, no receptionist role, no multi-branch support in the MVP. It does one thing well: **doctor discovery + OPD slot booking.**

---

# 2. Fixed Technology Stack

- **Frontend:** React 18 + Vite
- **Language:** JavaScript only (`.js`, `.jsx`)
- **Styling:** Tailwind CSS
- **Backend + DB:** Supabase (PostgreSQL, Auth, Auto-APIs, RLS, Storage, Edge Functions)
- **Hosting:** Vercel or Netlify (frontend) + Supabase (backend)
- **Version control:** Git + GitHub

Explicitly **not used**: Express, a standalone Node backend, MongoDB, TypeScript, Redux (unless a real need appears later), microservices, a second auth system.

---

# 3. Architecture

```
 React + Vite  (the app you see in the browser)
       ↓
 Tailwind CSS  (how it looks)
       ↓
 Supabase JavaScript Client  (the messenger)
       ↓
 Supabase
   ├── Supabase Auth              (who is logged in)
   ├── PostgreSQL Database         (where the data lives)
   ├── Auto-generated Database APIs (how the browser reads/writes data)
   ├── Row Level Security (RLS)    (who is allowed to see/change which rows)
   └── Edge Functions              (small bits of server code, used sparingly)
```

**What each piece does, in plain language:**

- **React** — a library for building the buttons, forms, and pages you see. It lets you build the UI out of small reusable pieces called "components."
- **Vite** — the tool that runs your React app on your computer while you build it, and packages it into fast-loading files when you're ready to publish it.
- **Tailwind CSS** — instead of writing CSS files, you add small utility class names directly on your HTML/JSX elements (e.g. `class="bg-blue-500 rounded-lg p-4"`) to style things quickly and consistently.
- **Supabase** — a hosted platform that gives you a real PostgreSQL database, a login system, and instant APIs to read/write that database from your frontend, without writing any backend server code.
- **Supabase Auth** — handles user signup, login, logout, password hashing, and session tokens for you. You never touch or store raw passwords.
- **PostgreSQL** — the actual database engine where all your tables (doctors, slots, appointments, etc.) live. It's a mature, reliable, relational database.
- **Row Level Security (RLS)** — rules you write *inside the database* that say "a patient may only see rows that belong to them" or "only an admin may insert into the doctors table." This protects your data even if someone tries to bypass your React app entirely.
- **Edge Functions** — small pieces of server-side JavaScript that Supabase runs for you, used only when something truly cannot be done safely from the browser (for example, an operation that must be atomic and hidden from the client). SwiftCare uses at most one of these (explained in Section 20).

**Why no separate Express backend is needed:** Supabase's auto-generated database API plus RLS *is* your backend. Any logic that would normally live in an Express route ("check if this slot is free, then book it") can instead live either in a careful database design (unique constraints) or in a single Postgres function called via RPC. This avoids running, hosting, and securing a second server.

---

# 4. User Types

Exactly two roles:

1. **Admin** — hospital staff who manage doctors, slots, and appointments.
2. **Patient** — the general public who register to book appointments.

Role-based access is enforced in two layers: the UI hides things the role shouldn't see, and the **database (RLS)** refuses actions the role shouldn't be allowed to do — even if someone bypasses the UI.

---

# 5. Admin Functionality

### Authentication
- Log in with email/password (Supabase Auth)
- Log out
- Only logged-in admins can reach `/admin/*` routes

### Doctor Management
- Add a doctor (name, photo, specialization, qualification, experience, department, about, OPD info)
- Edit a doctor
- Remove (or deactivate) a doctor
- View the full doctor list

### Slot Management
- Pick a doctor + a date
- Set OPD start time, end time, and slot duration (e.g. 15 minutes)
- System auto-generates the slot list (10:00–10:15, 10:15–10:30, …)
- Edit / delete a slot (only if not booked)
- View which slots are booked vs. free

The system prevents: overlapping slots for the same doctor, invalid time ranges (end before start), duplicate slots, and deleting a slot that's already booked.

### Appointment Management
Admin dashboard shows a table of all appointments: patient name, doctor name, date, time, status — with basic filters (by date, by doctor, by status).

### What the Admin Dashboard contains
- Summary cards: total doctors, today's appointments, upcoming appointments
- Quick links: "Manage Doctors," "Manage Slots," "All Appointments"
- A recent-appointments table

---

# 6. Patient Functionality

### Account
- Register (name, email, password, phone)
- Login / Logout

### Doctors
- Browse all doctors
- Filter/search by specialization or name
- View a doctor's full profile

### Appointment Booking flow
```
Select Doctor → View Doctor Profile → Select Date → View Available Slots
   → Select Slot → Confirm Appointment → Booking Confirmation
```
Patients only ever see **available** slots. The instant a slot is booked, it disappears from every other patient's view and cannot be double-booked (enforced at the database level — see Section 12).

### My Appointments
- View upcoming appointments
- View appointment details
- View past appointments
- Cancel an upcoming appointment (MVP allows this; it frees the slot back up)

### Patients must NOT be able to
- Add/edit/delete doctors
- Create/edit/delete slots
- View or modify another patient's appointment
- Reach any `/admin/*` route
- Change their own role to `admin`

All of the above are enforced by RLS, not just by hiding buttons in the UI.

---

# 7. No Payment Functionality

SwiftCare does **not** include payments, pricing, billing, or checkout of any kind. It is purely for booking OPD time slots. This is intentional and out of scope for the MVP and for any future phase described in this document.

---

# 8. Landing Page

The public landing page includes:
- Hospital name/logo in a header
- A hero section with a short tagline and a **"Book Appointment"** call-to-action
- A short "About the hospital" blurb
- A list of departments/specialties (pulled from the doctors' specializations, or a static list)
- A **Login / Sign In** button
- A simple footer (contact info, address)

Keep it clean and trustworthy — this is the first thing every visitor sees, and its only real job is to funnel visitors into either browsing doctors or logging in.

---

# 9. Authentication

### Step by step

1. **Create the Supabase project** (Phase 2 covers this in detail) — this gives you a project URL and a public "anon" API key.
2. **Configure Supabase Auth** — in the Supabase dashboard, enable "Email" as a sign-in provider (it's on by default). Turn off "Confirm email" while developing locally if you want faster testing, then turn it back on before going live.
3. **Patient registration** — a form collects name, email, password, phone. On submit, call `supabase.auth.signUp()`. Supabase creates a row in its internal `auth.users` table (which you never touch directly) and returns a session.
4. **Patient/Admin login** — call `supabase.auth.signInWithPassword()`. Both roles use the *same* login form; what differs is what the app does with them *after* login (see role detection below).
5. **Logout** — call `supabase.auth.signOut()`.
6. **Session handling** — Supabase stores the session in the browser automatically. On app load, call `supabase.auth.getSession()` and subscribe to `supabase.auth.onAuthStateChange()` so your React app always knows if someone is logged in.
7. **Protected routes** — a `<ProtectedRoute>` component checks "is there a session?" (and for admin routes, "is this user's role admin?") before rendering the page; otherwise it redirects to `/login`.
8. **Role-based access** — after login, the app fetches the user's row from a `profiles` table (see Section 10) to read their `role` (`patient` or `admin`) and redirects them to the right dashboard.
9. **Redirect after login** — patients go to `/patient/dashboard`, admins go to `/admin/dashboard`.
10. **Handling errors** — show a friendly message for wrong password, duplicate email, weak password, etc. (Supabase returns an error object with a `message` field you can display.)

### How the app knows if someone is Patient or Admin

Supabase's own `auth.users` table only knows about login credentials — it knows nothing about hospital-specific roles. So SwiftCare keeps its own `profiles` table with one row per user, including a `role` column. When someone logs in, the app reads their row from `profiles` (matched by their auth user ID) to find out their role.

### Preventing patients from making themselves admin

This is critical, and it is **not** solved in the frontend. It's solved with an RLS policy on the `profiles` table: a user is allowed to `UPDATE` their own row, **but the policy forbids changing the `role` column** (or, more simply: `role` updates are only ever done through the admin dashboard by an *existing* admin, and the RLS `UPDATE` policy for normal users explicitly excludes the `role` column via a `WITH CHECK` clause that requires `role` to stay unchanged). Every policy that needs to check "is this user an admin?" — across all four tables — does so through a single small helper function, `is_admin()`, rather than each policy repeating its own lookup. Full policy SQL, and why the helper function exists, is given in Section 11.

---

# 10. Database Design

Four tables, no more:

### `profiles`
One row per signed-up user (patient or admin), linked 1:1 to Supabase's internal `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. Same value as `auth.users.id` (foreign key). |
| `full_name` | `text` | Not null. |
| `phone` | `text` | Nullable. |
| `role` | `text` | Not null. Default `'patient'`. Constrained to `'patient'` or `'admin'` via a `CHECK` constraint. |
| `created_at` | `timestamptz` | Default `now()`. |

### `doctors`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()`. |
| `full_name` | `text` | Not null. |
| `photo_url` | `text` | Nullable (Supabase Storage URL). |
| `specialization` | `text` | Not null. |
| `qualification` | `text` | Nullable. |
| `experience_years` | `int` | Nullable. |
| `department` | `text` | Nullable. |
| `about` | `text` | Nullable. |
| `is_active` | `boolean` | Default `true` (used instead of hard-deleting doctors). |
| `created_at` | `timestamptz` | Default `now()`. |

### `appointment_slots`
One row per bookable time slot for one doctor on one date.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()`. |
| `doctor_id` | `uuid` | Foreign key → `doctors.id`, not null. |
| `slot_date` | `date` | Not null. |
| `start_time` | `time` | Not null. |
| `end_time` | `time` | Not null. |
| `is_booked` | `boolean` | Default `false`. |
| `created_at` | `timestamptz` | Default `now()`. |

Index + constraint: a **unique index** on `(doctor_id, slot_date, start_time)` — this is what makes duplicate slots impossible at the database level.

### `appointments`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()`. |
| `slot_id` | `uuid` | Foreign key → `appointment_slots.id`, **unique**, not null. |
| `patient_id` | `uuid` | Foreign key → `profiles.id`, not null. |
| `doctor_id` | `uuid` | Foreign key → `doctors.id`, not null (denormalized for easy querying — see below). |
| `status` | `text` | Not null. Default `'booked'`. Constrained to `'booked' \| 'cancelled' \| 'completed'`. |
| `created_at` | `timestamptz` | Default `now()`. |

### Relationships

```
profiles (patient) ──┐
                      ├──▶ appointments ◀──── appointment_slots ◀──── doctors
profiles (admin manages) ─────────────────────────────────────────────┘
```

- One doctor → many slots (`doctors.id` ← `appointment_slots.doctor_id`)
- One slot → at most one appointment (`appointment_slots.id` ← `appointments.slot_id`, marked **unique**)
- One patient → many appointments (`profiles.id` ← `appointments.patient_id`)

### Should `doctor_id` live on `appointments` directly, or only be reachable through `appointment_slots`?

**Recommendation: store it on both**, i.e., `appointments.doctor_id` is a small, deliberate denormalization. Technically you could always look up the doctor by joining through `appointment_slots`, since a slot always belongs to exactly one doctor. But copying `doctor_id` onto the `appointments` row directly makes the admin's "all appointments" table dramatically simpler and faster to query (`SELECT * FROM appointments WHERE doctor_id = ...` instead of a join every time), and it keeps the historical record correct even if a slot row is ever deleted later. The trade-off (needing to make sure the two stay in sync) is handled automatically because both are set once, together, at booking time, and never edited afterward.

---

# 11. Database Security — Row Level Security (RLS)

**In plain language:** RLS is a set of rules you attach directly to a table that say "for this specific user, which rows are you even allowed to see or touch?" It runs inside the database itself, so it works no matter what tool or trick someone uses to talk to your database — a browser dev tools request, a script, anything. Frontend checks alone are not real security, because a user can simply edit the JavaScript running in their own browser or call the API directly. RLS is the real gate.

**How the system knows an admin is really an admin:** every RLS policy that needs to check "is this user an admin?" ultimately looks it up from the `profiles` table using `auth.uid()` (a built-in function that returns the currently logged-in user's ID) — never from anything the client sends. A patient cannot fake being an admin by sending a different header or field.

### The `is_admin()` helper function — and why it exists

You might expect an admin-check policy to just write a subquery like `exists (select 1 from profiles where id = auth.uid() and role = 'admin')` directly inside the policy. That works fine on `doctors`, `appointment_slots`, and `appointments` — but **not** on `profiles` itself: a policy *on* `profiles` that queries `profiles` triggers RLS evaluation on `profiles` all over again, which triggers the same policy again, and so on. Postgres detects this and fails with an "infinite recursion detected in policy" error the first time an admin tries to do anything with their own profile.

The fix — and the pattern SwiftCare uses **everywhere**, not just on `profiles`, for consistency — is a single small helper function marked `security definer`:

```sql
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function is_admin() to authenticated;
```

`security definer` means this function runs with the privileges of the function's *owner* (the database admin role), not the privileges of whoever calls it — which lets it read `profiles` directly, bypassing RLS, for this one narrow, hard-coded lookup. It never takes input from the caller and only ever answers "is the currently logged-in user an admin?", so there's nothing for a patient to manipulate. Every policy below calls `is_admin()` instead of repeating the subquery — this avoids the recursion problem on `profiles`, and keeps the admin-check logic in exactly one place instead of duplicated across four tables' worth of policies.

This function is created once, in **Phase 3**, before any RLS policy is written, precisely because Phase 5's policies depend on it already existing.

Enable RLS on **all four tables**: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`

### `profiles`
- **SELECT**: a user can see their own row; `is_admin()` can see all rows.
- **INSERT**: a row is created automatically on signup (via a trigger — see Phase 4); users don't insert directly.
- **UPDATE**: a user can update their own row, but **not** the `role` column (enforced with a `WITH CHECK` that requires `role = (select role from profiles where id = auth.uid())`, i.e., role must stay the same — this one lookup is safe because it's scoped to the user's own row and isn't part of the *admin* check). Rows where `is_admin()` is true can update any profile, including role.
- **DELETE**: not allowed for regular users; `is_admin()` only, if ever needed.

### `doctors`
- **SELECT**: anyone (including anonymous visitors) can view active doctors — this table is public information.
- **INSERT / UPDATE / DELETE**: only where `is_admin()`.

### `appointment_slots`
- **SELECT**: anyone can view slots (so patients can browse availability before logging in, if desired) — or restrict to logged-in users only, your choice; recommended: logged-in users.
- **INSERT / UPDATE / DELETE**: only where `is_admin()`, *except* the one `UPDATE` that marks a slot `is_booked = true`, which happens automatically as part of the booking function (Section 12) — patients never update this table directly.

### `appointments`
- **SELECT**: a patient can see only rows where `patient_id = auth.uid()`; rows where `is_admin()` is true can see all.
- **INSERT**: a patient can insert a row only where `patient_id = auth.uid()` (can't book on someone else's behalf); this insert only succeeds through the booking function described in Section 12.
- **UPDATE**: a patient can update only their own appointment, and only to set `status = 'cancelled'` (nothing else); rows where `is_admin()` is true can update any appointment (e.g., to `completed`).
- **DELETE**: not allowed for patients; `is_admin()` only if ever needed.

Example policy pattern (repeated per table with the right conditions):

```sql
create policy "Patients view own appointments"
on appointments for select
using (patient_id = auth.uid());

create policy "Admins view all appointments"
on appointments for select
using (is_admin());
```

Notice how much shorter and clearer that second policy is compared to repeating the `profiles` subquery — that readability benefit shows up across every table, not just `profiles`.

Exact, complete SQL for every policy is written out in **Phase 5**.

---

# 12. Appointment & Slot Logic (double-booking prevention)

This is the heart of SwiftCare. Two protections work together:

1. **A unique constraint** on `appointments.slot_id`. Since each appointment row must reference a slot, and that column is unique, the database physically refuses a second row from referencing the same slot. This is your ultimate safety net — even a race condition (two patients clicking "Book" at the exact same millisecond) cannot create two appointments for one slot, because the second `INSERT` will fail with a constraint violation.

2. **A single Postgres function (RPC), `book_slot(slot_id)`**, called via `supabase.rpc('book_slot', { slot_id })` instead of doing a raw two-step "check, then insert" from the frontend. Doing it in one atomic database function (using a transaction) closes the small timing gap that a two-step frontend check would leave open. The function:
   - Locks the target slot row (`SELECT ... FOR UPDATE`)
   - Checks `is_booked = false`; if not, raises an error ("slot already booked")
   - Inserts the appointment row
   - Sets `appointment_slots.is_booked = true`
   - All inside one transaction, so it either fully succeeds or fully fails — no partial state.

Cancelling reverses it: a small function `cancel_appointment(appointment_id)` sets the appointment `status = 'cancelled'` and the related slot `is_booked = false`, again in one transaction.

**Preventing overlapping/duplicate slots:** the unique index on `appointment_slots (doctor_id, slot_date, start_time)` blocks exact duplicates. Overlap validation (e.g., a 10:00–10:20 slot overlapping a 10:15–10:30 slot) is checked in the admin's slot-generation logic before insert — since SwiftCare always **auto-generates** back-to-back, non-overlapping slots from a start time/end time/duration, true overlaps can't normally occur if the generation code is correct; this is confirmed in Phase 8's testing steps.

**Invalid time ranges:** a `CHECK (end_time > start_time)` constraint on `appointment_slots`.

---

# 13. Appointment Status

MVP statuses: **`booked`**, **`cancelled`**, **`completed`**.

- `booked` — default state right after booking.
- `cancelled` — patient (or admin) cancelled; the slot becomes available again.
- `completed` — admin marks this after the OPD visit happened (simple manual action in the admin appointments table).

No "no-show," "rescheduled," or "confirmed/pending" statuses in the MVP — they add complexity without being essential to the core booking flow, and can be added later (Section 25).

---

# 14. Date & Time

- Store dates as PostgreSQL `date` (`slot_date`) and times as `time` (`start_time`, `end_time`) — **not** as combined `timestamptz`, because OPD slots are naturally "this doctor's Tuesday 10:00 slot," independent of timezone math.
- Assume the whole hospital, all doctors, and all patients operate in **one single timezone** (the hospital's local timezone) for the MVP. Do not attempt multi-timezone support — it adds real complexity for zero benefit to a single physical hospital.
- Display times to users exactly as stored (e.g., "10:00 AM – 10:15 AM"), formatted with a small helper function, with no timezone conversion happening anywhere in the app.
- On the frontend, use plain JavaScript `Date` only for the date-picker's *date* portion; never combine it with the browser's local timezone offset when sending it to Supabase — always send the plain `YYYY-MM-DD` string for `slot_date` and `HH:MM` string for times, so nothing gets silently shifted.

---

# 15. Frontend Pages

### Public
1. **Landing Page** — hospital intro + CTA. Data: doctor count/departments (optional). Supabase ops: none required, or a light `SELECT` on doctors for a "meet our doctors" preview.
2. **Login Page** — email/password form. Ops: `signInWithPassword`. States: loading (button spinner), error (bad credentials), success (redirect by role).
3. **Registration Page** — name/email/phone/password form. Ops: `signUp`, which triggers the `profiles` row to be created. States: loading, error (duplicate email/weak password), success (redirect to login or auto-login).

### Patient
4. **Patient Dashboard** — quick links + upcoming appointment summary. Ops: `SELECT` next appointment.
5. **Doctors Page** — grid of `DoctorCard`s, search/filter by specialization. Ops: `SELECT * FROM doctors WHERE is_active`.
6. **Doctor Profile Page** — full doctor bio + "Book Appointment" button. Ops: `SELECT` one doctor by id.
7. **Book Appointment Page** — date picker + available slot grid for the chosen doctor. Ops: `SELECT` slots `WHERE doctor_id = ... AND slot_date = ... AND is_booked = false`.
8. **Booking Confirmation** — shown after a successful `rpc('book_slot', ...)` call; summarizes doctor, date, time.
9. **My Appointments Page** — table/list of the patient's own appointments (upcoming + past tabs), with a Cancel button on upcoming ones. Ops: `SELECT` own appointments; `rpc('cancel_appointment', ...)`.
10. **Appointment Details** — single appointment's full info.

For every page: **loading state** = spinner while data fetches; **empty state** = friendly message ("No doctors found," "You have no appointments yet"); **error state** = readable error text + retry button; **success state** = the populated page or a confirmation message.

### Admin
11. **Admin Dashboard** — summary cards + quick links (Section 5).
12. **Manage Doctors** — table of doctors with Edit/Deactivate actions.
13. **Add Doctor** — form (Section 5's fields). Ops: `INSERT` into `doctors`.
14. **Edit Doctor** — same form pre-filled. Ops: `UPDATE`.
15. **Manage Slots** — pick doctor + date, see existing slots for that date.
16. **Create/Edit Slots** — form: OPD start/end time + duration → generates the slot list; shows a preview before saving. Ops: bulk `INSERT` into `appointment_slots`.
17. **Manage Appointments** — full appointments table, filter by date/doctor/status, "Mark Completed" action. Ops: `SELECT` all appointments (joined with doctor + patient names), `UPDATE status`.

---

# 16. Frontend Components (reusable)

| Component | Reused by |
|---|---|
| `Navbar` | every page |
| `Footer` | every page |
| `Button` | everywhere |
| `Input` | every form |
| `Modal` | confirmations, add/edit forms |
| `DoctorCard` | Doctors Page |
| `DoctorProfile` | Doctor Profile Page |
| `SlotCard` / `SlotGrid` | Book Appointment Page, Manage Slots |
| `AppointmentCard` | My Appointments (patient) |
| `AppointmentTable` | Manage Appointments (admin) |
| `DatePicker` | Book Appointment, Manage Slots |
| `ProtectedRoute` | wraps every patient/admin route |
| `LoadingSpinner` | any data-fetching page |
| `ErrorMessage` | any data-fetching page |
| `ConfirmationDialog` | cancel appointment, delete doctor/slot |

Keep this list — don't add components you don't have a concrete page for yet.

---

# 17. UI/UX

- **Color direction:** a calm, trustworthy palette — a primary blue or teal, neutral grays, a clear green for "available/success" and red for "booked/error/cancel."
- **Typography:** one clean sans-serif font (e.g., the system font stack, or "Inter" via Tailwind's default), larger/bolder for headings, comfortable line-height for body text.
- **Navbar:** logo/name left, nav links + login/avatar right; collapses to a hamburger menu on mobile.
- **Patient dashboard:** card-based layout, generous whitespace.
- **Admin dashboard:** denser, table-heavy layout appropriate for staff use.
- **Doctor cards:** photo, name, specialization, a "View Profile" button.
- **Slot UI:** a clean grid of time-chips; green/available vs. gray/booked, selected slot highlighted.
- **Forms:** labeled inputs, inline validation messages, a clearly disabled/loading submit button while saving.
- **Tables:** zebra striping or subtle row borders, sortable headers where useful.
- **Buttons:** one primary style (filled) + one secondary style (outline) + a destructive style (red) for delete/cancel actions.
- **Alerts:** small colored banners for success/error, dismissible.
- **Loading/empty/error states:** consistent components everywhere (Section 16).
- **Confirmation dialogs:** used before every destructive action (cancel appointment, delete doctor, delete slot).

Functionality first — get every flow working with plain Tailwind defaults before spending time on visual polish (that's Phase 15).

---

# 18. Project Structure

```
swiftcare/
├── src/
│   ├── components/       # small reusable UI pieces (Button, Navbar, DoctorCard, ...)
│   ├── pages/             # one file per page/route (LoginPage.jsx, DoctorsPage.jsx, ...)
│   ├── layouts/           # PatientLayout.jsx, AdminLayout.jsx (shared navbar/sidebar wrappers)
│   ├── routes/            # ProtectedRoute.jsx, route definitions
│   ├── context/           # AuthContext.jsx (holds current user + role, app-wide)
│   ├── hooks/             # useAuth.js, useDoctors.js, useAppointments.js
│   ├── services/          # doctors.js, slots.js, appointments.js — all Supabase queries live here
│   ├── lib/               # supabaseClient.js
│   ├── utils/             # formatDate.js, formatTime.js, validators.js
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── migrations/        # SQL files: table creation, RLS policies, functions
│   └── functions/         # Edge Functions (if any end up being needed)
├── .env.local              # local environment variables (never committed)
├── .env.example             # template showing which variables are needed
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

**Where things live:**
- Supabase client setup → `src/lib/supabaseClient.js`
- All authentication logic (signup/login/logout/session) → `src/context/AuthContext.jsx` + `src/hooks/useAuth.js`
- All database queries → `src/services/*.js` (pages call these functions; pages never write raw Supabase queries inline — this keeps things organized and testable)
- Pages → `src/pages/*.jsx`, one per route
- Protected routes → `src/routes/ProtectedRoute.jsx`
- Reusable hooks → `src/hooks/*.js`
- Small helpers (date/time formatting, form validation) → `src/utils/*.js`

---

# 19. Supabase Client

1. Install: `npm install @supabase/supabase-js`
2. Create `src/lib/supabaseClient.js`:
   ```js
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```
3. **Environment variables** (in `.env.local`, at the project root):
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your-long-anon-public-key
   ```
   Vite only exposes variables prefixed with `VITE_` to the frontend — this is intentional and required.
4. **What's safe to expose vs. not:**
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` **are safe** to ship in frontend code. The "anon" key is a *public*, restricted key — it can only do what your RLS policies allow, nothing more.
   - The **`service_role` key** (shown in the Supabase dashboard) is **never** used in the frontend. It bypasses RLS entirely. It is only ever used inside a secure server context (an Edge Function), never in `.js`/`.jsx` files, and never committed to Git.
5. Every page/service imports `supabase` from `src/lib/supabaseClient.js` to run auth calls (`supabase.auth.*`) or database queries (`supabase.from('doctors').select()`).

---

# 20. API / Data Access

No Express REST API exists in this project. React talks to Supabase directly:

```
React component → src/services/*.js function → supabase-js client → Supabase (Auth / Postgres / RLS)
```

- **Supabase Auth** handles: signup, login, logout, session/token refresh.
- **Supabase database queries** (via `supabase.from('table').select/insert/update/delete()`) handle: doctors, slots, appointments, profiles — all protected by RLS.
- **Supabase Storage** handles: doctor profile photo uploads, in a public `doctor-photos` bucket; the app stores the resulting public URL in `doctors.photo_url`.
- **Supabase Edge Functions**: SwiftCare's MVP does **not strictly require one**, because the booking/cancelling atomicity requirement is fully met by a plain Postgres function called via `.rpc()` (Section 12), which runs inside the database and needs no separate Edge Function. If you later want to send a confirmation email on booking, *that* would be a good, genuine use for a single Edge Function (calling an email provider's API with a secret key that must never reach the browser) — this is listed as a Future feature (Section 25), not part of the MVP.

---

# 21. Security

### MVP Security
- Supabase Auth for all login/signup (no manual password handling, ever)
- RLS enabled and enforced on all four tables, with policies exactly as in Section 11, using the `is_admin()` `security definer` helper for every admin check instead of duplicated per-policy subqueries
- Role stored in `profiles.role`, checked via `auth.uid()` inside RLS policies — never trusted from the client
- `ProtectedRoute` components hiding admin/patient pages from the wrong role (UX layer, backed by RLS as the real enforcement)
- Basic input validation on every form (required fields, valid email format, time ranges)
- Database constraints: unique slot index, unique `appointments.slot_id`, `CHECK` constraints on status/time ranges
- Double-booking prevented via the atomic `book_slot` function + unique constraint (Section 12)
- `.env.local` excluded from Git via `.gitignore`; only the public anon key ships to the browser
- Doctor photos uploaded to a Supabase Storage bucket with an RLS-style storage policy: public read, admin-only write

### Advanced Security / Future Improvements
- CORS lockdown / allowed-origins configuration once a custom domain is live
- Rate limiting login attempts
- CAPTCHA on registration
- Email verification enforced before booking (currently optional/relaxed for easier dev testing)
- More granular audit logging of admin actions
- Automated security testing (Section 24 covers manual RLS testing for the MVP)

---

# 22. Phase-by-Phase Implementation Plan

## Phase 1 — Project Setup

**Objective:** Get a blank React + Vite + Tailwind project running locally.

**Prerequisites:** Node.js and npm installed; a code editor (VS Code recommended); Git installed.

**Step-by-Step Tasks:**
1. Run `npm create vite@latest swiftcare -- --template react`
2. `cd swiftcare && npm install`
3. Install Tailwind: `npm install -D tailwindcss postcss autoprefixer` then `npx tailwindcss init -p`
4. In `tailwind.config.js`, set `content: ["./index.html", "./src/**/*.{js,jsx}"]`
5. In `src/index.css`, replace contents with the three `@tailwind` directives (`base`, `components`, `utilities`)
6. Import `./index.css` in `src/main.jsx`
7. Delete Vite's default boilerplate content in `App.jsx`; replace with a simple "SwiftCare" heading to confirm Tailwind classes render
8. Run `npm run dev` and open the local URL shown in the terminal

**Files/Folders:** entire fresh Vite project; `tailwind.config.js`, `postcss.config.js`, `src/index.css`

**Expected Result:** A blank page showing "SwiftCare" styled with a Tailwind class (e.g., large, bold, colored text).

**How to Test:** Change the Tailwind class on the heading and confirm the browser hot-reloads with the new style.

**Common Beginner Problems:**
- Tailwind classes not applying → check `content` paths in `tailwind.config.js` and that `index.css` is imported in `main.jsx`.
- `npm run dev` port already in use → stop other running dev servers or let Vite pick a new port.

**Completion Checklist:**
- [ ] Vite dev server runs without errors
- [ ] Tailwind classes visibly apply
- [ ] Git repository initialized (`git init`)
- [ ] First commit created

---

## Phase 2 — Supabase Project Setup

**Objective:** Create and configure your Supabase backend project.

**Prerequisites:** Phase 1 complete.

**Step-by-Step Tasks:**
1. Go to supabase.com, sign up/log in, click "New Project."
2. Choose a project name (e.g., `swiftcare`), a strong database password (save it somewhere safe), and a region close to your hospital's location.
3. Wait for the project to finish provisioning.
4. In the dashboard, go to Project Settings → API. Copy the **Project URL** and the **anon public key**.
5. Create `.env.local` in your project root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Section 19).
6. Add `.env.local` to `.gitignore`.
7. Install the client: `npm install @supabase/supabase-js`
8. Create `src/lib/supabaseClient.js` as shown in Section 19.

**Files/Folders:** `.env.local`, `.env.example`, `src/lib/supabaseClient.js`

**Supabase Changes:** new project created; API keys generated.

**Expected Result:** Your React app can import `supabase` with no errors.

**How to Test:** In `App.jsx`, temporarily log `console.log(supabase)` and confirm it prints a client object, not `undefined`.

**Common Beginner Problems:**
- Forgetting the `VITE_` prefix → the variable will be `undefined` in the browser.
- Committing `.env.local` to Git by accident → double check `.gitignore` before your first commit.

**Completion Checklist:**
- [ ] Supabase project created
- [ ] Environment variables set locally
- [ ] Supabase client initializes without error
- [ ] Git commit created (`feat: configure supabase client`)

---

## Phase 3 — Database Design & Migration

**Objective:** Create all four tables with correct types and constraints.

**Prerequisites:** Phase 2 complete.

**Step-by-Step Tasks:**
1. In the Supabase dashboard, open the SQL Editor.
2. Run the SQL to create `profiles`, `doctors`, `appointment_slots`, and `appointments` exactly as designed in Section 10, including all constraints (`CHECK`, `UNIQUE`, foreign keys).
3. Save each `CREATE TABLE` statement into `supabase/migrations/0001_init.sql` in your project (for your own record — you're running it manually in the dashboard for now).
4. Create the `is_admin()` helper function exactly as shown in Section 11, and save it into `supabase/migrations/0002_is_admin_function.sql`. It's created here, in the same phase as the tables, so it already exists by the time Phase 5 writes any RLS policy that depends on it.
5. Confirm all four tables appear in the Table Editor, and confirm `is_admin()` appears under Database → Functions.

**Files/Folders:** `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_is_admin_function.sql`

**Database Changes:** all four tables created; `is_admin()` SECURITY DEFINER function created (used by every RLS policy from Phase 5 onward).

**Expected Result:** Four empty tables visible in the Supabase Table Editor, with correct columns and types, and `is_admin()` listed as a database function.

**How to Test:** Manually insert one test row into `doctors` via the Table Editor UI and confirm it saves. In the SQL Editor, run `select is_admin();` while logged out of the app context — it should run without error and return `false` (no RLS policies exist yet at this point, so this only confirms the function itself is valid).

**Common Beginner Problems:**
- Foreign key errors → create tables in dependency order: `profiles` → `doctors` → `appointment_slots` → `appointments`.
- Forgetting `default gen_random_uuid()` → IDs won't auto-generate; make sure the `pgcrypto` extension is enabled (Supabase usually has it on by default).
- Forgetting `security definer` on `is_admin()`, or forgetting the `grant execute ... to authenticated` line → the function either won't be able to read `profiles` later, or regular users won't be allowed to call it at all.

**Completion Checklist:**
- [ ] All 4 tables exist with correct columns/types
- [ ] Constraints in place (unique slot index, check constraints)
- [ ] Test row inserted successfully
- [ ] `is_admin()` function created and callable
- [ ] Git commit created (`feat: add database schema`)

---

## Phase 4 — Authentication

**Objective:** Working signup/login/logout, with a `profiles` row auto-created on signup.

**Prerequisites:** Phase 3 complete.

**Step-by-Step Tasks:**
1. In Supabase Auth settings, confirm "Email" provider is enabled.
2. Create a Postgres trigger function that inserts a new `profiles` row (with `role = 'patient'` by default) every time a new row appears in `auth.users`.
3. Build `RegistrationPage.jsx` with a form calling `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`.
4. Build `LoginPage.jsx` calling `supabase.auth.signInWithPassword()`.
5. Create `AuthContext.jsx` that loads the session on app start and subscribes to `onAuthStateChange`.
6. Add a Logout button calling `supabase.auth.signOut()`.

**Files/Folders:** `src/pages/RegistrationPage.jsx`, `src/pages/LoginPage.jsx`, `src/context/AuthContext.jsx`, `src/hooks/useAuth.js`

**Supabase Changes:** trigger function + trigger on `auth.users` insert.

**Database Changes:** none beyond the trigger.

**Frontend Changes:** registration/login pages wired to Supabase; global auth context.

**Expected Result:** You can register a new account, see a matching row appear automatically in `profiles`, log out, and log back in.

**How to Test:** Register a test patient account; check the `profiles` table for the new row; log out and log back in successfully.

**Common Beginner Problems:**
- "Email not confirmed" error → disable email confirmation in Supabase Auth settings while developing.
- No `profiles` row appears → check the trigger function was created and attached correctly.

**Completion Checklist:**
- [ ] Registration creates an `auth.users` row and a matching `profiles` row
- [ ] Login/logout work
- [ ] Auth state persists across page refresh
- [ ] Git commit created (`feat: add authentication`)

---

## Phase 5 — Role-Based Access & RLS

**Objective:** Enforce all RLS policies from Section 11; distinguish admin vs. patient in the UI.

**Prerequisites:** Phase 4 complete.

**Step-by-Step Tasks:**
1. Manually promote one test user to `role = 'admin'` directly in the Table Editor (this is the only time you'll set an admin role by hand).
2. Enable RLS on all four tables.
3. Write and run every policy described in Section 11 via the SQL Editor — every admin-check policy calls `is_admin()` (created back in Phase 3), never a raw `exists (select ... from profiles ...)` subquery. This matters most on `profiles` itself, where a raw subquery would cause "infinite recursion detected in policy."
4. Build `ProtectedRoute.jsx` that checks session + role before rendering a page.
5. After login, redirect based on `profiles.role`.

**Files/Folders:** `src/routes/ProtectedRoute.jsx`, `supabase/migrations/0003_rls.sql`

**RLS Changes:** all policies from Section 11 applied, using `is_admin()` for every admin check.

**Frontend Changes:** route protection, role-based redirect.

**Expected Result:** A patient account cannot open `/admin/dashboard` (redirected away); an admin account can.

**How to Test:** Try visiting an admin URL while logged in as a patient — confirm you're redirected. Try updating your own `profiles.role` via the Supabase API test console as a patient — confirm it's rejected. Log in as the admin test account and open their own profile — confirm no "infinite recursion" error appears (this is the specific case `is_admin()` exists to prevent).

**Common Beginner Problems:**
- Forgetting to enable RLS itself (policies silently do nothing until RLS is turned on for the table).
- Policy typos causing "no rows returned" even for legitimate access — re-check `using`/`with check` clauses carefully.
- Seeing "infinite recursion detected in policy" on `profiles` → you (or a copy-pasted example from elsewhere) wrote a raw subquery against `profiles` inside a `profiles` policy instead of calling `is_admin()`. Replace it and re-run the policy.

**Completion Checklist:**
- [ ] RLS enabled on all 4 tables
- [ ] All policies created using `is_admin()` for admin checks, and tested
- [ ] Patients blocked from admin routes
- [ ] Role-escalation attempt blocked
- [ ] No recursion error when an admin accesses their own profile
- [ ] Git commit created (`feat: add rls policies and role based routing`)

---

## Phase 6 — Base UI & Routing

**Objective:** Set up all page routes, layouts, and navigation shells (with placeholder content).

**Prerequisites:** Phase 5 complete.

**Step-by-Step Tasks:**
1. Install React Router: `npm install react-router-dom`
2. Define all routes listed in Section 15 in `App.jsx`.
3. Build `Navbar`, `Footer`, `PatientLayout`, `AdminLayout` components.
4. Wrap patient/admin routes in `ProtectedRoute`.
5. Build the Landing Page's static content (Section 8).

**Files/Folders:** `src/App.jsx`, `src/layouts/*`, `src/components/Navbar.jsx`, `src/components/Footer.jsx`

**Frontend Changes:** full route map with placeholder pages.

**Expected Result:** Every planned URL loads *something* (even a "Coming soon" placeholder), navbar links work, and layouts differ correctly between public/patient/admin.

**How to Test:** Click through every nav link; confirm no broken routes/404s for pages listed in Section 15.

**Common Beginner Problems:**
- Nested route confusion in React Router v6 → use `<Outlet />` inside layouts.

**Completion Checklist:**
- [ ] All routes defined and reachable
- [ ] Layouts render correctly per role
- [ ] Landing page complete
- [ ] Git commit created (`feat: add routing and base layouts`)

---

## Phase 7 — Admin Doctor Management

**Objective:** Admin can add, edit, view, and deactivate doctors.

**Prerequisites:** Phase 6 complete.

**Step-by-Step Tasks:**
1. Create `src/services/doctors.js` with `getDoctors()`, `getDoctorById()`, `createDoctor()`, `updateDoctor()`, `deactivateDoctor()`.
2. Build `ManageDoctorsPage.jsx` (table + "Add Doctor" button).
3. Build `AddDoctorPage.jsx` / `EditDoctorPage.jsx` forms.
4. Set up a public Supabase Storage bucket `doctor-photos`; wire photo upload into the form.
5. Wire all UI actions to the service functions.

**Files/Folders:** `src/services/doctors.js`, `src/pages/admin/ManageDoctorsPage.jsx`, `AddDoctorPage.jsx`, `EditDoctorPage.jsx`

**Supabase Changes:** Storage bucket `doctor-photos` created (public read, admin-only write policy).

**Frontend Changes:** full doctor CRUD UI.

**Expected Result:** Logging in as admin, you can add a doctor with a photo, see it in the list, edit it, and deactivate it.

**How to Test:** Add 2–3 test doctors; edit one; deactivate one and confirm it disappears from the patient-facing Doctors Page (Phase 9) once built.

**Common Beginner Problems:**
- Storage upload succeeds but `photo_url` doesn't save → make sure you save the *public URL* returned after upload, not the internal file path.

**Completion Checklist:**
- [ ] Admin can add/edit/deactivate doctors
- [ ] Photo upload works
- [ ] Git commit created (`feat: add doctor management`)

---

## Phase 8 — Admin Slot Management

**Objective:** Admin can generate, view, and delete appointment slots for a doctor/date.

**Prerequisites:** Phase 7 complete.

**Step-by-Step Tasks:**
1. Create `src/services/slots.js` with `getSlotsForDoctorAndDate()`, `createSlots(bulk)`, `deleteSlot()`.
2. Build `ManageSlotsPage.jsx`: doctor dropdown + date picker → shows existing slots for that day.
3. Build the "Create Slots" form: OPD start time, end time, duration → client-side generates the list of time ranges, previews them, then bulk-inserts on confirm.
4. Validate: end time after start time; duration > 0; no duplicate slot (handled by the DB unique index, but show a friendly error if the insert fails).
5. Add delete for un-booked slots only (disable delete button if `is_booked = true`).

**Files/Folders:** `src/services/slots.js`, `src/pages/admin/ManageSlotsPage.jsx`, `CreateSlotsForm.jsx`

**Database Changes:** none (schema already in place from Phase 3).

**Frontend Changes:** full slot management UI.

**Expected Result:** Admin picks Dr. X + 25 Sept, sets 10:00–13:00 / 15 min, previews 12 generated slots, saves them, and sees them listed.

**How to Test:** Try creating the same slot set twice — confirm the duplicate insert is rejected. Try an end time before the start time — confirm client-side validation blocks it.

**Common Beginner Problems:**
- Off-by-one slot generation (an extra or missing final slot) → generate slots while `current_start + duration <= end_time`.

**Completion Checklist:**
- [ ] Slots generate correctly from OPD start/end/duration
- [ ] Duplicate slots rejected
- [ ] Invalid time ranges rejected
- [ ] Un-booked slots can be deleted; booked ones cannot
- [ ] Git commit created (`feat: add appointment slot management`)

---

## Phase 9 — Patient Doctor Browsing

**Objective:** Patients can view and search doctors and open a doctor's profile.

**Prerequisites:** Phase 7 complete (doctors must exist to browse).

**Step-by-Step Tasks:**
1. Build `DoctorsPage.jsx` using `getDoctors()` (only `is_active = true`), rendered as `DoctorCard`s.
2. Add a simple text search/specialization filter (client-side filter over the fetched list is fine for MVP scale).
3. Build `DoctorProfilePage.jsx` with full bio + "Book Appointment" button linking to Phase 10's page.

**Files/Folders:** `src/pages/patient/DoctorsPage.jsx`, `DoctorProfilePage.jsx`, `src/components/DoctorCard.jsx`

**Frontend Changes:** doctor browsing UI complete.

**Expected Result:** A logged-in patient sees the doctors added in Phase 7, can filter them, and open a full profile.

**How to Test:** Deactivate a doctor as admin; confirm they disappear from this page.

**Common Beginner Problems:**
- Forgetting the `is_active` filter, showing deactivated doctors.

**Completion Checklist:**
- [ ] Doctor list loads and filters correctly
- [ ] Doctor profile page shows full details
- [ ] Git commit created (`feat: add patient doctor browsing`)

---

## Phase 10 — Appointment Booking

**Objective:** Patients can pick a date, see real available slots, and book one — with double-booking prevented at the database level.

**Prerequisites:** Phases 5, 8, and 9 complete.

**Step-by-Step Tasks:**
1. Write the `book_slot(p_slot_id uuid)` Postgres function described in Section 12 (transaction: lock slot → check `is_booked` → insert appointment → mark slot booked) via the SQL Editor.
2. Grant `execute` on this function to authenticated users.
3. Create `src/services/appointments.js` with `getAvailableSlots(doctorId, date)` and `bookSlot(slotId)` (calls `supabase.rpc('book_slot', { p_slot_id: slotId })`).
4. Build `BookAppointmentPage.jsx`: date picker → fetch available slots for that doctor/date → `SlotGrid` → confirm dialog → call `bookSlot`.
5. Build `BookingConfirmationPage.jsx` shown on success.

**Files/Folders:** `src/services/appointments.js`, `src/pages/patient/BookAppointmentPage.jsx`, `BookingConfirmationPage.jsx`, `src/components/SlotCard.jsx`

**Supabase Changes:** `book_slot` RPC function created.

**Database Changes:** none beyond the function.

**Frontend Changes:** full booking flow.

**Expected Result:** Patient picks a doctor + date, sees only free slots, books one, and lands on a confirmation page. The slot disappears for everyone else immediately.

**How to Test:** Open two browser sessions (e.g., normal + incognito) logged in as two different patients; have both try to book the same slot at nearly the same time — confirm only one succeeds and the other gets a friendly "slot no longer available" error.

**Common Beginner Problems:**
- Calling `bookSlot` via a plain two-step `select` + `insert` from the frontend instead of the RPC function — this reopens the double-booking race condition. Always use the RPC.

**Completion Checklist:**
- [ ] Only available slots are shown to patients
- [ ] Booking succeeds and updates the slot to booked
- [ ] Simultaneous booking attempts on the same slot: only one wins
- [ ] Git commit created (`feat: add appointment booking`)

---

## Phase 11 — Patient Dashboard & My Appointments

**Objective:** Patients can view and cancel their own appointments.

**Prerequisites:** Phase 10 complete.

**Step-by-Step Tasks:**
1. Write the `cancel_appointment(p_appointment_id uuid)` function (sets `status = 'cancelled'`, frees the related slot) via the SQL Editor.
2. Add `getMyAppointments()` and `cancelAppointment()` to `src/services/appointments.js`.
3. Build `MyAppointmentsPage.jsx` with Upcoming/Past tabs and a Cancel button (behind a `ConfirmationDialog`).
4. Build `AppointmentDetailsPage.jsx`.
5. Fill in `PatientDashboardPage.jsx` with a summary of the next upcoming appointment.

**Files/Folders:** `src/pages/patient/MyAppointmentsPage.jsx`, `AppointmentDetailsPage.jsx`, `PatientDashboardPage.jsx`

**Supabase Changes:** `cancel_appointment` RPC function created.

**Frontend Changes:** patient appointment management complete.

**Expected Result:** Patient sees their booked appointment, cancels it, and the slot becomes bookable again for anyone.

**How to Test:** Book, then cancel, then confirm the same slot reappears as available in Phase 10's booking page.

**Completion Checklist:**
- [ ] Patient sees own appointments only (never someone else's)
- [ ] Cancel works and frees the slot
- [ ] Git commit created (`feat: add patient appointment dashboard`)

---

## Phase 12 — Admin Appointment Management

**Objective:** Admin can view all appointments and mark them completed.

**Prerequisites:** Phase 10 complete.

**Step-by-Step Tasks:**
1. Add `getAllAppointments()` and `markCompleted()` to `src/services/appointments.js` (admin-only calls, protected by RLS anyway).
2. Build `ManageAppointmentsPage.jsx`: table joined with doctor + patient names, filters by date/doctor/status.
3. Wire "Mark Completed" action.
4. Fill in `AdminDashboardPage.jsx` summary cards using simple counts.

**Files/Folders:** `src/pages/admin/ManageAppointmentsPage.jsx`, `AdminDashboardPage.jsx`

**Frontend Changes:** admin appointment oversight complete.

**Expected Result:** Admin sees every appointment across every patient/doctor, can filter, and can mark a past appointment completed.

**How to Test:** Confirm a patient account cannot reach this page or call `getAllAppointments()` successfully (RLS should block it even if attempted directly).

**Completion Checklist:**
- [ ] Admin sees all appointments with filters
- [ ] Mark-completed works
- [ ] Patient access to this data is blocked
- [ ] Git commit created (`feat: add admin appointment management`)

---

## Phase 13 — Security & Validation Pass

**Objective:** Dedicated pass to double-check every security requirement from Section 21.

**Prerequisites:** Phases 1–12 complete.

**Step-by-Step Tasks:**
1. Re-read every RLS policy against Section 11 and re-test each one.
2. Add/verify client-side form validation everywhere (required fields, email format, time ranges).
3. Confirm `.env.local` was never committed (`git log --all --full-history -- .env.local` should show nothing).
4. Confirm the `service_role` key appears nowhere in the frontend codebase.
5. Re-test the role-escalation attempt from Phase 5.

**Files/Folders:** touches most files lightly; no new pages.

**Expected Result:** A written checklist (this phase's checklist) fully passes.

**How to Test:** Section 24's Security checklist, run manually end-to-end.

**Completion Checklist:**
- [ ] All RLS policies re-verified
- [ ] No secrets in frontend code or Git history
- [ ] Form validation present on every input
- [ ] Git commit created (`fix: security and validation pass`)

---

## Phase 14 — Testing

**Objective:** Run the full manual test plan from Section 24 end-to-end.

**Prerequisites:** Phase 13 complete.

**Step-by-Step Tasks:** Work through every checklist item in Section 24, in order, using at least two real test accounts (one patient, one admin) and a second patient account for the double-booking/isolation tests.

**Expected Result:** Every test in Section 24 passes.

**Completion Checklist:**
- [ ] Authentication tests pass
- [ ] Authorization tests pass
- [ ] Doctor tests pass
- [ ] Slot tests pass
- [ ] Appointment tests pass
- [ ] Security tests pass
- [ ] Git commit created (`test: full manual test pass`)

---

## Phase 15 — UI Polish

**Objective:** Apply the visual direction from Section 17 consistently across the whole app.

**Prerequisites:** Phase 14 complete (don't polish a broken app).

**Step-by-Step Tasks:**
1. Standardize spacing, colors, and typography using shared Tailwind utility patterns (consider extracting repeated class combos into the `Button`/`Input` components).
2. Add empty/loading/error states anywhere still missing one.
3. Mobile-check every page at a narrow viewport width.
4. Add basic accessibility passes: labels on inputs, sufficient color contrast, focus states on interactive elements.

**Expected Result:** The app looks and feels consistent, professional, and usable on mobile.

**Completion Checklist:**
- [ ] Consistent styling across all pages
- [ ] Mobile layout checked
- [ ] Accessibility basics checked
- [ ] Git commit created (`style: ui polish pass`)

---

## Phase 16 — Deployment

**Objective:** Ship SwiftCare to production.

**Prerequisites:** Phase 15 complete. Full details in Section 26.

**Step-by-Step Tasks:** See Section 26 in full.

**Expected Result:** SwiftCare is live at a public URL, fully functional, with production RLS and auth redirect URLs configured.

**Completion Checklist:**
- [ ] Deployed and reachable publicly
- [ ] Production auth tested
- [ ] Production booking flow tested end-to-end
- [ ] Git commit + tag created (`chore: v1.0 deployment`)

---

# 23. Git Workflow

Recommended cycle, repeated for every phase above:

1. Finish the phase's tasks.
2. Test it manually (using that phase's "How to Test" section).
3. Fix anything broken.
4. Review your changes: `git status` and `git diff`.
5. Commit with a clear message.
6. Move to the next phase.

**Commit when:** a phase (or a clearly working sub-step within a large phase) is functional and tested — never commit broken, half-working code as a checkpoint you'd want to roll back to.

**Suggested commit messages** (matching the phases above):
```
feat: setup react, vite, and tailwind
feat: configure supabase client
feat: add database schema
feat: add authentication
feat: add rls policies and role based routing
feat: add routing and base layouts
feat: add doctor management
feat: add appointment slot management
feat: add patient doctor browsing
feat: add appointment booking
feat: add patient appointment dashboard
feat: add admin appointment management
fix: security and validation pass
test: full manual test pass
style: ui polish pass
chore: v1.0 deployment
```

Push to GitHub regularly (`git push`) so your work is backed up.

---

# 24. Testing Plan

### Authentication
- [ ] Patient can register
- [ ] Patient can log in
- [ ] Admin can log in
- [ ] Invalid credentials show a clear error
- [ ] Logout clears the session
- [ ] Refreshing the page keeps you logged in

### Authorization
- [ ] Patient cannot open `/admin/*` (redirected)
- [ ] Patient's direct API call to an admin-only operation is rejected by RLS
- [ ] Logged-out user hitting a protected route is redirected to login
- [ ] Patient cannot change their own `role` to `admin`

### Doctors
- [ ] Admin can add a doctor
- [ ] Admin can edit a doctor
- [ ] Admin can deactivate a doctor
- [ ] Deactivated doctor disappears from patient view
- [ ] Invalid doctor form data is rejected client-side

### Slots
- [ ] Admin can generate slots from OPD start/end/duration
- [ ] Admin can edit/delete an un-booked slot
- [ ] Invalid time range (end before start) is rejected
- [ ] Duplicate slot creation is rejected
- [ ] Booked slots cannot be deleted

### Appointments
- [ ] Patient can book an available slot
- [ ] Booking an already-booked slot fails with a clear message
- [ ] Two patients racing for the same slot: only one wins
- [ ] Patient can cancel their own appointment; slot reopens
- [ ] Patient can view their own appointment details
- [ ] Admin can view and filter all appointments
- [ ] Admin can mark an appointment completed

### Security
- [ ] Each RLS policy from Section 11 individually verified (try the disallowed action and confirm it's rejected)
- [ ] Unauthorized direct database access attempts fail
- [ ] Unauthorized modification attempts fail
- [ ] Role-escalation attempt fails

**What to automate later:** once the MVP is stable, the best first automated tests to add are for the booking race condition (Phase 10) and the RLS policies (Section 11), since those are the highest-risk areas if something regresses. Everything else can stay manual for a project this size.

---

# 25. MVP vs. Future Features

### MVP (build all of this, nothing more)
Landing page, patient registration/login, admin login, doctor management + profiles, OPD slot generation/management, patient doctor browsing, slot booking with double-booking prevention, patient appointment view/cancel, admin appointment view/complete, RLS on all tables, deployment.

### Future / Optional (do not build now)
- Email/SMS notifications and appointment reminders
- Recurring doctor schedules (auto-generate slots weekly)
- Department management as its own entity
- Doctor login/portal
- Receptionist role
- Reports/analytics dashboards
- Advanced doctor search (ratings, availability-based search)
- Richer patient profile (medical history, etc.)
- Multi-branch hospital support
- Doctor leave/holiday management

Keep every one of these out of the MVP — they don't block a working booking platform, and adding them early is the single biggest risk to actually finishing.

---

# 26. Deployment

**Frontend:** Vercel or Netlify. **Backend:** already hosted by Supabase — nothing to deploy there beyond your SQL migrations, which you've already run.

1. Push your project to GitHub (`git remote add origin ...`, `git push -u origin main`).
2. Confirm `npm run build` completes locally with no errors (this creates a production build).
3. On Vercel/Netlify, "Import Project" from your GitHub repo.
4. Set the framework preset to Vite (usually auto-detected).
5. Add environment variables in the hosting dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (same values as local, or a separate production Supabase project if you want full isolation).
6. In Supabase → Authentication → URL Configuration, add your production URL (e.g., `https://swiftcare.vercel.app`) to the **Site URL** and **Redirect URLs**.
7. Trigger the deploy.
8. Once live, test registration/login against the production URL.
9. Test doctor management as admin in production.
10. Test the full booking flow in production, including the double-booking scenario from Phase 10.
11. Re-verify RLS in production the same way you did in Phase 13, using two real production accounts.

**Development vs. production environment variables:** keep two separate `.env` files (or two separate hosting-dashboard variable sets) — `.env.local` for your machine, and the hosting platform's own environment variable settings for production. Never hardcode either set of values directly into your source code.

---

# 27. Common Beginner Mistakes

- Putting the `service_role` secret key in frontend code
- Forgetting to enable RLS after writing policies (policies do nothing until RLS is turned on)
- Writing a raw `exists (select ... from profiles ...)` subquery inside a `profiles` policy instead of using the `is_admin()` helper — this causes "infinite recursion detected in policy" the moment an admin touches their own row
- Trusting the frontend alone for authorization (always double-check with RLS)
- Trying to hash/store passwords manually instead of using Supabase Auth
- Allowing a patient's own profile update to touch the `role` column
- Booking slots with a plain two-step check-then-insert instead of the atomic RPC function (reopens double-booking)
- Wrong or missing foreign keys, breaking joins later
- Mixing timezones by storing full `timestamptz` values for what should be plain `date`/`time`
- Forgetting to add the production URL to Supabase's Auth redirect URL settings after deploying
- Typos in environment variable names (must start with `VITE_` to reach the frontend)
- Trying to build Phase 10 (booking) before Phases 7–9 (doctors, slots, browsing) are solid
- Not committing to Git after each working phase, making it hard to roll back a mistake

---

# 28. Development Checkpoints

- **Checkpoint 1:** React app starts successfully (Phase 1)
- **Checkpoint 2:** Supabase project connected (Phase 2)
- **Checkpoint 3:** Database tables + RLS work (Phases 3, 5)
- **Checkpoint 4:** Patient can register/login (Phase 4)
- **Checkpoint 5:** Admin can login (Phase 5)
- **Checkpoint 6:** Admin can create doctors (Phase 7)
- **Checkpoint 7:** Admin can create slots (Phase 8)
- **Checkpoint 8:** Patient can browse doctors (Phase 9)
- **Checkpoint 9:** Patient can book an available slot (Phase 10)
- **Checkpoint 10:** Admin can see all appointments (Phase 12)
- **Checkpoint 11:** Patient can see their own appointments (Phase 11)
- **Checkpoint 12:** Double booking is prevented (Phase 10 test)
- **Checkpoint 13:** Application is deployed (Phase 16)

If something breaks, find the last checkpoint that still worked and start debugging from there.

---

# BEGINNER STARTING POINT

Open this file tomorrow and do exactly this, in order:

1. **First task:** Install Node.js if you haven't already (check with `node -v` in your terminal). Then run `npm create vite@latest swiftcare -- --template react` in the folder where you keep your projects.
2. **Second task:** `cd swiftcare`, run `npm install`, then run `npm run dev` and confirm a default Vite+React page opens in your browser.
3. **Third task:** Follow **Phase 1** exactly (install and configure Tailwind CSS, confirm styled text renders).
4. **What I should verify before stopping for the day:** the dev server runs with no red errors in the terminal, and a Tailwind-styled "SwiftCare" heading appears in the browser.
5. **What files should exist:** the full default Vite project structure, plus `tailwind.config.js`, `postcss.config.js`, and an updated `src/index.css` with the three `@tailwind` directives.
6. **What should be working before moving to Phase 2:** the local dev server, hot reload, and visible Tailwind styling — all three, reliably, before touching Supabase at all.
7. **First Git commit:**
   ```
   git init
   git add .
   git commit -m "feat: setup react, vite, and tailwind"
   ```

Once that's done, come back to this file and start **Phase 2 — Supabase Project Setup**.
