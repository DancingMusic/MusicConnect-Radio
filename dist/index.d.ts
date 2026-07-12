import { MusicConnector, MusicConnectorMeta, MusicListQuery, MusicSearchResult, MusicTrack, MusicStreamInfo } from '@dancingmusic/music-connect';

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

declare class RadioConnector implements MusicConnector {
    readonly meta: MusicConnectorMeta;
    private base;
    init(): Promise<void>;
    search(query: MusicListQuery): Promise<MusicSearchResult>;
    getTrack(trackId: string): Promise<MusicTrack | null>;
    getStreamUrl(trackId: string): Promise<MusicStreamInfo | null>;
    private parseId;
}

export { RadioConnector, RadioConnector as default };
