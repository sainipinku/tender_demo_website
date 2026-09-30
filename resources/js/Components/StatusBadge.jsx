import React from 'react';

export default function StatusBadge({ status }) {
  const configs = {
    live: {
      label: 'LIVE NOW',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400 animate-pulse',
    },
    closing_soon: {
      label: 'CLOSING SOON',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400 animate-ping',
    },
    upcoming: {
      label: 'UPCOMING',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    closed: {
      label: 'CLOSED',
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
    },
    result_declared: {
      label: 'RESULT DECLARED',
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-400',
    },
  };

  const cfg = configs[status] || configs.live;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
