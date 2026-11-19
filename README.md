# Nexus Arena frontend

React + Vite tournament client. Existing pages retain their design; new Rewards
and My Enrollments pages use the scoped `Prueba-Front` palette.

## Run locally

Start the backend from `Backend/ProyectAPI`:

```sh
dotnet run --launch-profile https
```

Default API: `https://localhost:7039/api`. Trust the local development certificate
in your browser. From this frontend directory:

```sh
npm ci
npm run dev
```

Use `http://localhost:5173`. To override the API, set `VITE_API_URL` to its full
base URL and restart Vite. Vite variables must never contain secrets. Keep the
frontend origin in the backend CORS allowlist.

## Structure and reference

Based on the routing, lazy loading, Zustand, Tailwind, forms and Axios examples in
[UNT Programación 4 / React](https://github.com/atarico/UNT-programacion4/tree/main/01-react).

- Wouter preserves URLs, parameters and staff redirects; React `lazy`/`Suspense`
  split page bundles.
- `src/api` uses Axios with cookies for integrated features. Existing team/profile
  fetch helpers retain their tested contracts.
- Zustand stores session display data and wallet balance. Cookies authenticate;
  localStorage holds no JWT/password. Private routes restore `/api/auth/me`.
- React Hook Form + Zod validate login, registration and tournament creation;
  `safeParse` errors map to RHF fields without an extra resolver dependency.
- Feature components, hooks and schemas are modular. Tailwind handles layout;
  the new Rewards CSS is scoped to prevent changing existing pages.

## Integrated features

- `/rewards`: catalog, simulated canjes, persistent receipts, movements and same-tab
  idempotency recovery. Gift codes are fictitious, with no external fulfillment.
- `/tournament-enrollments`: own requests and five fixed-player confirmations.
  Each player pays only their entry; pending requests reserve no seat.
- Tournaments: points/free rules, staff cancellation/refunds and definitive
  closure. Backend permissions and business rules remain authoritative.
- `/rankings`, profiles and team details: game-specific Elo, exact current
  position, unrated state and paginated adjustment history.

See [Rewards](docs/REWARDS-UI.md), [Tournaments](docs/TOURNAMENTS-UI.md) and
[Rankings](docs/RANKINGS-UI.md).

## Verification

```sh
npm test
npm run lint
npm run build
```

28 deterministic tests pass, plus production build and lint, independently
rechecked. Live browser proof used disposable local MongoDB, never Atlas:
login/logout/private redirects; catalog; Steam simulated canje22,500→2,500;
receipt/copy/ledger; own team confirmation1/5→2/5 and250-point debit; ranking
filters; profile current/unrated states. Page bundles are split in the build.

Google OAuth and every moderator bracket/closure interaction were not exercised
in this browser run. Backend suites cover settlement/Elo. The requested AFTER
[design audit](anti-slop/audit-001-2026-11-19.md) lists selected-fix candidates.
`npm audit` reports four pre-existing development-tool advisories: three moderate
and one high in ESLint/minimatch and Vite. No broad tooling upgrade was included.
