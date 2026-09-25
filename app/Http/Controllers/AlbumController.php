<?php

namespace App\Http\Controllers;

use App\Services\AudioDbClient;
use Illuminate\Http\JsonResponse;

class AlbumController extends Controller
{
    public function __construct(
        protected AudioDbClient $audioDb
    ) {}

    /**
     * Get tracklist for an album.
     */
    public function tracks(string $albumId): JsonResponse
    {
        $tracks = $this->audioDb->getAlbumTracks($albumId);

        return response()->json([
            'tracks' => $tracks,
        ]);
    }
}
