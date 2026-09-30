import React from 'react';
import { Filter, SlidersHorizontal, X } from 'lucide-react';

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

  const closingPeriods = [
    { key: '', label: 'Any Date' },
    { key: '3', label: 'Closing in 3 Days' },
    { key: '7', label: 'Closing in 7 Days' },
    { key: '15', label: 'Closing in 15 Days' },
    { key: '30', label: 'Closing in 30 Days' },
  ];

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Advanced Filter Drawer Trigger Button */}
        <button
          onClick={onToggleDrawer}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold transition-all shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Advanced Filters
        </button>

        {/* State Select */}
        <select
          value={activeFilters.state || ''}
          onChange={(e) => onFilterChange('state', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none cursor-pointer hover:border-slate-700"
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
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none cursor-pointer hover:border-slate-700"
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
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none cursor-pointer hover:border-slate-700"
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
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none cursor-pointer hover:border-slate-700"
        >
          {statuses.map((st) => (
            <option key={st.key} value={st.key}>
              {st.label}
            </option>
          ))}
        </select>

        {/* Closing Period Select */}
        <select
          value={activeFilters.closing_days || ''}
          onChange={(e) => onFilterChange('closing_days', e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none cursor-pointer hover:border-slate-700"
        >
          {closingPeriods.map((cp) => (
            <option key={cp.key} value={cp.key}>
              {cp.label}
            </option>
          ))}
        </select>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange('reset', null)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
