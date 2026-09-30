import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-heading font-bold text-slate-200 text-base">TenderSetu</span>
              <span className="block text-[10px] text-slate-400">National Government Procurement Intelligence</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs">
            <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">GeM Portal</a>
            <a href="https://eprocure.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">CPPP Portal</a>
            <a href="https://eproc2.bihar.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Bihar eProcurement 2.0</a>
            <a href="https://mahatenders.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">MahaTenders</a>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-2">
          <span>&copy; {new Date().getFullYear()} TenderSetu. Real-time government tender discovery.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Businesses & Bidders
          </span>
        </div>
      </div>
    </footer>
  );
}
