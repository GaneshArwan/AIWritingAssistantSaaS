# SYS.WRITER: Core Architecture & Security Systems

A multi-tenant SaaS platform engineered with a strict, security-first backend architecture. The system is designed to handle user quotas, enforce draconian abuse-prevention policies, and provide highly isolated data environments, completely optimized for one-time payment architectures (e.g., Midtrans QRIS in the Indonesian market).

This document outlines the core backend systems, security guardrails, and the operational lifecycle of the platform.

---

## 1. Engine & Output Pipeline

- **Core AI Engine:** Google Gemini 3 Flash.
- **Delivery Mechanism:** Direct low-latency text streaming to the client. Responses are processed and rendered incrementally in a brutally minimal, terminal-inspired interface.
- **Data Persistence:** All generated outputs are logged asynchronously into the `generations` database table after the stream concludes, ensuring no blockages on the user's critical path.

---

## 2. Draconian Quota & Usage Enforcement

Usage tracking and quota enforcement are handled entirely at the database layer (PostgreSQL) to guarantee atomic operations and prevent Time-Of-Check to Time-Of-Use (TOCTOU) bypasses commonly found in standard SaaS middleware.

### Tier Limits & Constraints
- **FREE Tier:** Operates strictly as a one-time trial. **1 generation lifetime limit.** There are no monthly refills. Once exhausted, the account is permanently locked out of generation.
- **PRO Tier:** Features nested constraints:
  - **30 generations per month** overall.
  - **5 generations per day** hard cap.
- **Dynamic FIFO Rollover System:** Unused PRO quotas are automatically banked and rolled over up to a maximum of 2 past months. The system calculates rollovers dynamically via a chronological FIFO ledger, meaning if you didn't use 20 quotas from Month 1, they are available in Month 2 and Month 3 before expiring.
- **Graceful Downgrade:** The system evaluates the `subscription_expires_at` timestamp on every render and generation call. The moment a Pro subscription expires, the user's dashboard and API limits immediately fall back to the Free tier parameters.

### Atomic Database Operations
To prevent race conditions where a user spams the API concurrently to bypass limits:
1. The backend triggers a check that preemptively calls a Supabase RPC function (`increment_generation_count`).
2. This RPC executes an atomic direct table update inside the database transaction.
3. If the quota is exceeded, the database rejects the transaction, ensuring zero leakage of AI credits.

### Automated Lifecycle Refunds
The backend features a robust compensation lifecycle. If the generation engine (Gemini) times out or fails *after* the quota has been preemptively deducted, the system automatically triggers a compensation RPC (`decrement_generation_count`) to refund the user's daily and monthly quota. Users are never penalized for system outages.

---

## 3. Timezone-Aware Quota Resets

Unlike standard SaaS applications that arbitrarily reset quotas based on server UTC time, SYS.WRITER implements dynamic localized resets:

1. **Header Injection:** The frontend extracts the client's physical local timezone via browser APIs and injects it into the `x-user-timezone` HTTP header on every generation request.
2. **Backend Resolution:** The Next.js API parses this header and dynamically formats the daily (`YYYY-MM-DD`) and monthly (`YYYY-MM`) boundary strings relative to the user's specific locale.
3. **Database Execution:** These localized date strings are passed to the Supabase RPC functions. 
**Result:** A user located in Jakarta (UTC+7) will have their daily quota reset exactly at `00:00 WIB` local time, while a user in Tokyo will reset at `00:00 JST`.

---

## 4. Advanced Abuse Prevention Firewall

A comprehensive suite of network and database-level guardrails is deployed to prevent free-tier abuse, account farming, and resource exhaustion.

### Strict Server-Side Authentication
- All protected routes (e.g., `/dashboard/*`) are secured at the Server Component (`layout.tsx`) layer.
- Unauthenticated requests are intercepted and redirected to `/login` on the server before any client-side bundle is transmitted, completely eliminating unauthorized layout flashes or client-side API probing.

### 6-Month Account Deletion Penalty (Database Trigger)
To prevent users from circumventing the "1 Generation Lifetime" free tier by deleting and recreating their accounts:
- A PostgreSQL `BEFORE INSERT` trigger is attached to the Supabase `auth.users` table.
- When an account is deleted, a secondary `AFTER DELETE` trigger permanently logs the user's email into a `deleted_users_cooloff` table alongside a timestamp.
- If a new registration attempt matches an email in the cool-off table, the `BEFORE INSERT` trigger calculates the time delta. If it has been less than 6 months, the database throws an exception and forcefully terminates the registration at the lowest level.

### Disposable Email & Plus-Addressing Filter
- **Plus Addressing Blocked:** The API sanitizes incoming registration payloads and rejects standard alias exploits (e.g., `user+spam@gmail.com`), forcing users to use base email addresses.
- **Disposable Email Firewall:** The system checks email domains against a hard-coded registry of disposable/temporary email providers (e.g., TempMail, 10MinuteMail) and blocks them at the perimeter.

### IP Rate Limiting & Network Fingerprinting
- The system extracts the real IP address from incoming requests using strict cloud headers (e.g., `x-vercel-forwarded-for`).
- It tracks the number of distinct Free-Tier accounts generating content from a single IP network.
- **Hard Limit:** A maximum of 3 unique accounts per IP address is permitted. Any subsequent accounts originating from the same IP are flagged in the `abuse_logs` table and immediately blocked.

### Bot Mitigation (Cloudflare Turnstile)
- Registration and authentication flows are protected by Cloudflare Turnstile CAPTCHA.
- Tokens are strictly verified server-side by Supabase Auth options (`captchaToken`), ensuring automated bot registrations are dropped before hitting the database.

### Payload Size Limitation
- All text inputs to the generative AI API are strictly bound to a maximum length of 3,000 characters.
- This mitigates prompt-stuffing attacks and prevents malicious actors from exhausting the system's input token context limits.

### Security by Obscurity
All client-facing authentication errors (e.g., failed login, blocked registration due to the 6-month penalty) are sanitized into generic strings like "Registration failed. You may have violated our Terms." This deliberate obfuscation prevents malicious actors from performing email enumeration or reverse-engineering the abuse guardrails.

### Strict Content-Security-Policy (CSP)
- Enforced at the Next.js configuration level (`next.config.ts`) via HTTP response headers.
- **XSS Mitigation:** `script-src` and `style-src` are strictly sandboxed. Production builds forbid `'unsafe-inline'` script executions (except where securely whitelisted by nonce or framework internals).
- **Network Isolation:** `connect-src` explicitly whitelists only trusted domains (`*.supabase.co`, `api.midtrans.com`). Generative AI calls to Google Gemini are entirely proxied through the backend server, meaning the Google API key and inference endpoints are never exposed to the client's browser.
- **Clickjacking Prevention:** `X-Frame-Options: SAMEORIGIN` completely blocks the application from being embedded in malicious iframes.

---

## 5. Tenant Data Isolation & Compliance

### Row Level Security (RLS)
- All user-generated content, usage metrics, and telemetry are strongly isolated via PostgreSQL Row Level Security.
- An authenticated user session can only perform `SELECT`, `INSERT`, or `UPDATE` operations on rows where `user_id == auth.uid()`. Cross-tenant data leakage is cryptographically impossible at the database query level.

### GDPR / Data Erasure Compliance
- Users can trigger a permanent account termination from their Dashboard Settings.
- The system calls the Supabase Admin API to delete the primary authentication identity. Through PostgreSQL's `ON DELETE CASCADE` mechanics, all associated records—including payment logs, generations, and usage statistics—are atomically wiped from the database without leaving orphaned records (except for the anonymized email hash in the cool-off table).

### AI Safety & Content Guardrails
- The Gemini generation pipeline is explicitly configured to block harmful generations.
- `HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE` is enforced strictly across all categories (Harassment, Hate Speech, Sexually Explicit, Dangerous Content).

---

## 6. Tailored Payment Architecture (Midtrans)

The billing infrastructure has been architected specifically for emerging markets (Indonesia) that favor **One-Time Payments** over recurring credit-card subscriptions:

- **Dual-Tier Access:** Pro packages are sold as strict **28-day** (Monthly) or **365-day** (Yearly) access blocks via QRIS or Bank Transfer through the Midtrans gateway.
- **Strict Renew (Capitalist Forfeiture):** Because there are no recurring mandates, users manually renew their access. If a user purchases a new plan while still having an active subscription, the system enforces a strict reset from `TODAY`. Any remaining days from the previous subscription are instantly forfeited.
- **Order ID Length Constraints & Reconciliation:** Midtrans enforces a strict 50-character limit on the `order_id` field. Since Supabase UUIDs are 36 characters long, concatenating them with timestamps frequently causes string overflow. The checkout API bypasses this by generating a truncated `order_id` (using only the first 8 chars of the UUID) while securely embedding the full user UUID into Midtrans's `custom_field1`. The webhook then safely reconciles the transaction using `custom_field1` directly against the database.
- **Anti-Replay Attack Webhook:** The Midtrans webhook relies on cryptographic signature validation using `timingSafeEqual`. To prevent attackers from resending an old, successful webhook payload to gain free months, the database stores the `latest_order_id` on the `users` table. The webhook explicitly rejects any payload carrying an already-processed `order_id`.

---

## Local Development & Deployment

### Prerequisites
- Node.js 18+
- Supabase CLI / Remote Supabase Project
- PostgreSQL

### Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_key
TURNSTILE_SECRET_KEY=your_turnstile_secret

GEMINI_API_KEY=your_google_gemini_key

MIDTRANS_SERVER_KEY=your_midtrans_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Migrations:**
   Ensure you run the required SQL scripts in your Supabase SQL Editor to construct the schema.

3. **Start the server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

### Developer Tools
- **PRO Simulation:** While running in `development` mode (`NODE_ENV=development`), users can simulate a PRO purchase without triggering the Midtrans gateway. An explicit `SIMULATE_PRO` button becomes visible on the `/dashboard/billing` page. This securely triggers the `/api/dev/simulate-pro` route, which is hardware-locked to reject requests in production.

## License
Proprietary. All rights reserved. Do not distribute.
