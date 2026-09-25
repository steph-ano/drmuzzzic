<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AudioDbClient
{
    protected string $baseUrl;
    protected string $apiKey;
    protected int $cacheTtl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.audiodb.base_url', 'https://www.theaudiodb.com/api/v1/json'), '/');
        $this->apiKey = (string) config('services.audiodb.key', '123');
        $this->cacheTtl = (int) config('services.audiodb.cache_ttl', 86400);
    }

    /**
     * Search artists by name with query caching.
     */
    public function searchArtists(string $query): Collection
    {
        $cleanQuery = trim($query);
        if (empty($cleanQuery)) {
            return collect();
        }

        $cacheKey = 'audiodb:search:' . md5(strtolower($cleanQuery));

        $data = Cache::remember($cacheKey, $this->cacheTtl, function () use ($cleanQuery) {
            $res = $this->get('search.php', ['s' => $cleanQuery]);
            $artists = $res['artists'] ?? [];

            if (!is_array($artists)) {
                return [];
            }

            return collect($artists)->map(fn ($artist) => $this->normalizeArtist($artist))->values()->all();
        });

        return collect(is_array($data) ? $data : []);
    }

    /**
     * Lookup artist details by ID or fallback by name.
     */
    public function getArtistDetails(string $idOrName): ?array
    {
        $identifier = trim($idOrName);
        if (empty($identifier)) {
            return null;
        }

        $cacheKey = 'audiodb:artist:' . md5(strtolower($identifier));

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($identifier) {
            $endpoint = ctype_digit($identifier) ? 'artist.php' : 'search.php';
            $param = ctype_digit($identifier) ? ['i' => $identifier] : ['s' => $identifier];

            $data = $this->get($endpoint, $param);
            $artists = $data['artists'] ?? [];

            if (empty($artists) || !is_array($artists)) {
                return null;
            }

            return $this->normalizeArtist($artists[0]);
        });
    }

    /**
     * Get albums for an artist, sorted chronologically by year.
     * Overcomes TheAudioDB free test key 1-album cap by enriching with open catalogue.
     */
    public function getArtistAlbums(string $artistId, ?string $artistName = null): Collection
    {
        $cleanId = trim($artistId);
        $cleanName = trim((string) $artistName);

        if (empty($cleanId) && empty($cleanName)) {
            return collect();
        }

        $cacheKey = "audiodb:albums:" . md5("{$cleanId}_{$cleanName}");

        $cached = Cache::remember($cacheKey, $this->cacheTtl, function () use ($cleanId, $cleanName) {
            $albums = [];

            if (!empty($cleanId)) {
                $data = $this->get('album.php', ['i' => $cleanId]);
                $rawAlbums = $data['album'] ?? [];

                if (is_array($rawAlbums)) {
                    $albums = collect($rawAlbums)->map(fn ($album) => $this->normalizeAlbum($album))->values()->all();
                }
            }

            // TheAudioDB free tier (key 123) intentionally caps discographies to 1 album.
            // If capped or empty, enrich via open music catalogue for complete discographies.
            if (count($albums) <= 1 && !empty($cleanName)) {
                $enrichedAlbums = $this->fetchEnrichedAlbums($cleanName, $cleanId);
                if ($enrichedAlbums->isNotEmpty()) {
                    return $enrichedAlbums->values()->all();
                }
            }

            return collect($albums)
                ->sortByDesc(fn ($album) => $album['year'] ?? 0)
                ->values()
                ->all();
        });

        return collect(is_array($cached) ? $cached : [])
            ->sortByDesc(fn ($album) => $album['year'] ?? 0)
            ->values();
    }

    /**
     * Get tracklist for an album. Supports TheAudioDB and enriched providers.
     */
    public function getAlbumTracks(string $albumId): Collection
    {
        $cleanId = trim($albumId);
        if (empty($cleanId)) {
            return collect();
        }

        $cacheKey = "audiodb:tracks:{$cleanId}";

        $cached = Cache::remember($cacheKey, $this->cacheTtl, function () use ($cleanId) {
            // Check if this is an enriched external album ID (e.g. from Apple Music catalogue)
            if (str_starts_with($cleanId, 'ext_') || (is_numeric($cleanId) && strlen($cleanId) >= 8)) {
                $numericId = str_replace('ext_', '', $cleanId);
                $tracks = $this->fetchEnrichedTracks($numericId);
                if ($tracks->isNotEmpty()) {
                    return $tracks->values()->all();
                }
            }

            $data = $this->get('track.php', ['m' => $cleanId]);
            $tracks = $data['track'] ?? [];

            if (is_array($tracks) && !empty($tracks)) {
                return collect($tracks)
                    ->map(fn ($track) => $this->normalizeTrack($track))
                    ->sortBy(fn ($track) => $track['track_number'] ?? 999)
                    ->values()
                    ->all();
            }

            // Fallback lookup
            return $this->fetchEnrichedTracks($cleanId)->values()->all();
        });

        return collect(is_array($cached) ? $cached : []);
    }

    /**
     * Enrich discography from open public music database (iTunes API).
     */
    protected function fetchEnrichedAlbums(string $artistName, string $artistId): Collection
    {
        try {
            $url = 'https://itunes.apple.com/search';
            $response = Http::withoutVerifying()
                ->timeout(8)
                ->get($url, [
                    'term' => $artistName,
                    'entity' => 'album',
                    'limit' => 35,
                ]);

            if (!$response->successful()) {
                return collect();
            }

            $results = $response->json('results') ?? [];
            if (!is_array($results)) {
                return collect();
            }

            $seenTitles = [];

            return collect($results)
                ->filter(function ($item) use ($artistName, &$seenTitles) {
                    $itemArtist = strtolower($item['artistName'] ?? '');
                    $targetArtist = strtolower($artistName);

                    // Check artist name match
                    if (!str_contains($itemArtist, $targetArtist) && !str_contains($targetArtist, $itemArtist)) {
                        return false;
                    }

                    $title = strtolower($item['collectionName'] ?? '');
                    // Normalize title (remove deluxe/anniversary variations for deduping)
                    $cleanTitle = preg_replace('/(\(.*?\)|\[.*?\]|-.*edition.*|-.*remaster.*)/i', '', $title);
                    $cleanTitle = trim($cleanTitle);

                    if (empty($cleanTitle) || isset($seenTitles[$cleanTitle]) || str_contains($title, 'karaoke') || str_contains($title, ' - single') || str_contains($title, '- single')) {
                        return false;
                    }

                    $seenTitles[$cleanTitle] = true;
                    return true;
                })
                ->map(function ($item) use ($artistId) {
                    $year = isset($item['releaseDate']) && strlen($item['releaseDate']) >= 4
                        ? (int) substr($item['releaseDate'], 0, 4)
                        : null;

                    // Upgrade artwork resolution to 600x600 for HD display
                    $artwork = $item['artworkUrl100'] ?? '';
                    $hdArtwork = !empty($artwork)
                        ? str_replace('100x100bb', '600x600bb', $artwork)
                        : null;

                    return [
                        'id' => 'ext_' . ($item['collectionId'] ?? ''),
                        'artist_id' => $artistId,
                        'title' => $item['collectionName'] ?? 'Untitled Album',
                        'year' => $year,
                        'genre' => $item['primaryGenreName'] ?? null,
                        'description' => null,
                        'thumb_url' => $hdArtwork,
                    ];
                })
                ->sortByDesc(fn ($album) => $album['year'] ?? 0)
                ->values();
        } catch (\Throwable $e) {
            Log::warning('Error enriching discography from public provider: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Enrich tracklist with 30s playable audio previews.
     */
    protected function fetchEnrichedTracks(string $collectionId): Collection
    {
        try {
            $numericId = preg_replace('/[^0-9]/', '', $collectionId);
            if (empty($numericId)) {
                return collect();
            }

            $url = 'https://itunes.apple.com/lookup';
            $response = Http::withoutVerifying()
                ->timeout(8)
                ->get($url, [
                    'id' => $numericId,
                    'entity' => 'song',
                ]);

            if (!$response->successful()) {
                return collect();
            }

            $results = $response->json('results') ?? [];
            if (!is_array($results)) {
                return collect();
            }

            return collect($results)
                ->filter(fn ($item) => ($item['wrapperType'] ?? '') === 'track')
                ->map(function ($item) use ($collectionId) {
                    $durationMs = isset($item['trackTimeMillis']) ? (int) $item['trackTimeMillis'] : 0;
                    return [
                        'id' => (string) ($item['trackId'] ?? ''),
                        'album_id' => $collectionId,
                        'artist_id' => (string) ($item['artistId'] ?? ''),
                        'title' => $item['trackName'] ?? 'Untitled Track',
                        'track_number' => isset($item['trackNumber']) ? (int) $item['trackNumber'] : null,
                        'duration_ms' => $durationMs,
                        'duration_formatted' => $this->formatDuration($durationMs),
                        'video_url' => null,
                        'preview_url' => $item['previewUrl'] ?? null,
                    ];
                })
                ->sortBy(fn ($t) => $t['track_number'] ?? 999)
                ->values();
        } catch (\Throwable $e) {
            Log::warning('Error fetching enriched tracklist: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Execute HTTP GET request against TheAudioDB with retry and timeout.
     */
    protected function get(string $endpoint, array $queryParams = []): array
    {
        $url = "{$this->baseUrl}/{$this->apiKey}/{$endpoint}";

        try {
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->retry(2, 300, throw: false)
                ->get($url, $queryParams);

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::warning('TheAudioDB request returned non-200 status', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [];
        } catch (\Throwable $e) {
            Log::error('TheAudioDB HTTP Exception: ' . $e->getMessage(), [
                'url' => $url,
                'params' => $queryParams,
            ]);

            return [];
        }
    }

    /**
     * Normalize artist payload with fallback and secure image URLs.
     */
    protected function normalizeArtist(array $raw): array
    {
        return [
            'id' => (string) ($raw['idArtist'] ?? ''),
            'name' => $raw['strArtist'] ?? 'Unknown Artist',
            'formed_year' => $raw['intBornYear'] ?? $raw['intFormedYear'] ?? null,
            'genre' => $raw['strGenre'] ?? 'Music',
            'style' => $raw['strStyle'] ?? null,
            'country' => $raw['strCountry'] ?? '',
            'biography' => !empty($raw['strBiographyES']) ? $raw['strBiographyES'] : ($raw['strBiographyEN'] ?? 'No biography available.'),
            'thumb_url' => $this->secureUrl($raw['strArtistThumb'] ?? null),
            'logo_url' => $this->secureUrl($raw['strArtistLogo'] ?? null),
            'fanart_url' => $this->secureUrl($raw['strArtistFanart'] ?? null),
            'fanart2_url' => $this->secureUrl($raw['strArtistFanart2'] ?? null),
            'banner_url' => $this->secureUrl($raw['strArtistBanner'] ?? null),
            'website' => $raw['strWebsite'] ?? null,
        ];
    }

    /**
     * Normalize album payload.
     */
    protected function normalizeAlbum(array $raw): array
    {
        return [
            'id' => (string) ($raw['idAlbum'] ?? ''),
            'artist_id' => (string) ($raw['idArtist'] ?? ''),
            'title' => $raw['strAlbum'] ?? 'Untitled Album',
            'year' => isset($raw['intYearReleased']) && is_numeric($raw['intYearReleased']) ? (int) $raw['intYearReleased'] : null,
            'genre' => $raw['strGenre'] ?? null,
            'description' => $raw['strDescriptionEN'] ?? null,
            'thumb_url' => $this->secureUrl($raw['strAlbumThumb'] ?? null),
        ];
    }

    /**
     * Normalize track payload and format milliseconds into MM:SS.
     */
    protected function normalizeTrack(array $raw): array
    {
        $durationMs = isset($raw['intDuration']) && is_numeric($raw['intDuration']) ? (int) $raw['intDuration'] : 0;

        return [
            'id' => (string) ($raw['idTrack'] ?? ''),
            'album_id' => (string) ($raw['idAlbum'] ?? ''),
            'artist_id' => (string) ($raw['idArtist'] ?? ''),
            'title' => $raw['strTrack'] ?? 'Untitled Track',
            'track_number' => isset($raw['intTrackNumber']) && is_numeric($raw['intTrackNumber']) ? (int) $raw['intTrackNumber'] : null,
            'duration_ms' => $durationMs,
            'duration_formatted' => $this->formatDuration($durationMs),
            'video_url' => $raw['strMusicVid'] ?? null,
            'preview_url' => null,
        ];
    }

    /**
     * Convert milliseconds into formatted MM:SS string.
     */
    protected function formatDuration(int $durationMs): string
    {
        $totalSeconds = (int) round($durationMs / 1000);
        $minutes = floor($totalSeconds / 60);
        $seconds = $totalSeconds % 60;

        return $totalSeconds > 0 ? sprintf('%d:%02d', $minutes, $seconds) : '--:--';
    }

    /**
     * Ensure HTTP URLs are upgraded to HTTPS for assets.
     */
    protected function secureUrl(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        return str_starts_with($url, 'http://')
            ? 'https://' . substr($url, 7)
            : $url;
    }
}
