import React from 'react';
import { Link } from '@inertiajs/react';
import { Disc3 } from 'lucide-react';
import SearchBar from './SearchBar';

function GithubIcon({ className = "w-4 h-4" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
    );
}

export default function Navbar({ showSearch = true }) {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0a0a0d]/75 backdrop-blur-xl transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <Link
                    href="/"
                    className="flex items-center space-x-3 group flex-shrink-0"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                        <div className="w-full h-full bg-[#0a0a0d] rounded-[10px] flex items-center justify-center">
                            <Disc3 className="w-5 h-5 text-amber-400 group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-neutral-100 to-amber-300 bg-clip-text text-transparent">
                            DRMUZZZIC
                        </span>
                        <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-500/90 -mt-1">
                            Chronicles
                        </span>
                    </div>
                </Link>

                {/* Search Bar in Navbar */}
                {showSearch && (
                    <div className="flex-1 max-w-lg hidden md:block">
                        <SearchBar />
                    </div>
                )}

                {/* Right Actions */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <a
                        href="https://github.com/steph-ano/drmuzzzic"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-2 text-xs font-medium text-neutral-400 hover:text-white px-3.5 py-2 rounded-full border border-white/10 hover:border-amber-500/40 hover:bg-white/5 transition-all"
                    >
                        <GithubIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">GitHub</span>
                    </a>
                </div>
            </div>

            {/* Mobile SearchBar Bar */}
            {showSearch && (
                <div className="px-4 pb-3 md:hidden">
                    <SearchBar />
                </div>
            )}
        </header>
    );
}
