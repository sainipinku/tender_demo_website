import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, BrainCircuit, Cpu } from 'lucide-react';
import gsap from 'gsap';

export default function SearchBar({
  value = '',
  semantic = false,
  onChange,
  onSearch,
  suggestions = [],
}) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isSemantic, setIsSemantic] = useState(Boolean(semantic));
  const containerRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    setIsSemantic(Boolean(semantic));
  }, [semantic]);

  // GSAP radiant aura when toggling Semantic Vector Search
  useEffect(() => {
    if (!containerRef.current) return;
    if (isSemantic) {
      gsap.to(containerRef.current, {
        boxShadow: '0 0 25px rgba(6, 182, 212, 0.2), 0 0 45px rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(6, 182, 212, 0.6)',
        duration: 0.45,
        ease: 'power2.out',
      });
    } else {
      gsap.to(containerRef.current, {
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  }, [isSemantic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm, isSemantic);
    }
  };

  const handleChipClick = (term) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term, isSemantic);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('', isSemantic);
    }
  };

  const toggleSemantic = () => {
    const nextVal = !isSemantic;
    setIsSemantic(nextVal);
    if (searchTerm && onSearch) {
      onSearch(searchTerm, nextVal);
    }
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div
          ref={containerRef}
          className="relative flex-1 flex items-center rounded-2xl bg-slate-900/90 border border-slate-800 transition-all shadow-xl"
        >
          <div className="absolute left-4 pointer-events-none text-slate-400">
            {isSemantic ? (
              <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onChange) onChange(e.target.value);
            }}
            placeholder={
              isSemantic
                ? 'AI Semantic Vector Search: e.g. "solar panels in schools", "bridge construction bihar", "computer operator vadodara"...'
                : 'Search by tender title, authority (CPWD, Railways), ref number, or keywords...'
            }
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none text-sm md:text-base font-medium"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-xs md:text-sm hover:brightness-110 shadow-md shadow-emerald-500/20 transition-all"
            >
              Search
            </button>
          </div>
        </div>

        {/* AI Vector DB Mode Toggle Pill */}
        <button
          type="button"
          onClick={toggleSemantic}
          className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-300 border ${
            isSemantic
              ? 'bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Toggle AI Vector Search (10,300+ ChromaDB Embeddings)"
        >
          <Sparkles className={`w-4 h-4 ${isSemantic ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="font-heading tracking-tight">AI Vector DB</span>
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              isSemantic ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'
            }`}
          />
        </button>
      </form>

      {/* Suggestion Chips */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-none">
          <span className="flex items-center gap-1 font-semibold text-slate-400 whitespace-nowrap">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Quick Searches:
          </span>
          {suggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-emerald-300 hover:border-emerald-500/30 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
