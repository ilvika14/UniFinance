<div align="center">
  <h1>UniFinance</h1>
  <p>An AI-powered personal finance platform — track expenses, automate recurring transactions, scan receipts, and get monthly insights powered by Gemini AI.</p>

  <p>
    <a href="https://finnntrack.vercel.app"><strong>Live Demo →</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/github/contributors/himanshuvkm/FinTrack.svg?style=flat-square" />
    <img src="https://img.shields.io/github/stars/himanshuvkm/FinTrack.svg?style=flat-square" />
    <img src="https://img.shields.io/github/forks/himanshuvkm/FinTrack.svg?style=flat-square" />
    <img src="https://img.shields.io/github/issues/himanshuvkm/FinTrack.svg?style=flat-square" />
    <img src="https://img.shields.io/github/license/himanshuvkm/FinTrack.svg?style=flat-square" />
  </p>
</div>

---

[![Product Screenshot](https://github.com/himanshuvkm/FinTrack/blob/main/public/Preview.png?raw=true)](https://finnntrack.vercel.app)

---

## What is UniFinance?

UniFinance gives you a clear, real-time picture of your financial life. Log income and expenses, set budgets with alert thresholds, automate recurring payments, and let AI analyse your spending patterns — all in one place.

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Visual overview of income, expenses, and net balance with interactive charts |
| **Transaction management** | Add, edit, and categorise transactions with full history |
| **Budget tracking** | Set per-category budgets; receive email alerts when you approach limits |
| **Recurring transactions** | Automate repeating income or expenses — daily, weekly, or monthly |
| **AI receipt scanning** | Upload a receipt and Gemini AI extracts the amount, merchant, and category |
| **Monthly AI reports** | Personalised financial health summaries delivered to your inbox each month |
| **Secure auth** | JWT-based authentication with OAuth (Google) support |
| **Rate limiting** | Arcjet protects all API routes from abuse |

---

## Tech Stack

**Frontend**
- [Next.js 16](https://nextjs.org/) — App Router, Server Actions
- [React 19](https://react.dev/) — UI library
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) — styling and components

**Backend & Database**
- [SQLite](https://www.sqlite.org/) — local file-based database
- [Prisma](https://www.prisma.io/) — type-safe ORM

**Services**
- [Gemini AI](https://ai.google.dev/) — receipt scanning and monthly insights
- [Inngest](https://www.inngest.com/) — background jobs for recurring transactions and reports
- [Resend](https://resend.com/) — transactional email (budget alerts, monthly reports)
- [Arcjet](https://arcjet.com/) — rate limiting and bot protection

**Auth**
- Custom JWT-based authentication (jose library)
- OAuth 2.0 with Google sign-in
- HTTP-only secure cookies for session management
- Auth proxy pattern (no middleware-based auth)

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A [Google Cloud](https://console.cloud.google.com/) project (for OAuth)
- A [Gemini AI](https://ai.google.dev/) API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/himanshuvkm/FinTrack.git
cd UniFinance
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file at the root of the project and fill in the values below.

4. **Push the database schema**

```bash
npx prisma db push
```

5. **Seed the database (optional)**

Visit `http://localhost:3000/api/seed` to populate with sample data.

6. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

```env
# Database (SQLite)
DATABASE_URL=file:./../dev.db

# JWT — secret for signing tokens
JWT_SECRET=your-super-secret-key

# Google OAuth — https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Gemini AI — https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# Resend — https://resend.com/api-keys
RESEND_API_KEY=your-resend-api-key

# Inngest — https://app.inngest.com
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Arcjet — https://app.arcjet.com
ARCJET_KEY=your-arcjet-key
```

### Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` as `GEMINI_API_KEY`
4. The AI receipt scanner and monthly reports use this key

---

## Auth Architecture

UniFinance uses a custom auth system with **JWT tokens** and **OAuth**:

- **JWT tokens** are created on sign-in/sign-up and stored in HTTP-only cookies
- **OAuth** supports Google sign-in via the standard authorization code flow
- **Auth proxy** pattern protects API routes and pages (no Next.js middleware auth)
- All protected server actions call `getOrCreateUser()` which reads the JWT cookie

### Protected Routes
- `/dashboard` — main dashboard
- `/account/[id]` — account details
- `/transactions/*` — transaction management

---

## Project Structure

```
unifinance/
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/           # Sign-in / sign-up routes
│   ├── (main)/           # Protected app routes (dashboard, accounts, transactions)
│   └── api/              # API route handlers (auth, seed, inngest)
├── components/           # Shared UI components
│   ├── auth/             # Auth proxy components
│   ├── compo/            # Header, footer, hero
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions, auth, proxy, Prisma client, AI helpers
├── actions/              # Server actions (account, transaction, budget, dashboard)
├── hooks/                # Custom React hooks
├── data/                 # Static data (landing page, categories)
├── emails/               # Email templates
├── prisma/               # Prisma schema and migrations
└── public/               # Static assets
```

---

## Contributing

Contributions are welcome — bug reports, feature requests, documentation improvements, and code all help.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages where possible.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

## Contact

**Himanshu Vishwakarma**
- Email: himanshuvkm252@gmail.com
- GitHub: [@himanshuvkm](https://github.com/himanshuvkm)
- LinkedIn: [himanshuvkm](https://linkedin.com/in/himanshuvkm)
- Project: [github.com/himanshuvkm/UniFinance](https://github.com/himanshuvkm/UniFinance)
