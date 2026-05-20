# StreamFlare
StreamFlare- The Online Entertainment Hub combines movies, music, and games into one platform, offering users a comprehensive multimedia experience. Each section—Movies, Music, and Games—provides unique content and functionality, enhancing user engagement and ensuring a dynamic, immersive experience tailored to individual interests.

## Development

- Start the dev server (allows Next to pick an available port):

```powershell
cd streamflare-hub-core-streamflare
npm run dev
```

- If you need to force the dev server to run on port 3000 (Windows):

```powershell
npm run dev:3000
```

- Note: If you previously loaded the app from a different port, the browser may try to load compiled chunk files from that old port which causes a "ChunkLoadError". To fix:
	- Open the URL printed by the dev server (for example `http://localhost:3001`) instead of assuming `:3000`.
	- Hard-refresh (Ctrl+F5) or clear site data for `localhost` to remove stale references.
