# @dancingmusic/music-connect-radio

Internet Radio music connector for [DancingMusic](https://github.com/DancingMusic/DancingMusic), backed by [Radio Browser](https://www.radio-browser.info) — a community-maintained directory of 30,000+ free internet radio stations.

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
