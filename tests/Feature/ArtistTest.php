<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ArtistTest extends TestCase
{
    public function test_home_page_can_be_rendered(): void
    {
        Http::fake([
            '*/artist.php*' => Http::response(['artists' => []], 200),
            '*/search.php*' => Http::response(['artists' => []], 200),
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_api_artist_search_returns_json(): void
    {
        Http::fake([
            '*/search.php*' => Http::response([
                'artists' => [
                    [
                        'idArtist' => '111239',
                        'strArtist' => 'Coldplay',
                        'strGenre' => 'Alternative Rock',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/artists/search?q=Coldplay');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'artists' => [
                    '*' => ['id', 'name', 'genre'],
                ],
            ]);
    }

    public function test_api_album_tracks_returns_json(): void
    {
        Http::fake([
            '*/track.php*' => Http::response([
                'track' => [
                    [
                        'idTrack' => '1',
                        'strTrack' => 'Yellow',
                        'intDuration' => '269000',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/albums/1/tracks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'tracks' => [
                    '*' => ['id', 'title', 'duration_formatted'],
                ],
            ]);
    }
}
