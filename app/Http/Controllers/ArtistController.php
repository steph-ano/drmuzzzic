<?php

namespace App\Http\Controllers;

use App\Services\AudioDbClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArtistController extends Controller
{
    public function __construct(
        protected AudioDbClient $audioDb
    ) {}

    /**
     * Home page with curated showcase artists for digital magazine experience.
     */
    public function index(): Response
    {
        $curatedNames = ['Queen', 'Daft Punk', 'Coldplay', 'Nirvana', 'Gorillaz', 'The Beatles'];

        $featured = collect($curatedNames)->map(function ($name) {
            return $this->audioDb->getArtistDetails($name);
        })->filter()->values();

        return Inertia::render('Home', [
            'featuredArtists' => $featured,
        ]);
    }

    /**
     * Live search endpoint returning JSON for frontend autocomplete with debounce.
     */
    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->input('q', '');

        if (mb_strlen(trim($query)) < 2) {
            return response()->json([
                'artists' => [],
            ]);
        }

        $artists = $this->audioDb->searchArtists($query);

        return response()->json([
            'artists' => $artists,
        ]);
    }

    /**
     * Cinematic Artist Detail view (Fanart fullscreen + Logo + Bio + Discography).
     */
    public function show(string $idOrName): Response
    {
        $artist = $this->audioDb->getArtistDetails($idOrName);

        if (!$artist) {
            abort(404, 'Artist not found');
        }

        $albums = $this->audioDb->getArtistAlbums($artist['id'], $artist['name']);

        return Inertia::render('Artist/Show', [
            'artist' => $artist,
            'albums' => $albums,
        ]);
    }
}
