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

## Production deployment and remaining verification

- GitHub read/write access was verified on 2026-10-10 after installing the ChatGPT Codex Connector. Source is committed to isuranga-CJ/cj-life-manager.
- Published after explicit user approval on 2026-10-10: https://cj-life-manager.vercel.app. Vercel production deployment dpl_He5uGDeYWJ6LGXbWyB2J6YEpkN6f reached READY, using application commit c7d4a1fa7da4cb2a06f57b4e0f6b25bbcd8e308c.
- Live browser demo verified dashboard, expense save and balance/report recalculation, rider tracking, casino shifts and reports. No application-origin browser errors observed; no production error/fatal runtime logs were returned during the check.
- Public Supabase Auth settings confirm email signup is enabled and email confirmation is required. Anonymous requests exposed no existing-table rows; tracking-table requests were denied.
- Responsive CSS is implemented. The available cloud browser has no supported mobile viewport control; actual mobile interaction QA remains pending.
- Supabase Auth Site URL/redirect allow-list still require verification for https://cj-life-manager.vercel.app. The connected Supabase tools do not support these settings. Live email confirmation/login/recovery have not been tested.
- No authentication settings were weakened. No privileged keys are included.

Existing Vercel deployment protection was preserved. Demo verification wrote no sample records to Supabase.

## Planning v1 — approved for publication

Monthly category budgets, bill calendar with in-app due/overdue reminders, reserved savings goals and a current-month safe-to-spend estimate are implemented on the planning-v1 branch. User approved publication on 2026-10-10. The release also adds a Home dashboard with quick actions, upcoming bills, budget pulse and savings summaries, plus icon-only navigation with accessible labels, tooltips, active highlights and 44px+ touch targets.

Budgets warn at 80% and show overspending. Bill payments are a checklist only: recording an expense remains separate. Every bill is one payment; recurring generation, notifications and payment execution are not included. Goal reservations represent funds already held in tracked accounts; no ledger entries are generated. Safe-to-spend subtracts goal reservations and, per category, the larger of remaining budget or unpaid bills due through month-end, including overdue bills. Future income is excluded. Savings estimates round up over the remaining calendar months including the current month.

Migration cj_planning_v1 has already added budgets, bills and savings_goals with owner-only SELECT/INSERT/UPDATE, no client DELETE and no anonymous grants. Existing tables and data were not changed. db/planning-schema.sql documents the applied change; do not rerun it. db/planning-verification.sql is a rollback-only security test.

Verification: 15 ledger/planning tests passed, production build passed, rollback-only owner reads/writes, cross-user read/update denial, ownership reassignment denial, anonymous denial, duplicate-budget and savings constraints passed. No sample records persisted. Browser visual QA is pending because the cloud browser rejected file-protocol navigation; no workaround was attempted. Email auth and real-device mobile checks remain pending as above.
