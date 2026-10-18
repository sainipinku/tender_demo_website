import React from 'react';
import { Activity, ShieldCheck, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

export default function LivePortalRadar({ activePortal = '', onSelectPortal }) {
  const portals = [
    {
      code: 'CPWD_ETENDERS',
      shortName: 'CPWD Central',
      activeBids: '6,107',
      status: 'Live (2m window)',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      pingColor: 'bg-emerald-400',
    },
    {
      code: 'SPPP_RAJASTHAN',
      shortName: 'SPPP Rajasthan',
      activeBids: '4,210',
      status: 'Live (2m window)',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      pingColor: 'bg-cyan-400',
    },
    {
      code: 'SHPP_RAJASTHAN',
      shortName: 'SHPP eBazaar',
      activeBids: '3,840',
      status: 'Live (2m window)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      pingColor: 'bg-amber-400',
    },
    {
      code: 'GEM_CPPP',
      shortName: 'GeM CPPP Portal',
      activeBids: '12,400',
      status: 'Live (2m window)',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      pingColor: 'bg-purple-400',
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800/80 p-3.5 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Radar Pulse Status Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <span className="absolute w-full h-full rounded-xl bg-emerald-400/20 beacon-pulse pointer-events-none" />
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-200">
                Live Scraping Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Auto-Sync Window: <strong>Last 2 Months</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">4 Portals Online</span>
            </p>
          </div>
        </div>

        {/* Portal Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {portals.map((portal) => {
            const isSelected = activePortal === portal.code;
            return (
              <button
                key={portal.code}
                onClick={() => onSelectPortal && onSelectPortal(isSelected ? '' : portal.code)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${portal.pingColor}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${portal.pingColor}`} />
                </span>
                <span className="font-medium">{portal.shortName}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-slate-400 font-mono group-hover:text-cyan-300">
                  {portal.activeBids}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
