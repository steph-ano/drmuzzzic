import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Disc3, Sparkles, TrendingUp, Music, ArrowRight, Radio } from 'lucide-react';
import Navbar from '@/Components/Navbar';
import SearchBar from '@/Components/SearchBar';
import ImageFallback from '@/Components/ImageFallback';

export default function Home({ featuredArtists = [] }) {
    const heroArtist = featuredArtists[0] || null;
    const secondaryArtists = featuredArtists.slice(1);

    return (
        <div className="min-h-screen bg-[#0a0a0d] text-slate-100 selection:bg-amber-500 selection:text-black">
            <Head title="Explore Music Legends — Interactive Digital Chronicle" />

            <Navbar showSearch={false} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
                {/* Hero Editorial Showcase */}
                {heroArtist && (
                    <section className="relative rounded-3xl overflow-hidden min-h-[480px] sm:min-h-[540px] flex flex-col justify-end p-6 sm:p-12 border border-white/10 shadow-2xl group">
                        {/* Background Fanart */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src={heroArtist.fanart_url || heroArtist.thumb_url}
                                alt={heroArtist.name}
                                className="w-full h-full object-cover object-center filter brightness-60 group-hover:scale-103 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/50 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0d]/90 via-[#0a0a0d]/40 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 max-w-2xl space-y-4">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Featured Chronicle</span>
                            </div>

                            {heroArtist.logo_url ? (
                                <div className="max-w-xs sm:max-w-sm py-2 filter drop-shadow-2xl">
                                    <img
                                        src={heroArtist.logo_url}
                                        alt={heroArtist.name}
                                        className="max-h-24 w-auto object-contain"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight">
                                    {heroArtist.name}
                                </h2>
                            )}

                            <p className="text-neutral-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl">
                                {heroArtist.biography}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center gap-4">
                                <Link
                                    href={`/artists/${heroArtist.id}`}
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-sm px-6 py-3.5 rounded-full shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
                                >
                                    <span>Explore Full Chronicle</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                <div className="text-xs text-neutral-400 flex items-center space-x-2">
                                    <span className="font-semibold text-white">{heroArtist.genre}</span>
                                    <span>•</span>
                                    <span>{heroArtist.country}</span>
                                    {heroArtist.formed_year && (
                                        <>
                                            <span>•</span>
                                            <span>Est. {heroArtist.formed_year}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Central High-Impact Search Section */}
                <section className="text-center py-6 space-y-6">
                    <div className="max-w-2xl mx-auto space-y-3">
                        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                            The Complete Sonic Vault
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                            Find Any Artist, Band or Legacy
                        </h2>
                        <p className="text-sm text-neutral-400">
                            Query thousands of discographies, tracklists, transparent vector logos and high-res fanarts in real-time.
                        </p>
                    </div>

                    <div className="flex justify-center pt-2">
                        <SearchBar className="max-w-2xl" />
                    </div>
                </section>

                {/* Curated Legends Grid */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                                Iconic Legends & Curated Archives
                            </h3>
                        </div>
                        <span className="text-xs text-neutral-400 hidden sm:inline">
                            Live metadata from TheAudioDB
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {secondaryArtists.map((artist) => (
                            <Link
                                key={artist.id}
                                href={`/artists/${artist.id}`}
                                className="group relative rounded-3xl overflow-hidden bg-neutral-900/60 border border-white/10 hover:border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
                            >
                                <div className="space-y-4">
                                    {/* Fanart Thumbnail */}
                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-800 shadow-inner">
                                        <ImageFallback
                                            src={artist.fanart_url || artist.thumb_url}
                                            alt={artist.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                        {artist.formed_year && (
                                            <span className="absolute bottom-3 left-3 text-[11px] font-mono font-medium text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                                                {artist.formed_year}
                                            </span>
                                        )}
                                    </div>

                                    {/* Logo or Title */}
                                    <div>
                                        {artist.logo_url ? (
                                            <div className="h-10 flex items-center filter drop-shadow">
                                                <img
                                                    src={artist.logo_url}
                                                    alt={artist.name}
                                                    className="max-h-9 w-auto object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <h4 className="text-xl font-bold font-display text-white group-hover:text-amber-400 transition-colors">
                                                {artist.name}
                                            </h4>
                                        )}

                                        <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                                            {artist.biography}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                    <span className="text-amber-400/90 font-medium">
                                        {artist.genre || 'Rock'}
                                    </span>
                                    <span className="inline-flex items-center space-x-1 text-neutral-400 group-hover:text-white transition-colors">
                                        <span>View Chronicle</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#0a0a0d] py-12 mt-20 text-center text-xs text-neutral-500">
                <p>DRMUZZZIC — Interactive Digital Music Magazine • Built with Laravel, Inertia, React & Tailwind</p>
            </footer>
        </div>
    );
}
