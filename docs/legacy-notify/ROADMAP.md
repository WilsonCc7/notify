> Superseded music-player handoff, preserved as history. Notify is now the assignment planner.

# Navidrome Player — project roadmap

**Status:** agreed project direction; no application code or hosting has been created yet.  
**Purpose:** a learning project for a fast, polished, responsive music player for the user's Navidrome library, inspired by Feishin.

## Confirmed goals and constraints

- Learn modern frontend, Node.js API, and PostgreSQL through a complete application.
- Use React + TypeScript + Vite for the web app. This fits the browser-focused product and matches the broad direction of Feishin's current web codebase without requiring Next.js server rendering.
- Use Node.js + PostgreSQL for the app API and app-owned data. Cloudflare Workers can connect to PostgreSQL via Hyperdrive, but a Worker is not a persistent daemon host. Keep the API hosting choice open while trying Railway.
- Deploy the static web app to Cloudflare Pages. Railway's $5 trial credit is for deployment learning/evaluation, not the permanent home of the music library.
- Keep Navidrome and its music files on an always-on Ubuntu laptop with storage mounted where Docker services can access it. The user's main laptop should not need to stay open.
- Start with one user; add invite-only friend access and separate Navidrome accounts later.
- Target fewer than 10,000 tracks across desktop and mobile. The UI should feel responsive, and playback/seek should behave reliably.
- First-release feature priorities: library browsing/search, playback, persistent queue, lyrics, and playlists.
- Later, evaluate Lidarr + `slskd` for authorized music acquisition. The known community plugin has a nightly Lidarr requirement; confirm current maintenance and compatibility before using it. Prowlarr is for torrent/Usenet indexers and is not part of the Soulseek path.

## Recommended architecture to validate

```text
Browser (React + TypeScript + Vite)
  ├── static UI hosted on Cloudflare Pages
  ├── app API for player-owned data (Node.js + PostgreSQL)
  └── audio/API requests to the user's public HTTPS Navidrome endpoint

Ubuntu laptop (always-on; Docker; persistent music storage)
  ├── Navidrome
  ├── PostgreSQL and app API if moved off Railway after evaluation
  └── later: Lidarr + slskd, isolated from the first player milestone
```

The API and PostgreSQL can be tried on Railway during the available trial. Afterward, choose between Railway's paid service and moving the API/database to Ubuntu. Keep this choice reversible; do not make Railway-specific application code the domain model.

Before building around direct browser-to-Navidrome requests, verify the real instance supports HTTPS, CORS for the deployed player origin, authentication, and byte-range audio requests for seeking. If a proxy is needed, stream audio end-to-end instead of buffering entire files. Keep credentials out of the player database and agree on session handling before implementing login.

## Phases

### Phase 0 — environment and integration spike

**Goal:** prove the deployment and media path before building the full UI.

- Inspect the repository and record the installed Node/Docker versions and current Navidrome version.
- Confirm the Ubuntu laptop can remain powered, awake, networked, and reachable when the main laptop is off.
- Confirm where the music files live and ensure the Ubuntu host can access them with durable storage.
- Verify Navidrome's HTTPS URL, API/auth flow, browser CORS behavior, byte-range/seek support, and available lyrics behavior against real tracks.
- Try a minimal Railway API/PostgreSQL deployment within the one-time trial credit; note the projected post-trial cost and storage limits.
- Pick a representative desktop and mobile browser. Capture a baseline for library load, search, first play, and seeking; set numeric budgets only after observing the baseline.

**Exit criteria:** media source and storage are reachable; the browser can authenticate and stream or a proxy requirement is documented; Railway-versus-Ubuntu API/database hosting has a recorded decision or a clearly bounded trial.

### Phase 1 — app shell and responsive design

**Goal:** establish the visual and navigation foundation.

- Scaffold React + TypeScript + Vite with a clean route/layout structure.
- Build an original Feishin-inspired library shell: navigation, album/artist views, responsive sidebar/navigation, and persistent player region.
- Add loading, empty, offline, and error states from the start.
- Deploy a static preview to Cloudflare Pages after the user asks to publish/deploy.

**Exit criteria:** desktop and mobile layouts are usable, keyboard focus is visible, and the app can be previewed without a Navidrome server.

### Phase 2 — Navidrome browse, search, and playback

**Goal:** complete the core listening loop.

- Add a small Navidrome client adapter for library, search, album art, playlists, and audio URLs.
- Implement paginated or incremental library loading; do not transfer the entire library to the browser.
- Add browser-native audio playback, play/pause, next/previous, seek, volume, queue ordering, and queue persistence across navigation.
- Preserve audio streaming and seeking. Avoid loading entire files into memory.
- Add responsive track/album/artist lists; lazy-load album art and virtualize long lists if measurements justify it.

**Exit criteria:** browse/search/playback works against the user's library on desktop and mobile, including a library representative of the expected size.

### Phase 3 — lyrics, playlists, and player-owned data

**Goal:** deliver the features that distinguish this learning project.

- Add a readable lyrics view; support synchronized lyrics only when exposed by the actual Navidrome/API version and data.
- Add playlist browsing and supported playlist actions without duplicating Navidrome-owned playlist data.
- Add PostgreSQL-backed player preferences, such as theme and layout. Add playback history only if the user wants a separate history from Navidrome's own records.
- Document the distinction between a player user and that user's Navidrome account before adding friend access.

**Exit criteria:** lyrics show when available and degrade clearly when missing; playlists stay owned by Navidrome; the database contains only app-owned data.

### Phase 4 — deployment and performance hardening

**Goal:** make the player reliably usable while the main laptop is off.

- Keep the static client on Cloudflare Pages.
- Finalize where the Node API and PostgreSQL run: Railway (with recurring cost understood) or Docker on the Ubuntu host.
- Ensure Navidrome, music storage, and public HTTPS access remain available from outside the home network.
- Use the performance baseline from Phase 0 to tune artwork, list loading, search, and playback. Recheck slow-network/mobile behavior.
- Keep secrets out of the client bundle and repository; use server-side secret configuration for API keys.

**Exit criteria:** the main laptop can be off; the player is reachable on the intended URL; the Ubuntu media host serves the library; the user has chosen a sustainable post-trial hosting plan.

### Phase 5 — small-group access

**Goal:** let a few invited people use the player with their own Navidrome accounts.

- Add invite-only access only after single-user playback is stable.
- Keep each person's server account and app preferences isolated.
- Specify session expiry, logout, credential handling, and account removal before implementation.
- Do not share one Navidrome credential among the group.

**Exit criteria:** one user's settings, account, and playback data cannot appear for another user; each account can log out and revoke its session.

### Phase 6 — authorized acquisition automation (optional)

**Goal:** evaluate the user's preferred Lidarr + `slskd` workflow separately from the player.

- Limit the workflow to music the user owns, is licensed to download, or is otherwise authorized to obtain.
- Keep Lidarr, `slskd`, and downloads on persistent Ubuntu storage, with the same library path visible to Navidrome and Lidarr.
- Recheck the community plugin's maintenance status, Lidarr channel requirements, and `slskd` compatibility before adoption.
- Prowlarr is not required for the Soulseek path; do not add unrelated indexers.
- Keep this automation out of the player UI until its standalone workflow is stable and the user asks for integration.

**Exit criteria:** authorized test content can be imported into the shared library and appears in Navidrome without manual path repair; failure/retry and disk-usage behavior are understood.

## Scope guardrails

- Do not attempt full Feishin parity. Defer visualizers, casting, offline downloads, multi-server support, and deep theme customization until the core listening loop is stable.
- Do not build a second music catalog or media-file store in the app database.
- Do not route audio through the app API unless the direct browser path proves infeasible.
- Treat Railway as an experiment until recurring cost and persistent media storage are understood.
- Keep acquisition automation separate from playback and limited to authorized music.

## Decisions still open

- Post-trial host for the Node API and PostgreSQL: Railway paid service or Ubuntu Docker.
- Exact Ubuntu storage path, capacity, and backup approach.
- Exact Navidrome version, URL, auth mode, CORS behavior, lyrics support, and whether the current network setup provides safe public HTTPS access.
- Whether playback history is app-owned or Navidrome-owned; start without duplicate history.
- Numeric performance budgets after measuring the actual library and devices.

## Technology rationale and references

- TypeScript is a practical current choice for this learning project: GitHub's 2025 Octoverse reported it became the most-used language on GitHub in August 2025. This is an adoption signal, not a guarantee about future demand: [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/).
- Feishin's repository is the UI/feature reference; its web code is React/Vite: [Feishin](https://github.com/jeffvli/feishin) and [package.json](https://github.com/jeffvli/feishin/blob/development/package.json).
- Cloudflare documents React single-page app deployment to Pages: [React on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/).
- PostgreSQL remains portable if the API later moves. Cloudflare Workers can also reach hosted PostgreSQL through Hyperdrive, if that becomes the preferred API host: [Hyperdrive PostgreSQL guide](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/).
- Cloudflare Workers are request-driven isolates, not persistent processes: [How Workers work](https://developers.cloudflare.com/workers/reference/how-workers-works/).
- Railway offers long-running services and persistent volumes, but its current Free plan is credit-limited; the trial is not a long-term media-storage plan: [Railway trial](https://docs.railway.com/pricing/free-trial), [plans](https://docs.railway.com/pricing/plans), and [volumes](https://docs.railway.com/volumes).
- Navidrome API reference: [Navidrome developer docs](https://www.navidrome.org/docs/developers/).
- The current community Lidarr integration and its requirements: [Lidarr slskd plugin](https://github.com/allquiet-hub/Lidarr.Plugin.Slskd). Recheck before Phase 6.
