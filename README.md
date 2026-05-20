# @dancingmusic/music-connect-radio

Internet Radio music connector for [DancingMusic](https://github.com/DancingMusic/DancingMusic), backed by [Radio Browser](https://www.radio-browser.info) — a community-maintained directory of 30,000+ free internet radio stations.

🔗 **Live demo:** [https://dancingmusic.github.io/MusicConnect-Radio/](https://dancingmusic.github.io/MusicConnect-Radio/) — search + play table built from this connector's own `dist/index.js`.

No API key, no auth, CORS-friendly.

## Use in DancingMusic

Open the music store → top-right connector switcher → **添加连接器** → **GitHub** tab → paste:

```
https://github.com/DancingMusic/MusicConnect-Radio
```

## Track ID format

`radio:<station-uuid>` — e.g. `radio:510506e7-6bc0-4b91-b6a1-fc024ccad1a8`

## API endpoints used

- `GET /json/stations/search` — keyword search ordered by click count
- `GET /json/stations/byuuid/{uuid}` — single station + stream URL

## License

MIT

## Versioned releases

This repo uses an auto-release workflow ([`.github/workflows/release.yml`](.github/workflows/release.yml)) that creates a `v<package.json version>` tag + GitHub Release on every push to `main` whose version field has changed. Each release attaches the freshly-built `dist/index.js`.

**Pin to a specific version** (recommended for production):
```
https://cdn.jsdelivr.net/gh/DancingMusic/MusicConnect-Radio@v0.1.0/dist/index.js
```

**Always-latest** (handy for dev, but jsdelivr caches `@main` for up to a week):
```
https://cdn.jsdelivr.net/gh/DancingMusic/MusicConnect-Radio@main/dist/index.js
```

### Releasing a new version

1. Edit code under `src/`
2. `npm version patch` (or `minor` / `major`) — bumps `package.json`
3. `npm run build` — refreshes `dist/index.js`
4. Commit (including `dist/`) + push to `main`
5. The workflow detects the new version, creates the tag, and publishes the GitHub Release automatically
