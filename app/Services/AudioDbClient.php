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

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($cleanQuery) {
            $data = $this->get('search.php', ['s' => $cleanQuery]);
            $artists = $data['artists'] ?? [];

            if (!is_array($artists)) {
                return collect();
            }

            return collect($artists)->map(fn ($artist) => $this->normalizeArtist($artist));
        });
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
     */
    public function getArtistAlbums(string $artistId): Collection
    {
        $cleanId = trim($artistId);
        if (empty($cleanId)) {
            return collect();
        }

        $cacheKey = "audiodb:albums:{$cleanId}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($cleanId) {
            $data = $this->get('album.php', ['i' => $cleanId]);
            $albums = $data['album'] ?? [];

            if (!is_array($albums)) {
                return collect();
            }

            return collect($albums)
                ->map(fn ($album) => $this->normalizeAlbum($album))
                ->sortBy(fn ($album) => $album['year'] ?? 9999)
                ->values();
        });
    }

    /**
     * Get tracklist for an album.
     */
    public function getAlbumTracks(string $albumId): Collection
    {
        $cleanId = trim($albumId);
        if (empty($cleanId)) {
            return collect();
        }

        $cacheKey = "audiodb:tracks:{$cleanId}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($cleanId) {
            $data = $this->get('track.php', ['m' => $cleanId]);
            $tracks = $data['track'] ?? [];

            if (!is_array($tracks)) {
                return collect();
            }

            return collect($tracks)
                ->map(fn ($track) => $this->normalizeTrack($track))
                ->sortBy(fn ($track) => $track['track_number'] ?? 999)
                ->values();
        });
    }

    /**
     * Execute HTTP GET request against TheAudioDB with retry and timeout.
     */
    protected function get(string $endpoint, array $queryParams = []): array
    {
        $url = "{$this->baseUrl}/{$this->apiKey}/{$endpoint}";

        try {
            $response = Http::timeout(6)
                ->retry(2, 200, throw: false)
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
        $totalSeconds = (int) round($durationMs / 1000);
        $minutes = floor($totalSeconds / 60);
        $seconds = $totalSeconds % 60;
        $formattedDuration = $totalSeconds > 0 ? sprintf('%d:%02d', $minutes, $seconds) : '--:--';

        return [
            'id' => (string) ($raw['idTrack'] ?? ''),
            'album_id' => (string) ($raw['idAlbum'] ?? ''),
            'artist_id' => (string) ($raw['idArtist'] ?? ''),
            'title' => $raw['strTrack'] ?? 'Untitled Track',
            'track_number' => isset($raw['intTrackNumber']) && is_numeric($raw['intTrackNumber']) ? (int) $raw['intTrackNumber'] : null,
            'duration_ms' => $durationMs,
            'duration_formatted' => $formattedDuration,
            'video_url' => $raw['strMusicVid'] ?? null,
        ];
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
