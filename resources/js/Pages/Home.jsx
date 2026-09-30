import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import SearchBar from '../Components/SearchBar';
import TenderCard from '../Components/TenderCard';
import IndiaMap from '../Components/IndiaMap';
import { ShieldCheck, ArrowRight, TrendingUp, Calendar, Zap, Layers, Sparkles } from 'lucide-react';

export default function Home({ featuredTenders, latestTenders, sectors, states, stats }) {
  const [activeState, setActiveState] = useState('');

  const handleSearch = (term) => {
    router.get('/tenders', { search: term }, { preserveState: true });
  };

  const handleSelectState = (stateCode) => {
    setActiveState(stateCode);
    if (stateCode) {
      router.get('/tenders', { state: stateCode });
    }
  };

  return (
    <MainLayout>
      <Head title="Home - India Government Tender Discovery Platform" />

      <div className="space-y-16">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-6 sm:p-10 md:p-14">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Real-time Aggregation across GeM, CPPP & State eProcurement Portals
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight text-white">
              Discover & Track Live <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                India Government Tenders
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Unified intelligence engine for central, state, and PSU procurement notices. Interactive map sync, EMD tracking, and automated bid closing alerts.
            </p>

            {/* Universal Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                suggestions={[
                  'Patna STP', 'Railway Coaches', 'NHAI Expressway', 'Solar PV Grid',
                  'Jal Jeevan Mission', 'CT Scanner Hospital', 'Bridge Construction',
                ]}
              />
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <span className="block text-2xl font-extrabold text-cyan-400">{stats?.total_tenders || 29}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Tracked</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <span className="block text-2xl font-extrabold text-emerald-400">{stats?.live_tenders || 15}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Live Bidding</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <span className="block text-2xl font-extrabold text-rose-400">{stats?.closing_soon || 4}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Closing Soon</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <span className="block text-2xl font-extrabold text-purple-400">₹{stats?.total_value_cr || '52,400'} Cr</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Cumulative Value</span>
              </div>
            </div>

          </div>
        </section>

        {/* Interactive India Map Preview Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-cyan-400" />
                Live Tender Distribution across India
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Click any state circle on the map to instantly filter tenders in that region.
              </p>
            </div>
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Open Full Screen Map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <IndiaMap
            selectedState={activeState}
            onSelectState={handleSelectState}
          />
        </section>

        {/* Featured High Value Tenders */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Featured High-Value Opportunities
            </h2>
            <Link
              href="/tenders?sort_by=value"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All High Value
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTenders?.data?.map((t) => (
              <TenderCard key={t.id} tender={t} />
            ))}
          </div>
        </section>

        {/* Procurement Sectors Grid */}
        <section className="space-y-6">
          <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Browse Procurement by Sector
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {sectors?.map((sec) => (
              <Link
                key={sec.id}
                href={`/tenders?sector=${sec.slug}`}
                className="p-4 rounded-2xl glass-card text-center space-y-2 group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                  {sec.name.charAt(0)}
                </div>
                <h3 className="font-heading font-semibold text-xs text-slate-200 group-hover:text-cyan-300 truncate">
                  {sec.name}
                </h3>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                  {sec.tenders_count || 0} Tenders
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
