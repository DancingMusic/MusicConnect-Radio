// src/index.ts
var ENDPOINTS = [
  "https://de1.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://fi1.api.radio-browser.info"
];
function pickEndpoint() {
  return ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
}
function stationToTrack(s) {
  return {
    id: `radio:${s.stationuuid}`,
    title: s.name?.trim() || "Unknown Station",
    artist: [s.country, s.language].filter(Boolean).join(" \xB7 ") || "Radio Browser",
    album: s.tags?.split(",")?.slice(0, 3).map((t) => t.trim()).filter(Boolean).join(" \xB7 "),
    coverUrl: s.favicon || void 0,
    durationSec: 0,
    // live stream — unknown duration
    price: 0,
    currency: "USD",
    version: "1.0.0",
    createdAt: "",
    updatedAt: ""
  };
}
var RadioConnector = class {
  constructor() {
    this.meta = {
      id: "radio-browser",
      name: "Internet Radio",
      description: "Free internet radio stations from radio-browser.info",
      version: "0.1.0",
      capabilities: ["search", "stream"]
    };
    this.base = pickEndpoint();
  }
  async init() {
  }
  async search(query) {
    const keyword = (query.keyword || "").trim();
    const pageSize = query.pageSize ?? 30;
    const offset = ((query.page ?? 1) - 1) * pageSize;
    const params = new URLSearchParams({
      name: keyword || "",
      limit: String(pageSize),
      offset: String(offset),
      hidebroken: "true",
      order: "clickcount",
      reverse: "true"
    });
    const url = `${this.base}/json/stations/search?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Radio Browser search failed: ${res.status}`);
    const stations = await res.json();
    return {
      tracks: stations.map(stationToTrack),
      total: stations.length,
      page: query.page ?? 1,
      pageSize
    };
  }
  async getTrack(trackId) {
    const uuid = this.parseId(trackId);
    if (!uuid) return null;
    const res = await fetch(`${this.base}/json/stations/byuuid/${uuid}`);
    if (!res.ok) return null;
    const arr = await res.json();
    return arr[0] ? stationToTrack(arr[0]) : null;
  }
  async getStreamUrl(trackId) {
    const uuid = this.parseId(trackId);
    if (!uuid) return null;
    const res = await fetch(`${this.base}/json/stations/byuuid/${uuid}`);
    if (!res.ok) return null;
    const arr = await res.json();
    const s = arr[0];
    const url = s?.url_resolved || s?.url;
    if (!url) return null;
    return {
      url,
      format: s.codec?.toLowerCase() || "mp3",
      bitrate: s.bitrate ? s.bitrate * 1e3 : void 0
    };
  }
  parseId(trackId) {
    if (trackId.startsWith("radio:")) return trackId.slice(6);
    if (/^[0-9a-f-]+$/i.test(trackId)) return trackId;
    return null;
  }
};
var index_default = RadioConnector;
export {
  RadioConnector,
  index_default as default
};
