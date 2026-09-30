import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, BookmarkPlus } from 'lucide-react';

export default function AdvancedFilterDrawer({
  isOpen,
  onClose,
  portals = [],
  activeFilters = {},
  onApplyFilters,
  onSaveSearch,
}) {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const [searchName, setSearchName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key, val) => {
    setLocalFilters(prev => ({ ...prev, [key]: val }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleSaveSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchName.trim()) return;
    if (onSaveSearch) {
      onSaveSearch(searchName, localFilters);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setSearchName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-heading font-bold text-lg">
              <SlidersHorizontal className="w-5 h-5" />
              Advanced Filters
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Portal Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Procurement Portal
            </label>
            <select
              value={localFilters.portal_id || ''}
              onChange={(e) => handleChange('portal_id', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Portals (GeM, CPPP, Bihar, Maha, UP)</option>
              {portals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Min & Max Value Inputs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tender Value Range (in ₹ INR)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400">Min Value (₹)</span>
                <input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={localFilters.min_value || ''}
                  onChange={(e) => handleChange('min_value', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Max Value (₹)</span>
                <input
                  type="number"
                  placeholder="e.g. 100000000"
                  value={localFilters.max_value || ''}
                  onChange={(e) => handleChange('max_value', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Sort Results By
            </label>
            <select
              value={localFilters.sort_by || 'published_at'}
              onChange={(e) => handleChange('sort_by', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            >
              <option value="published_at">Newest Published First</option>
              <option value="value">Highest Tender Value First</option>
              <option value="closing">Closing Soonest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Save Search Section */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <BookmarkPlus className="w-4 h-4 text-cyan-400" />
              Save This Search Alert
            </div>
            <form onSubmit={handleSaveSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Name your search (e.g., Bihar Water Tenders)"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30"
              >
                Save
              </button>
            </form>
            {saveSuccess && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved to email alerts!
              </span>
            )}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={() => setLocalFilters({})}
            className="w-1/3 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
}
