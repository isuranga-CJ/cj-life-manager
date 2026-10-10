# CJ Life Manager

Mobile-first personal finance app built with Vite, vanilla JavaScript and the official Supabase client. Currency: LKR. Reporting and shift input timezone: Asia/Colombo.

## Theme

Midnight Ledger uses deep navy surfaces, teal actions, mint income and coral expenses. System fonts, larger labels, tabular money figures, consistent SVG icons and 44px touch targets keep the mobile interface readable. Financial amounts move onto their own line in narrow record lists.

## Features

- Supabase email/password sign-in, sign-up, sign-out and password recovery
- Dashboard and opening-balance-based account ledger
- Add/edit accounts, income, expenses and single-record atomic transfers
- Month-filtered financial reports, expense composition and CSV export
- Manual PickMe/Uber logs: fares, commission, fuel, distance, hours, trips and net earnings
- Casino shifts: overnight shifts, breaks, working hours and tips
- Explicit, isolated in-memory sample mode; no sample writes to production
- Responsive navigation and forms; keyboard-accessible modal editor

Work logs are operational records; they do not affect the ledger. Enter actual payouts/salary/tips under Income and actual costs under Expenses. This avoids implicitly duplicating financial entries. Transfers do not count as income or expenses. Existing entries with a null account remain included in reports but cannot contribute to account balances.

## Run

Node.js 22.12+ or 24 recommended.

1. `npm ci`
2. Copy `.env.example` to `.env.local` and set the Supabase publishable key (never a service-role or secret key).
3. `npm run dev`
4. `npm test` and `npm run build`

Vercel configuration is included. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the chosen Vercel project before building. Public browser configuration is expected to be visible; authorization is enforced by Supabase RLS, not by hiding the publishable key. No privileged secret is used in the app.

Before publishing, configure Supabase Auth Site URL and redirect allow-list to the approved deployment origin. Email delivery, confirmation and password recovery require end-to-end testing against that origin. Keep email verification enabled. Enable leaked-password protection if supported by the project's plan.

## Existing database

The application preserves and uses public.profiles, accounts, income, expenses and transactions. Two additional tables, rider_logs and casino_shifts, were added. All seven tables have RLS. Existing ownership policies were preserved; additional restrictive policies enforce valid amounts and ownership of linked accounts for financial writes. No existing tables or records were deleted or recreated. Direct API execution of the existing profile trigger was revoked without changing its trigger behavior.

SQL files in db/ document changes ALREADY APPLIED to project hrrflxpcbsywiffseouv. Do not rerun them; the migration names are cj_security_and_tracking and cj_limit_profile_trigger_execution. They are not a complete bootstrap schema for another project.

## Verification completed on 2026-10-10

- Production bundle built with live public project configuration.
- Eight unit tests passed: ledger rounding, transfers, rider profit, overnight shifts, timezone boundary, validation and CSV formula neutralization.
- Rollback-only database tests passed: owner read/write, cross-user account isolation, cross-account income and transfer rejection, rider ownership and valid shift insertion.
- Profile creation trigger tested after permission hardening; test user and profile rolled back.
- Production dependency audit: 0 known vulnerabilities at test time.
- Supabase security advisor: only leaked-password protection disabled remains.

## Pending gates and access blockers

- GitHub read/write access was verified on 2026-10-10 after installing the ChatGPT Codex Connector. Source is committed to isuranga-CJ/cj-life-manager.
- Vercel team Z BORN GEN is accessible and had no projects. Nothing has been published; user requested approval first.
- No supported browser-control surface was available for local mobile viewport QA. Responsive CSS is implemented, but visual/mobile interaction QA is not completed.
- Live email confirmation/login/recovery and deployment end-to-end verification remain pending.
- No authentication settings were weakened. No privileged keys are included.

The empty repository and absence of Vercel projects were verified before committing. Obtain publishing approval before any deployment trigger.
