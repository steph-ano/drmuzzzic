import React from 'react';
import { Disc3, ListMusic } from 'lucide-react';
import ImageFallback from './ImageFallback';

export default function AlbumCard({ album, onSelect }) {
    return (
        <div
            onClick={() => onSelect(album)}
            className="group relative flex flex-col flex-shrink-0 w-48 sm:w-56 cursor-pointer select-none"
        >
            {/* Artwork Container */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl transition-all duration-300 group-hover:scale-102 group-hover:shadow-amber-500/10 group-hover:border-amber-500/30">
                <ImageFallback
                    src={album.thumb_url}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Release Year Tag */}
                {album.year && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-semibold text-amber-400">
                        {album.year}
                    </div>
                )}

                {/* Hover Quick Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-amber-500 px-3 py-1.5 rounded-full shadow-lg">
                        <ListMusic className="w-3.5 h-3.5" />
                        <span>View Tracks</span>
                    </span>
                    <Disc3 className="w-5 h-5 text-white/80 animate-spin" />
                </div>
            </div>

            {/* Info Meta */}
            <div className="mt-3">
                <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                    {album.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 truncate">
                    {album.genre || (album.year ? `Released in ${album.year}` : 'Studio Album')}
                </p>
            </div>
        </div>
    );
}
