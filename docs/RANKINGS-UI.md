# Rankings and profile Elo

The existing ranking page now reads the paginated player/team endpoints. Its game
selector contains only League of Legends, Valorant, CS:GO and Rocket League.
Changing game or entity type resets pagination. Positions use the backend's stable
ordering and the 20-row page offset; ratings come from `rating`, never wallet
points or legacy `points`. Player rows link to profiles and team rows to details.
There is no invented cross-game global ranking.

Own/public profiles and team details reuse `CurrentEloPanel`. Its game selector
uses supported games actually associated with that profile/team. Current rating
and exact ordinal position come from the dedicated snapshot read endpoint,
including positions beyond the first50 rows. Unrated records show
“Sin clasificación”, without a synthetic1000 or position. Eligible match counts
and paginated per-game adjustment history are separate from editable legacy
profile statistics and reward wallets. Team Elo remains the team's own rating.

History displays before/after, delta, result, timestamp and tournament link.
Both leaderboard/history pages request20 records. A full page enables Next;
when the total is exactly a multiple of20, the next page may legitimately be empty
and Previous remains available. There is no total-count endpoint. Page1 disables
Previous; loading disables navigation. Errors include retry controls and no stale
rows. Empty histories have their own message.

`useEloRequest` aborts superseded requests, checks request identity even when a
transport ignores cancellation, and refreshes on browser focus. Query keys hide
stale data during game/type/entity/page changes. The profile/team source reads
also abort obsolete requests when route identity changes. Existing team
membership, captain actions, profile editing and invitation behavior remain.
Assigned pages use the shared Wouter navigation adapter.

## Verification

`node --test tests/rankings.test.mjs` uses Vite SSR plus a mock Axios adapter,
without a DOM/test framework dependency. A runtime RED against the initial
request stub demonstrated an obsolete response overwriting the latest one.
GREEN covers cancellation, outdated responses, errors, exact query parameters,
the four supported games, nullable ratings, ordinal positions, team links, explicit
rating instead of legacy points, profile-game selection, history and pagination.
Scoped ESLint passes for all files in this unit. The parent owns full application
build, combined regression checks, browser interaction checks and the requested
post-integration antislop audit. No assets were created or visual redesign applied.
