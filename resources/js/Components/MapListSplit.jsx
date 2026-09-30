import React from 'react';
import { Map, LayoutList, Columns } from 'lucide-react';

export default function MapListSplit({ activeMode, onChangeMode }) {
  const modes = [
    { key: 'split', label: 'Split View', icon: Columns },
    { key: 'list', label: 'List Only', icon: LayoutList },
    { key: 'map', label: 'Map Only', icon: Map },
  ];

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => onChangeMode(mode.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              isActive
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
