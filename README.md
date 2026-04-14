# Drifts AI CRM

A Next.js + Supabase CRM and product showcase with:

- public marketing pages
- visitor authentication
- admin CRM
- product and page management
- lead capture
- audit logging
- file uploads to Supabase Storage
- a personalized chatbot knowledge base
- optional paid AI fallback using an OpenAI API key stored in the CRM

## Tech stack

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (database, auth, storage)

## Requirements

Install these before setup:

- **Node.js 20+**
- **npm**
- **Visual Studio Code**
- **A Supabase project**
- **A Vercel account** for deployment

## Local setup

### 1) Open the project

Open the extracted folder in VS Code:

```bash
code .
```

### 2) Install dependencies

```bash
npm install
```

### 3) Create Supabase tables

Run the SQL file in your Supabase SQL editor:

```bash
supabase/schema.sql
```

That creates the required tables:

- `site_settings`
- `products`
- `leads`
- `pages`
- `audit_logs`

### 4) Configure environment variables

Copy `.env.example` to `.env.local` and fill in real values.

Important variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `AUTH_SESSION_SECRET`
- `SITE_URL`

Email settings are optional but recommended:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `NOTIFY_EMAIL`

The chatbot AI key is **not** stored in an environment variable by default. Add it later in the admin CRM under chatbot settings.

### 5) Seed or confirm the admin login

If you want to create a bcrypt hash for the admin password, run:

```bash
npm run seed:admin
```

Then set the resulting hash in `ADMIN_PASSWORD_HASH`.

### 6) Start the app

```bash
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/admin/login`

## Admin login

Use the admin email and password from your environment variables.

If login fails, check these first:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`

The admin login page is separate from the public login page.

## Chatbot setup

The chatbot has two layers:

1. **Knowledge base matching** from questions and answers you store in the CRM.
2. **Optional AI fallback** using your own OpenAI API key.

### Add chatbot answers

Go to the admin panel and open **Chatbot knowledge base**.

You can paste rows in this format:

```text
Question | Answer | tags | priority | enabled
```

Example:

```text
What is your refund policy? | Refunds are handled case by case. | billing; refund | 5 | true
How do I contact support? | Email support@yourcompany.com. | support; contact | 4 | true
```

You can also upload a CSV or sheet export with the same columns.

### Enable AI fallback

In **Site settings**:

- turn on **AI enabled**
- enter your **OpenAI API key**
- choose the model
- save the settings

The app keeps the API key on the server side and uses it only for chatbot requests.

## Recommended setup order for a new client

1. Deploy Supabase project
2. Run `supabase/schema.sql`
3. Set `.env.local`
4. Start locally with `npm run dev`
5. Log in to `/admin/login`
6. Save branding, pages, products, and chatbot answers
7. Enable chatbot AI if needed
8. Deploy to Vercel

## Deploy on Vercel

### 1) Push the repository to GitHub

Vercel deploys cleanly from GitHub.

### 2) Import the repo in Vercel

In Vercel:

- click **Add New** → **Project**
- import the GitHub repository
- choose the Next.js framework preset

### 3) Set environment variables in Vercel

Add the same variables from `.env.local` into the Vercel project settings.

Do not skip these:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `AUTH_SESSION_SECRET`
- `SITE_URL`

### 4) Update Supabase redirect settings

In Supabase auth settings, add your Vercel domain to the allowed redirect URLs.

Typical values:

- `https://your-project.vercel.app`
- `https://your-custom-domain.com`

### 5) Redeploy

After environment variables are saved, trigger a redeploy or push a new commit.

## Build commands

```bash
npm run lint
npm run build
npm start
```

## Common issues

### Admin login does nothing

Check that:

- the admin login page is `/admin/login`
- the environment variables are set
- the password matches the hashed password if you use `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET` is long and random

### Chatbot shows only fallback answers

Check that:

- `chatbot_enabled` is on
- the knowledge base has at least one row
- `chatbot_ai_enabled` is on only after the API key is saved
- the uploaded sheet has question and answer columns

### Supabase writes fail

Check service role access and confirm the SQL schema was applied.

## Security notes

- Keep the service role key server-side only.
- Use a long random `ADMIN_SESSION_SECRET`.
- Do not reuse the admin password across environments.
- Restrict Supabase policies so public users cannot read protected tables directly.
- Review uploaded chatbot data before enabling AI fallback.

## File structure

- `app/` — routes and server actions
- `components/` — UI and layout components
- `lib/` — auth, data access, chatbot logic, utilities
- `supabase/schema.sql` — database setup

## License

Use this code according to your business and client agreement.
