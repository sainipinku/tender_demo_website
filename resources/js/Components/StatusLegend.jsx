import React from 'react';

export default function StatusLegend({ activeStatus, onSelectStatus }) {
  const items = [
    { key: '', label: 'All Statuses', color: 'bg-slate-400' },
    { key: 'live', label: 'Live Tenders', color: 'bg-emerald-400' },
    { key: 'closing_soon', label: 'Closing Soon', color: 'bg-rose-400' },
    { key: 'upcoming', label: 'Upcoming', color: 'bg-amber-400' },
    { key: 'closed', label: 'Closed', color: 'bg-slate-400' },
    { key: 'result_declared', label: 'Result Declared', color: 'bg-purple-400' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs text-slate-300">
      <span className="font-semibold text-slate-400 px-1">Filter Status:</span>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelectStatus(item.key)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
            activeStatus === item.key
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${item.color}`} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
