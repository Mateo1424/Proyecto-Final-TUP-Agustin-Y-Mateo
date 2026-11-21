# Tournament points and enrollment UI

## Details dialog correction

Tournament detail routes now show a native modal over the list. Close/Escape
return to the list; browser Back also recovers without reload. Loading/error
states live outside TournamentContent: React Compiler may inspect callback
dependencies before an early return, so callbacks must never receive a null
tournament. The previous null entryPoints crash was reproduced in a browser with
isolated mocked responses, then the same open/Back/reopen/Escape flow passed.
No database was changed. A compiler-enabled SSR regression covers initial loading
and the dialog close action.

Existing tournament list, details, create, bracket and match-detail pages preserve
their established layout and styles. All tournament routes use the shared Wouter
navigation adapter. Only the new personal inbox adopts the prototype's scoped
coral/lime palette; no assets or global navigation redesign were added.
Antislop mode is the user's session choice AFTER; the parent owns the final audit.

## Flows

- List/details display reward points, personal entry cost and free-event rules.
  Prize totals never show currency symbols. Paid awards are per eligible player;
  free events use participation50 + winner100, daily cap200 Córdoba.
- Creation uses React Hook Form and Zod safeParse/setError, without a resolver
  dependency. Capacity is fixed8. Canonical supported games are Valorant, CS:GO,
  League of Legends and Rocket League. The server owns prizes/costs; creation
  sends isFree and the validated dates, not client-authored monetary prizes.
- Individual registration confirms the player's own debit before submitting.
  Team registration is offered only to captains of that game's teams, charges
  their own entry, then refetches enrollment status. It never claims immediate
  team admission. Five fixed snapshot players must confirm individually.
- A shared roster card renders own confirmation only for the authenticated
  unconfirmed player; already-confirmed teammates cannot pay another wallet.
  Pending requests explicitly reserve no seat. Only Admitted renders a confirmed
  seat. Cancelled reports server cancellation/refund behavior and links the user
  conceptually to Movimientos, without locally inventing credited balances.
- `MyEnrollmentsPage` is exported for `/tournament-enrollments`: all/Pending/
  Admitted/Cancelled filters, hasMore pagination, per-tournament links and own
  confirm/withdraw actions. It calls the global own-inbox endpoint, never selects
  a user ID to retrieve another player's requests.
- Staff cancellation replaces ordinary deletion. Confirmation states refunds and
  preserved history. Definitive closure explicitly warns that rewards/Elo process
  once and normal result/cancellation editing freezes. Finalizado and ClosedAt
  are distinct states. Bracket, score, stat and disqualification controls respect
  ClosedAt; match detail loads its parent tournament to obtain that state.

## Async state

Details and inbox read requests use Axios with abort signals; late responses for
old routes/filters do not become current visible data. Mutation locks prevent
same-view double submissions and success is based on committed responses. Wallet
state refreshes after a mutation, along with the affected tournament/enrollment;
there is no optimistic subtraction. Error and retry states remain visible.
Focus refetches authoritative state. Enrollment reads poll every15 seconds only
while a visible page has pending requests, and stop/abort on cleanup. Local clock
updates registration controls without reserving or inferring admissions. Match
pages refresh visible results and parent closure status every15 seconds until
closed and on focus, so another moderator's closure removes editor controls.

## Checks

Initial runtimeRED observed: pending own-unconfirmed helper returned false, then
implemented the rule and expanded deterministic and actual JSX render tests.
`node --test tests/tournament*.test.mjs` covers ownership, phases, fixed8/free
creation, blocked closed states, pending/admitted distinction, real roster markup,
points-only rendering and module compilation through Vite SSR. Focused ESLint
checks all touched tournament components/hooks/schemas/helpers/tests. The parent
owns the final full build and cross-feature browser verification; this unit does
not launch parallel full builds or add dependencies.
