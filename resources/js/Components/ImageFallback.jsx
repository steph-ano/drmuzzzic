import React, { useState } from 'react';
import { Disc3 } from 'lucide-react';

export default function ImageFallback({
    src,
    alt = '',
    className = '',
    fallbackIcon: FallbackIcon = Disc3,
    ...props
}) {
    const [hasError, setHasError] = useState(!src);

    if (hasError || !src) {
        return (
            <div
                className={`flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-white/5 text-neutral-600 ${className}`}
                {...props}
            >
                <FallbackIcon className="w-10 h-10 stroke-[1.5] text-neutral-500 animate-pulse" />
                <span className="text-[11px] font-medium tracking-wider uppercase mt-2 text-neutral-500 line-clamp-1 px-2 text-center">
                    {alt || 'DRMUZZZIC'}
                </span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
            {...props}
        />
    );
}
