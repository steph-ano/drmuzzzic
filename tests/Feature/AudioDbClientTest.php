<?php

namespace Tests\Feature;

use App\Services\AudioDbClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AudioDbClientTest extends TestCase
{
    protected AudioDbClient $client;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->client = new AudioDbClient();
    }

    public function test_can_search_artists_with_normalization(): void
    {
        Http::fake([
            '*/search.php*' => Http::response([
                'artists' => [
                    [
                        'idArtist' => '111239',
                        'strArtist' => 'Coldplay',
                        'strGenre' => 'Alternative Rock',
                        'strCountry' => 'United Kingdom',
                        'strArtistThumb' => 'http://example.com/coldplay.jpg',
                        'strArtistLogo' => 'http://example.com/logo.png',
                        'strArtistFanart' => 'http://example.com/fanart.jpg',
                        'strBiographyEN' => 'British rock band formed in London in 1997.',
                    ],
                ],
            ], 200),
        ]);

        $results = $this->client->searchArtists('Coldplay');

        $this->assertCount(1, $results);
        $artist = $results->first();
        $this->assertEquals('111239', $artist['id']);
        $this->assertEquals('Coldplay', $artist['name']);
        $this->assertEquals('https://example.com/coldplay.jpg', $artist['thumb_url']);
        $this->assertEquals('https://example.com/logo.png', $artist['logo_url']);
    }

    public function test_search_results_are_cached(): void
    {
        Http::fake([
            '*/search.php*' => Http::response([
                'artists' => [
                    ['idArtist' => '111239', 'strArtist' => 'Coldplay'],
                ],
            ], 200),
        ]);

        // First call should hit HTTP
        $this->client->searchArtists('Coldplay');

        // Second call should come from cache
        $this->client->searchArtists('Coldplay');

        Http::assertSentCount(1);
    }

    public function test_can_fetch_and_sort_albums(): void
    {
        Http::fake([
            '*/album.php*' => Http::response([
                'album' => [
                    [
                        'idAlbum' => '2',
                        'strAlbum' => 'A Rush of Blood to the Head',
                        'intYearReleased' => '2002',
                    ],
                    [
                        'idAlbum' => '1',
                        'strAlbum' => 'Parachutes',
                        'intYearReleased' => '2000',
                    ],
                ],
            ], 200),
        ]);

        $albums = $this->client->getArtistAlbums('111239');

        $this->assertCount(2, $albums);
        // Verify chronological sorting (newest 2002 before 2000)
        $this->assertEquals('A Rush of Blood to the Head', $albums->first()['title']);
        $this->assertEquals(2002, $albums->first()['year']);
        $this->assertEquals(2000, $albums->last()['year']);
    }

    public function test_track_duration_formatting(): void
    {
        Http::fake([
            '*/track.php*' => Http::response([
                'track' => [
                    [
                        'idTrack' => '100',
                        'strTrack' => 'Yellow',
                        'intTrackNumber' => '5',
                        'intDuration' => '269000', // 4 minutes 29 seconds
                    ],
                ],
            ], 200),
        ]);

        $tracks = $this->client->getAlbumTracks('1');

        $this->assertCount(1, $tracks);
        $track = $tracks->first();
        $this->assertEquals('Yellow', $track['title']);
        $this->assertEquals('4:29', $track['duration_formatted']);
    }

    public function test_handles_empty_or_failed_responses_gracefully(): void
    {
        Http::fake([
            '*/search.php*' => Http::response(null, 500),
        ]);

        $results = $this->client->searchArtists('NonExistentBand');

        $this->assertCount(0, $results);
    }
}
