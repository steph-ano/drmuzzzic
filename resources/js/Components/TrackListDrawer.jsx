import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, PlayCircle, Clock, Disc3, Loader2, Volume2 } from 'lucide-react';
import ImageFallback from './ImageFallback';

export default function TrackListDrawer({ album, isOpen, onClose }) {
    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !album?.id) {
            setTracks([]);
            setPlayingTrackId(null);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        fetch(`/api/albums/${album.id}/tracks`)
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) {
                    setTracks(data.tracks || []);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setTracks([]);
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [isOpen, album]);

    const handlePlayPreview = (track) => {
        if (!track.preview_url) return;

        if (playingTrackId === track.id) {
            audioRef.current?.pause();
            setPlayingTrackId(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const newAudio = new Audio(track.preview_url);
        audioRef.current = newAudio;
        setPlayingTrackId(track.id);

        newAudio.play().catch(() => {
            setPlayingTrackId(null);
        });

        newAudio.onended = () => {
            setPlayingTrackId(null);
        };
    };

    const handleClose = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingTrackId(null);
        onClose();
    };

    if (!isOpen || !album) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
                {/* Header with Album Cover & Meta */}
                <div className="relative p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border-b border-white/10 flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-5">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-neutral-800 shadow-2xl border border-white/10 flex-shrink-0">
                            <ImageFallback
                                src={album.thumb_url}
                                alt={album.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                                {album.year || 'Album'}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-2 leading-tight">
                                {album.title}
                            </h3>
                            {album.genre && (
                                <p className="text-xs text-neutral-400 mt-1">{album.genre}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tracklist content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-white/5">
                    {isLoading ? (
                        <div className="py-16 text-center text-sm text-neutral-400 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                            <span>Loading tracklist & audio previews...</span>
                        </div>
                    ) : tracks.length > 0 ? (
                        tracks.map((track, idx) => {
                            const isPlaying = playingTrackId === track.id;

                            return (
                                <div
                                    key={track.id || idx}
                                    className={`flex items-center justify-between py-3 px-3 rounded-xl transition-colors group ${
                                        isPlaying ? 'bg-amber-500/15 border border-amber-500/30' : 'hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                                        {track.preview_url ? (
                                            <button
                                                type="button"
                                                onClick={() => handlePlayPreview(track)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                    isPlaying
                                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
                                                        : 'bg-white/10 text-white hover:bg-amber-500 hover:text-black'
                                                }`}
                                                title={isPlaying ? 'Pause 30s preview' : 'Play 30s preview'}
                                            >
                                                {isPlaying ? (
                                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                                ) : (
                                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                                )}
                                            </button>
                                        ) : (
                                            <span className="w-8 text-center text-xs font-mono text-neutral-500 group-hover:text-amber-400 transition-colors">
                                                {track.track_number || idx + 1}
                                            </span>
                                        )}

                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium transition-colors truncate ${
                                                isPlaying ? 'text-amber-400 font-semibold' : 'text-white group-hover:text-amber-400'
                                            }`}>
                                                {track.title}
                                            </p>
                                            {isPlaying && (
                                                <span className="inline-flex items-center space-x-1 text-[11px] text-amber-300 font-mono mt-0.5 animate-pulse">
                                                    <Volume2 className="w-3 h-3" />
                                                    <span>Playing 30s Preview...</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        {track.video_url && (
                                            <a
                                                href={track.video_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center space-x-1 text-xs text-amber-400/90 hover:text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20"
                                            >
                                                <PlayCircle className="w-3.5 h-3.5" />
                                                <span>Video</span>
                                            </a>
                                        )}
                                        <span className="text-xs font-mono text-neutral-500 flex items-center space-x-1">
                                            <Clock className="w-3 h-3 text-neutral-600" />
                                            <span>{track.duration_formatted}</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center text-neutral-400 text-sm">
                            <Disc3 className="w-8 h-8 text-neutral-600 mx-auto mb-2 stroke-[1.5]" />
                            No individual tracks found for this release.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-950/60 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                    <span>
                        {tracks.some(t => t.preview_url) && '🎧 Click Play on any track to preview 30s audio'}
                    </span>
                    {tracks.length > 0 && <span>{tracks.length} tracks</span>}
                </div>
            </div>
        </div>
    );
}
