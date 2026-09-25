import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, Loader2, Music, X } from 'lucide-react';
import { useDebounce } from '@/Hooks/useDebounce';
import ImageFallback from './ImageFallback';

export default function SearchBar({ className = '' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        fetch(`/api/artists/search?q=${encodeURIComponent(debouncedQuery)}`)
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) {
                    setResults(data.artists || []);
                    setIsLoading(false);
                    setIsOpen(true);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setResults([]);
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [debouncedQuery]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (artist) => {
        setIsOpen(false);
        setQuery('');
        router.visit(`/artists/${artist.id || encodeURIComponent(artist.name)}`);
    };

    return (
        <div ref={containerRef} className={`relative w-full max-w-xl ${className}`}>
            <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-neutral-400 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder="Search artist or band (e.g. Queen, Daft Punk, Nirvana)..."
                    className="w-full pl-12 pr-11 py-3.5 bg-neutral-900/80 backdrop-blur-md text-white placeholder-neutral-500 rounded-full border border-white/10 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm shadow-xl"
                />

                <div className="absolute right-4 flex items-center space-x-2">
                    {isLoading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
                    {query && !isLoading && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setResults([]);
                                setIsOpen(false);
                            }}
                            className="text-neutral-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown Results */}
            {isOpen && (debouncedQuery.trim().length >= 2) && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isLoading && results.length === 0 ? (
                        <div className="p-6 text-center text-sm text-neutral-400 flex items-center justify-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Searching TheAudioDB catalogue...</span>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((artist) => (
                            <button
                                key={artist.id || artist.name}
                                type="button"
                                onClick={() => handleSelect(artist)}
                                className="w-full flex items-center px-4 py-3 hover:bg-white/5 text-left transition-colors group cursor-pointer"
                            >
                                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 border border-white/10 mr-3.5 shadow-md">
                                    <ImageFallback
                                        src={artist.thumb_url}
                                        alt={artist.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium text-sm truncate group-hover:text-amber-400 transition-colors">
                                        {artist.name}
                                    </div>
                                    <div className="text-neutral-400 text-xs truncate flex items-center space-x-2 mt-0.5">
                                        <span>{artist.genre || 'Music'}</span>
                                        {artist.country && (
                                            <>
                                                <span>•</span>
                                                <span>{artist.country}</span>
                                            </>
                                        )}
                                        {artist.formed_year && (
                                            <>
                                                <span>•</span>
                                                <span>{artist.formed_year}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Music className="w-4 h-4 text-neutral-600 group-hover:text-amber-400 transition-colors ml-2 flex-shrink-0" />
                            </button>
                        ))
                    ) : (
                        <div className="p-6 text-center text-sm text-neutral-400">
                            No artists found for "{debouncedQuery}". Try another spelling.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
