import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Clock, Music2, ExternalLink, Disc3, Loader2 } from 'lucide-react';
import ImageFallback from './ImageFallback';

export default function TrackListDrawer({ album, isOpen, onClose }) {
    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !album?.id) {
            setTracks([]);
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
        };
    }, [isOpen, album]);

    if (!isOpen || !album) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
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
                        onClick={onClose}
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
                            <span>Loading tracklist from TheAudioDB...</span>
                        </div>
                    ) : tracks.length > 0 ? (
                        tracks.map((track, idx) => (
                            <div
                                key={track.id || idx}
                                className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center space-x-4 min-w-0 pr-4">
                                    <span className="w-6 text-center text-xs font-mono text-neutral-500 group-hover:text-amber-400 transition-colors">
                                        {track.track_number || idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors truncate">
                                            {track.title}
                                        </p>
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
                        ))
                    ) : (
                        <div className="py-16 text-center text-neutral-400 text-sm">
                            <Disc3 className="w-8 h-8 text-neutral-600 mx-auto mb-2 stroke-[1.5]" />
                            No individual tracks found for this release.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-950/60 border-t border-white/5 text-right text-xs text-neutral-500">
                    {tracks.length > 0 && <span>{tracks.length} tracks</span>}
                </div>
            </div>
        </div>
    );
}
