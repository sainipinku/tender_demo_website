import React from 'react';
import { Filter, SlidersHorizontal, X, Zap, Clock, Sparkles, Gem } from 'lucide-react';

export default function FilterChips({
  states = [],
  sectors = [],
  activeFilters = {},
  onFilterChange,
  onToggleDrawer,
}) {
  const valueBands = [
    { key: '', label: 'All Values' },
    { key: 'under_1cr', label: '< ₹1 Crore' },
    { key: '1cr_10cr', label: '₹1 Cr - ₹10 Cr' },
    { key: '10cr_100cr', label: '₹10 Cr - ₹100 Cr' },
    { key: 'above_100cr', label: '> ₹100 Crore' },
  ];

  const statuses = [
    { key: '', label: 'All Statuses' },
    { key: 'live', label: 'Live' },
    { key: 'closing_soon', label: 'Closing Soon' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'closed', label: 'Closed' },
    { key: 'result_declared', label: 'Result Declared' },
  ];

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <div className="w-full space-y-2.5">
      
      {/* Quick Action Horizon Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        
        {/* Quick Chip: Last 2 Months */}
        <button
          type="button"
          onClick={() => onFilterChange('months', activeFilters.months === '2' ? '' : '2')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
            activeFilters.months === '2' || (!activeFilters.months && !activeFilters.closing_days)
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          Last 2 Months Data
        </button>

        {/* Quick Chip: Closing in 48h */}
        <button
          type="button"
          onClick={() => onFilterChange('closing_days', activeFilters.closing_days === '2' ? '' : '2')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
            activeFilters.closing_days === '2'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Closing in 48h
        </button>

        {/* Quick Chip: High Value */}
        <button
          type="button"
          onClick={() => onFilterChange('value_band', activeFilters.value_band === '1cr_10cr' ? '' : '1cr_10cr')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
            activeFilters.value_band === '1cr_10cr' || activeFilters.value_band === '10cr_100cr'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Gem className="w-3.5 h-3.5 text-purple-400" />
          High Value (&gt; ₹1 Cr)
        </button>

        {/* Quick Chip: Live Only */}
        <button
          type="button"
          onClick={() => onFilterChange('status', activeFilters.status === 'live' ? '' : 'live')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
            activeFilters.status === 'live'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Live Bidding Only
        </button>
      </div>

      {/* Main Select Dropdown Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        
        {/* Advanced Filter Drawer Trigger */}
        <button
          onClick={onToggleDrawer}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition-all shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          More Filters
        </button>

        {/* State Select */}
        <select
          value={activeFilters.state || ''}
          onChange={(e) => onFilterChange('state', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer hover:border-slate-700"
        >
          <option value="">All States & UTs</option>
          {states.map((st) => (
            <option key={st.id} value={st.code}>
              {st.name} ({st.code})
            </option>
          ))}
        </select>

        {/* Sector Select */}
        <select
          value={activeFilters.sector || ''}
          onChange={(e) => onFilterChange('sector', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer hover:border-slate-700"
        >
          <option value="">All Sectors</option>
          {sectors.map((sec) => (
            <option key={sec.id} value={sec.slug}>
              {sec.name}
            </option>
          ))}
        </select>

        {/* Value Band Select */}
        <select
          value={activeFilters.value_band || ''}
          onChange={(e) => onFilterChange('value_band', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer hover:border-slate-700"
        >
          {valueBands.map((vb) => (
            <option key={vb.key} value={vb.key}>
              {vb.label}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          value={activeFilters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer hover:border-slate-700"
        >
          {statuses.map((st) => (
            <option key={st.key} value={st.key}>
              {st.label}
            </option>
          ))}
        </select>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange('reset', null)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold transition-all ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
