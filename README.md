# SplitTab

SplitTab is a clean, mobile-first expense tracker for shared spending with friends. Add people, record who paid, see the running balance, settle up, and share a polished invoice image when it is time to collect or pay back.

It works without an account using local storage, and can sync across devices with Google sign-in and Supabase.

> Made by **Varad Annadate**

## Current Release

**v3.3.1**

This release focuses on making balances easier to understand and close:

- Home summary for net balance, total owed to you, and total you owe
- Transaction editing
- Settle-up action for clearing a balance
- Live transaction preview before saving
- Cleaner lint/build health

## Highlights

- **Friend profiles**: Create a separate split ledger for each friend.
- **Fast transaction logging**: Record whether you paid for them or they paid for you.
- **Clear balances**: See who owes whom at a glance.
- **Settle up**: Add a settlement transaction when a balance is paid back.
- **Editable history**: Fix transaction amounts, notes, dates, or direction after saving.
- **Shareable invoice image**: Generate a clean PNG bill summary for WhatsApp, iMessage, or any chat app.
- **Offline-first**: Use the app without signing in.
- **Cloud sync**: Sign in with Google to store data in Supabase.
- **PWA-ready**: Install it on a phone home screen for an app-like experience.

## Why SplitTab?

Most expense apps are either too heavy for quick personal splits or too simple to trust when money is involved. SplitTab sits in the middle: it keeps the daily flow light, but still gives you summaries, editable records, settlement tracking, and a shareable invoice when you need proof.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite |
| Styling | Vanilla CSS |
| State | React hooks, localStorage |
| Auth | Supabase Auth with Google OAuth |
| Database | Supabase Postgres with Row Level Security |
| Export | html-to-image |
| App install | Web App Manifest, iOS home screen support |

## Getting Started

### Prerequisites

- Node.js
- npm
- Optional: a Supabase project for cloud sync

### Install

```bash
git clone https://github.com/VaradAnnadate/SplitTab.git
cd SplitTab
npm install
```

### Run locally

```bash
npm run dev
```

Open the local Vite URL shown in your terminal, usually:

```text
http://localhost:5173
```

The app works locally even without Supabase credentials.

## Optional Cloud Sync Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Add your Supabase project values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Database Tables

Run this SQL in the Supabase SQL Editor:

```sql
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  emoji text default '👤' not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Own profiles only" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  amount numeric not null,
  note text default '' not null,
  direction text check (direction in ('i_paid', 'they_paid')) not null,
  date date default current_date not null,
  created_at timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "Own transactions only" on public.transactions
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = transactions.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = transactions.profile_id
      and profiles.user_id = auth.uid()
    )
  );
```

### Google Sign-In

1. In Supabase, open **Authentication > Providers > Google**.
2. Enable Google as a provider.
3. Create an OAuth client in Google Cloud Console.
4. Add this redirect URI:

```text
https://your-project-id.supabase.co/auth/v1/callback
```

5. Paste the Google client ID and secret into Supabase.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Project Structure

```text
src/
  components/
    AddProfileModal.jsx
    AddTransactionModal.jsx
    EditProfileModal.jsx
    ProfileCard.jsx
    TransactionItem.jsx
  pages/
    Home.jsx
    ProfileDetail.jsx
    InvoiceView.jsx
  App.jsx
  main.jsx
  supabaseClient.js
  useStore.js
```

## Data Model

SplitTab stores profiles and transactions. A transaction has:

- `amount`: the expense or settlement amount
- `direction`: `i_paid` or `they_paid`
- `note`: optional label such as Dinner, Tickets, or Settlement
- `date`: transaction date

Balances are calculated from transaction direction:

- `i_paid` increases what the friend owes you
- `they_paid` reduces the balance or means you owe them

## Install On iPhone

1. Open SplitTab in Safari.
2. Tap the Share button.
3. Choose **Add to Home Screen**.
4. Launch SplitTab like a normal app.

## License

MIT
