<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\ArtistController;
use Illuminate\Support\Facades\Route;

// Web Pages (Inertia Full Pages)
Route::get('/', [ArtistController::class, 'index'])->name('home');
Route::get('/artists/{id}', [ArtistController::class, 'show'])->name('artists.show');

// Internal JSON APIs (For frontend dynamic search and tracklist drawers)
Route::prefix('api')->group(function () {
    Route::get('/artists/search', [ArtistController::class, 'search'])->name('api.artists.search');
    Route::get('/albums/{id}/tracks', [AlbumController::class, 'tracks'])->name('api.albums.tracks');
});
