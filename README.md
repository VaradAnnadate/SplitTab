# SplitTab 💸

**Track shared expenses with friends. Generate beautiful invoices. Split bills effortlessly.**

SplitTab is a minimalist PWA (Progressive Web App) for tracking who owes who. Add friends, log transactions, and share a clean image invoice — no sign-up required. Sign in with Google to sync your data across all your devices.

> Made by **Varad Annadate**

---

## Features

- **👤 Friend Profiles** — Create a profile for each friend you split expenses with
- **💳 Transaction Logging** — Record "I paid for them" or "They paid for me" with a note and date
- **📊 Live Balance** — See at a glance who owes who and how much
- **🖼 Image Invoice** — Generate a shareable PNG invoice card (perfect for iMessage, WhatsApp)
- **☁️ Cloud Sync** — Sign in with Google to sync all data to Supabase across devices
- **📱 Works Offline** — No login needed; all data saved locally until you choose to sync
- **📲 iOS Home Screen** — Add to iPhone home screen for a native app-like experience

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Vanilla CSS (Weekstack-inspired design) |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Image Export | html-to-image |
| PWA | Web App Manifest + iOS meta tags |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/VaradAnnadate/SplitTab.git
cd SplitTab
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your **Project URL** and **anon key**
3. Create a `.env` file based on the template:

```bash
cp .env.example .env
# then fill in your values
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Create database tables

Run this in your Supabase **SQL Editor**:

```sql
-- Profiles table
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  emoji text default '👤' not null,
  created_at timestamptz default now() not null
);
alter table public.profiles enable row level security;
create policy "Own profiles only" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Transactions table
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
  for all using (
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

### 4. Enable Google Sign-In

1. In Supabase → **Authentication → Providers → Google** → toggle **On**
2. Go to [console.cloud.google.com](https://console.cloud.google.com) and create an OAuth 2.0 Client ID
3. Add this as an **Authorized redirect URI**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
4. Paste the Client ID and Secret into the Supabase Google provider settings

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Add to iPhone Home Screen

1. Open the app in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Done — it runs like a native app!

---

## Project Structure

```
src/
├── pages/
│   ├── Home.jsx          # Friend list + Google sign-in
│   ├── ProfileDetail.jsx # Transaction history per friend
│   └── InvoiceView.jsx   # Invoice card + image export
├── components/
│   ├── ProfileCard.jsx
│   ├── TransactionItem.jsx
│   ├── AddProfileModal.jsx
│   └── AddTransactionModal.jsx
├── useStore.js           # Dual-mode state (localStorage ↔ Supabase)
├── supabaseClient.js     # Supabase client initialisation
└── index.css             # Global design system
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`. Use `.env.example` as the template.

---

## License

MIT — free to use and modify.
