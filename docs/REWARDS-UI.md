# Rewards frontend

The `/rewards` page contains Catálogo, Mis canjes and Movimientos. It uses the existing authenticated API client and Zustand wallet store. Prototype colors and typography are scoped to this page; existing page styles are not replaced. No new assets or dependencies are introduced by this unit.

Wallet balances are server values. A successful redemption returns its persisted receipt, followed by a wallet refresh. History is paginated in groups of 20 without claiming a total count. Region, monetary face value, point cost, compatibility and availability come from the catalog. Every receipt explicitly labels the delivered code as fictitious and provides a copy action with failure feedback.

Before a debit request, the page persists its user/product/idempotency key in sessionStorage. Network/server uncertainty, reloads and authentication errors retain this attempt. Recovery reuses the exact key, including when the product disappears from the current catalog. Other products are blocked until the attempt resolves. Confirmed success or definitive 400/404/409 rejection clears the attempt. Unavailable storage blocks submission rather than allowing a charge without a recoverable key. Session storage survives reloads in the same tab; closing the tab discards it. Existing confirmed receipts remain available in Mis canjes.

Reads use AbortController and response guards. Focus refreshes balance and pending attempt. The confirmation uses a native modal dialog for keyboard focus containment, Escape handling and focus return. Copying requires browser clipboard permission/HTTPS; manual copy remains possible.

Focused checks: `node --test tests/rewards*.test.mjs`; ESLint on new source files. Browser interaction and live API integration are separately reported by the parent, not inferred from mocked service tests.
