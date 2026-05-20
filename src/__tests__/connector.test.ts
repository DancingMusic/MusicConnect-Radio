import { afterEach, describe, expect, it, vi } from "vitest";
import { RadioConnector } from "../index";

function mockFetch(handler: (url: string) => unknown) {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : input.toString();
    return Promise.resolve(new Response(JSON.stringify(handler(url)), {
      status: 200, headers: { "content-type": "application/json" },
    }));
  });
}

describe("RadioConnector (contract)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("declares meta", () => {
    const c = new RadioConnector();
    expect(c.meta.id).toBe("radio-browser");
    expect(c.meta.capabilities).toEqual(expect.arrayContaining(["search", "stream"]));
  });

  it("search returns station-shaped results", async () => {
    mockFetch((url) => {
      expect(url).toContain("/json/stations/search");
      expect(url).toContain("name=jazz");
      return [{
        stationuuid: "abc-uuid",
        name: "Smooth Jazz",
        url_resolved: "https://stream.example.com/jazz.mp3",
        favicon: "https://favicon.example/icon.png",
        country: "US",
        language: "english",
        tags: "jazz,smooth,instrumental",
        codec: "MP3",
        bitrate: 128,
      }];
    });
    const c = new RadioConnector();
    await c.init();
    const r = await c.search({ keyword: "jazz", pageSize: 10 });
    expect(r.tracks).toHaveLength(1);
    const t = r.tracks[0];
    expect(t.id).toBe("radio:abc-uuid");
    expect(t.title).toBe("Smooth Jazz");
    expect(t.coverUrl).toContain("favicon");
    expect(t.durationSec).toBe(0); // live stream
  });

  it("getStreamUrl returns the resolved stream URL", async () => {
    mockFetch((url) => {
      expect(url).toContain("/json/stations/byuuid/abc-uuid");
      return [{
        stationuuid: "abc-uuid",
        name: "Smooth Jazz",
        url_resolved: "https://stream.example.com/jazz.mp3",
        codec: "MP3",
        bitrate: 128,
      }];
    });
    const c = new RadioConnector();
    await c.init();
    const info = await c.getStreamUrl("radio:abc-uuid");
    expect(info).not.toBeNull();
    expect(info!.url).toMatch(/^https?:\/\//);
    expect(info!.format).toBe("mp3");
    expect(info!.bitrate).toBe(128_000);
  });
});
