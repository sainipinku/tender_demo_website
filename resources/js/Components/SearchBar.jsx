import React, { useState } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

export default function SearchBar({ value, onChange, onSearch, suggestions = [] }) {
  const [searchTerm, setSearchTerm] = useState(value || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChipClick = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          placeholder="Search by tender title, authority (NHAI, PWD, BUIDCO), ref number, or keywords..."
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm md:text-base transition-all shadow-inner"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold text-xs md:text-sm hover:brightness-110 shadow-md shadow-cyan-500/20 transition-all"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-none">
          <span className="flex items-center gap-1 font-medium text-slate-400 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Trending:
          </span>
          {suggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 hover:border-slate-700 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
