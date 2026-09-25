import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Compass,
    Disc3,
    Globe,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react';
import Navbar from '@/Components/Navbar';
import AlbumCard from '@/Components/AlbumCard';
import TrackListDrawer from '@/Components/TrackListDrawer';
import ImageFallback from '@/Components/ImageFallback';

export default function Show({ artist, albums = [] }) {
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (!carouselRef.current) return;
        const scrollAmount = 450;
        carouselRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    // Backdrop priority: fanart -> fanart2 -> thumb
    const heroImage = artist.fanart_url || artist.fanart2_url || artist.thumb_url;

    return (
        <div className="min-h-screen bg-[#0a0a0d] text-slate-100 selection:bg-amber-500 selection:text-black">
            <Head title={`${artist.name} — Artist Chronicle`} />

            {/* Top Navigation */}
            <Navbar />

            {/* Cinematic Hero Section */}
            <section className="relative min-h-[75vh] flex flex-col justify-end overflow-hidden border-b border-white/5">
                {/* Hero Fanart Background with Dark Masks */}
                {heroImage && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={heroImage}
                            alt={artist.name}
                            className="w-full h-full object-cover object-top filter brightness-65 scale-102 transform duration-1000"
                        />
                        {/* Multi-layered Gradients for Cinematic Contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/65 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0d] via-transparent to-[#0a0a0d]/50" />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80" />
                    </div>
                )}

                {/* Breadcrumbs & Back Link */}
                <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90 hover:text-amber-300 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 hover:border-amber-400/30 transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Archive</span>
                    </Link>
                </div>

                {/* Artist Brand, Transparent Logo & Badges */}
                <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="flex-1 max-w-3xl">
                        {/* Transparent PNG Logo or Name */}
                        {artist.logo_url ? (
                            <div className="mb-6 max-w-xs sm:max-w-md filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                                <img
                                    src={artist.logo_url}
                                    alt={`${artist.name} Logo`}
                                    className="max-h-24 sm:max-h-32 w-auto object-contain"
                                />
                            </div>
                        ) : (
                            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white drop-shadow-2xl mb-4">
                                {artist.name}
                            </h1>
                        )}

                        {/* Metadata Tags */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-neutral-300">
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{artist.genre || 'Rock & Alternative'}</span>
                            </span>

                            {artist.style && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-neutral-200 border border-white/10 backdrop-blur-sm">
                                    {artist.style}
                                </span>
                            )}

                            {artist.country && (
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-200 border border-white/10 backdrop-blur-sm">
                                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{artist.country}</span>
                                </span>
                            )}

                            {artist.formed_year && (
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-200 border border-white/10 backdrop-blur-sm">
                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>Formed in {artist.formed_year}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Stat Pill */}
                    <div className="flex items-center space-x-4 bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Disc3 className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-display text-white">
                                {albums.length}
                            </p>
                            <p className="text-xs uppercase tracking-wider text-neutral-400">
                                Discography Releases
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Layout */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                {/* Biography Section */}
                <section className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                            <Compass className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                            Artist Biography & History
                        </h2>
                    </div>

                    <div className="relative">
                        <div
                            className={`prose prose-invert max-w-none text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 font-normal ${
                                !isBioExpanded ? 'line-clamp-4' : ''
                            }`}
                        >
                            {artist.biography
                                ? artist.biography.split('\n\n').map((paragraph, index) => (
                                      <p key={index}>{paragraph}</p>
                                  ))
                                : 'No biography currently registered in TheAudioDB catalogue for this artist.'}
                        </div>

                        {/* Fade mask when collapsed */}
                        {!isBioExpanded && artist.biography && artist.biography.length > 300 && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-900/90 to-transparent pointer-events-none" />
                        )}
                    </div>

                    {artist.biography && artist.biography.length > 300 && (
                        <button
                            type="button"
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
                        >
                            <span>{isBioExpanded ? 'Read Less' : 'Read Full History'}</span>
                            {isBioExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </section>

                {/* Chronological Discography Carousel */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                                Chronological Catalogue
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                                Complete Discography
                            </h2>
                        </div>

                        {/* Carousel Scroll Controls */}
                        {albums.length > 2 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => scrollCarousel('left')}
                                    className="p-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-amber-400/40 text-neutral-300 hover:text-white transition-all shadow-md"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollCarousel('right')}
                                    className="p-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-amber-400/40 text-neutral-300 hover:text-white transition-all shadow-md"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Horizontal Scroll Snap Carousel */}
                    {albums.length > 0 ? (
                        <div
                            ref={carouselRef}
                            className="flex space-x-5 overflow-x-auto pb-6 pt-2 snap-carousel no-scrollbar scroll-smooth"
                        >
                            {albums.map((album) => (
                                <AlbumCard
                                    key={album.id}
                                    album={album}
                                    onSelect={(selected) => setSelectedAlbum(selected)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-neutral-900/30 border border-white/5 rounded-3xl">
                            <Disc3 className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                            <p className="text-neutral-400 text-sm">
                                No studio albums currently recorded for this artist.
                            </p>
                        </div>
                    )}
                </section>
            </main>

            {/* Album Tracklist Drawer / Modal */}
            <TrackListDrawer
                album={selectedAlbum}
                isOpen={Boolean(selectedAlbum)}
                onClose={() => setSelectedAlbum(null)}
            />

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#0a0a0d] py-12 mt-20 text-center text-xs text-neutral-500">
                <p>DRMUZZZIC — Powered by TheAudioDB & Laravel 11 + Inertia React</p>
            </footer>
        </div>
    );
}
