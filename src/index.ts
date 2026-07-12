/**
 * Internet Radio music connector for DancingMusic.
 *
 * Backed by the Radio Browser community catalog (radio-browser.info) —
 * 30,000+ free internet radio stations, public API, no key required.
 * https://api.radio-browser.info/
 *
 * Track ID format: `radio:<station-uuid>`
 *
 * Stations are presented as long-running tracks (durationSec: 0 means unknown);
 * the host app can play their resolved stream URL directly.
 */
import type {
  MusicConnector,
  MusicConnectorMeta,
  MusicListQuery,
  MusicSearchResult,
  MusicStreamInfo,
  MusicTrack,
} from "@dancingmusic/music-connect";

interface Station {
  stationuuid: string;
  name: string;
  url_resolved?: string;
  url?: string;
  homepage?: string;
  favicon?: string;
  country?: string;
  language?: string;
  tags?: string;
  codec?: string;
  bitrate?: number;
}

// The DNS round-robin endpoint rotates among community mirrors.
const ENDPOINTS = [
  "https://de1.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://fi1.api.radio-browser.info",
];

function pickEndpoint(): string {
  return ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
}

function stationToTrack(s: Station): MusicTrack {
  return {
    id: `radio:${s.stationuuid}`,
    title: s.name?.trim() || "Unknown Station",
    artist: [s.country, s.language].filter(Boolean).join(" · ") || "Radio Browser",
    album: s.tags?.split(",")?.slice(0, 3).map(t => t.trim()).filter(Boolean).join(" · "),
    coverUrl: s.favicon || undefined,
    durationSec: 0,  // live stream — unknown duration
    price: 0,
    currency: "USD",
    version: "1.0.0",
    createdAt: "",
    updatedAt: "",
  };
}

export class RadioConnector implements MusicConnector {
  readonly meta: MusicConnectorMeta = {
    id: "radio-browser",
    name: "Internet Radio",
    description: "Free internet radio stations from radio-browser.info",
    familyId: "radio-browser",
    variant: "anonymous",
    authRequirement: "none",
    supportedHosts: ["web", "desktop"],
    version: "0.1.2",
    capabilities: ["search", "stream"],
  };

  private base = pickEndpoint();

  async init(): Promise<void> {
    /* no-op */
  }

  async search(query: MusicListQuery): Promise<MusicSearchResult> {
    const keyword = (query.keyword || "").trim();
    const pageSize = query.pageSize ?? 30;
    const offset = ((query.page ?? 1) - 1) * pageSize;

    const params = new URLSearchParams({
      name: keyword || "",
      limit: String(pageSize),
      offset: String(offset),
      hidebroken: "true",
      order: "clickcount",
      reverse: "true",
    });
    const url = `${this.base}/json/stations/search?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Radio Browser search failed: ${res.status}`);
    const stations = (await res.json()) as Station[];

    return {
      tracks: stations.map(stationToTrack),
      total: stations.length,
      page: query.page ?? 1,
      pageSize,
    };
  }

  async getTrack(trackId: string): Promise<MusicTrack | null> {
    const uuid = this.parseId(trackId);
    if (!uuid) return null;
    const res = await fetch(`${this.base}/json/stations/byuuid/${uuid}`);
    if (!res.ok) return null;
    const arr = (await res.json()) as Station[];
    return arr[0] ? stationToTrack(arr[0]) : null;
  }

  async getStreamUrl(trackId: string): Promise<MusicStreamInfo | null> {
    const uuid = this.parseId(trackId);
    if (!uuid) return null;
    const res = await fetch(`${this.base}/json/stations/byuuid/${uuid}`);
    if (!res.ok) return null;
    const arr = (await res.json()) as Station[];
    const s = arr[0];
    const url = s?.url_resolved || s?.url;
    if (!url) return null;
    return {
      url,
      format: s.codec?.toLowerCase() || "mp3",
      bitrate: s.bitrate ? s.bitrate * 1000 : undefined,
    };
  }

  private parseId(trackId: string): string | null {
    if (trackId.startsWith("radio:")) return trackId.slice(6);
    if (/^[0-9a-f-]+$/i.test(trackId)) return trackId;
    return null;
  }
}

export default RadioConnector;
