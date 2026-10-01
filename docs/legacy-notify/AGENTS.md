> Superseded music-player handoff, preserved as history. Notify is now the assignment planner.

# Project instructions

This is the handoff for a learning project: a responsive, Feishin-inspired web music player for a self-hosted Navidrome library. Read this file, [`ROADMAP.md`](./ROADMAP.md), and [`CONTEXT.md`](./CONTEXT.md) before changing the project.

## Agreed direction

- Build an original web player inspired by Feishin's interaction patterns. Do not copy its source, branding, artwork, or exact screen designs.
- Use React, TypeScript, and Vite for the browser app. Use Node.js and PostgreSQL for the app API and app-owned data.
- Host the static web app on Cloudflare Pages. Use Railway's one-time trial credit to learn and evaluate deployment of the API and PostgreSQL. The long-term API/database host is intentionally undecided; compare Railway's ongoing cost with running them on the Ubuntu laptop after the trial.
- Run Navidrome and, later, Lidarr plus `slskd` as persistent Docker services on the Ubuntu laptop. The music library must be on storage that host can access.
- The first release is for one user. Friends and separate Navidrome accounts come later.
- The user has built with HTML/CSS, backend APIs, and SQL, but did not report prior React app experience. Explain React/TypeScript choices as the work proceeds; do not assume a beginner in backend or SQL.
- The library is expected to stay below 10,000 tracks and the player must work well on both desktop and mobile.

## Product scope

### First player release

Deliver a responsive player for the user's Navidrome instance with:

- library browsing and search;
- playback, seek, volume, and a persistent queue;
- lyrics where the server/API and track metadata provide them;
- playlist browsing and basic playlist actions supported by the chosen Navidrome API;
- clear loading, empty, unavailable-lyrics, offline, and playback-error states.

Keep the interface focused. The user cited Feishin as the UI/feature reference and specifically wants lyrics, queue, and playlists. Do not attempt full Feishin feature parity in the first release.

### Later work

- Add invite-only access for a small group; each person uses their own Navidrome account.
- Evaluate authorized music acquisition using Lidarr and `slskd` only after the player works. The currently identified community Lidarr integration requires a nightly Lidarr build; verify its status and compatibility again before adopting it. Prowlarr handles torrent/Usenet indexers and is not the Soulseek integration.

## Architecture and data boundaries

- Navidrome is the source of truth for the music library, track metadata, and server-owned playlists/favorites. Do not copy the full library into PostgreSQL.
- PostgreSQL is for data the player owns, such as UI preferences and, if the product still needs it, app-specific playback history. Avoid storing duplicate Navidrome state without a clear user-facing reason.
- Keep audio delivery on the direct browser-to-Navidrome path if the real server supports the required HTTPS, CORS, authentication, and byte-range behavior. Validate this before committing to the integration. If a proxy is required, stream bytes through it; never buffer complete tracks in application memory.
- Do not persist raw Navidrome passwords or service API keys in the app database. Design and document credential/session handling before implementing authentication.
- Cloudflare Workers are request-driven isolates, not a home for Navidrome, Lidarr, `slskd`, or other persistent file-owning daemons. Use Pages for the static client; use a persistent host with storage for media services.
- Never start downloads or configure indexers as part of the player MVP. Any later acquisition flow is limited to music the user owns, is licensed to download, or is otherwise authorized to obtain.

## Performance and UX requirements

- Do not fetch or render the entire library as one page. Use server-supported pagination/search where available; virtualize long lists when needed.
- Load artwork lazily, reserve image dimensions to avoid layout shifts, and cache metadata/artwork thoughtfully.
- Keep audio playback and queue state alive across client-side navigation. Use browser-native streaming and seeking; don't hold audio blobs in React state.
- Prioritize fast first interaction and reliable playback on mobile as well as desktop. During Phase 0, record a representative device/browser and establish a baseline before setting numeric performance budgets.
- Build for narrow screens, keyboard use, visible focus, readable contrast, and accessible player labels. Lyrics must remain readable without obscuring essential playback controls.
- Prefer small dependencies and clear, conventional React/Node/PostgreSQL patterns. Keep the Navidrome integration behind a small boundary so another compatible server could be considered later without making the MVP multi-server.

## Working rules for a new session

1. Inspect the repository and current deployed-service configuration before editing. Treat this handoff as the product brief, not evidence that any app or service has already been created.
2. Start with Phase 0 in `ROADMAP.md`: verify the Ubuntu host, music storage, Navidrome version/API, public HTTPS reachability, browser CORS/auth/range behavior, Railway trial constraints, and the lyric endpoints available in the actual library.
3. Do not re-ask decisions marked agreed in `ROADMAP.md`. Raise only concrete blockers or decisions that remain open there.
4. Implement in small vertical slices. Keep the app runnable locally, keep secrets out of Git, and document any decision that changes the confirmed scope or data ownership.
5. Do not add or run tests unless the user asks for testing/verification. When a requested verification is needed, choose the narrowest useful check and report what it does and does not establish.
6. Do not deploy publicly, expose private services, or enable the download automation without the user's explicit request for that step.

## Reference links

- [Feishin repository](https://github.com/jeffvli/feishin)
- [Navidrome developer/API documentation](https://www.navidrome.org/docs/developers/)
- [Cloudflare React Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Cloudflare Workers and PostgreSQL via Hyperdrive](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/)
- [Railway plans and pricing](https://docs.railway.com/pricing/plans)
- [Lidarr slskd community plugin](https://github.com/allquiet-hub/Lidarr.Plugin.Slskd)
