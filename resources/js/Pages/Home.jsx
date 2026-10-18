import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import SearchBar from '../Components/SearchBar';
import TenderCard from '../Components/TenderCard';
import IndiaMap from '../Components/IndiaMap';
import LiveScrapeTicker from '../Components/LiveScrapeTicker';
import LivePortalRadar from '../Components/LivePortalRadar';
import StatCounter from '../Components/StatCounter';
import { ShieldCheck, ArrowRight, TrendingUp, Calendar, Zap, Layers, Sparkles, Activity } from 'lucide-react';

export default function Home({ featuredTenders, latestTenders, sectors, states, stats }) {
  const [activeState, setActiveState] = useState('');
  const [mapStatus, setMapStatus] = useState(''); // '' for all, 'live' for live bidding, 'closing_soon' for closing soon
  const [mapMetric, setMapMetric] = useState('count'); // 'count' or 'value'

  const handleSearch = (term, isSemantic = false) => {
    const params = { search: term };
    if (isSemantic) params.semantic = 1;
    router.get('/tenders', params, { preserveState: true });
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

      {/* Live Scraped Ticker Stream Banner */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-8">
        <LiveScrapeTicker bids={latestTenders?.data || featuredTenders?.data} />
      </div>

      <div className="space-y-16">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800/90 p-6 sm:p-10 md:p-14 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Real-time Aggregation across CPWD, SPPP, SHPP eBazaar & GeM CPPP
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight text-white">
              Discover & Track Live <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                India Government Tenders
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Unified intelligence engine for central, state, and PSU procurement notices. AI semantic vector search, live portal sync, and closing alerts.
            </p>

            {/* Universal Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                suggestions={[
                  'Computer Operator Vadodara', 'Boundary Wall Kanpur', 'Solar PV Rooftop', 'STP Plant',
                  'Jal Jeevan Mission', 'CT Scanner Hospital', 'Bridge Construction',
                ]}
              />
            </div>

            {/* Live Scraper Radar in Hero */}
            <div className="pt-2 max-w-3xl mx-auto">
              <LivePortalRadar onSelectPortal={(code) => code && router.get('/tenders', { portal: code })} />
            </div>

            {/* Quick Metrics Bar with Interactive GSAP StatCounters that filter Map */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
              
              {/* Total Indexed Card */}
              <button
                type="button"
                onClick={() => setMapStatus('')}
                className={`p-4 rounded-2xl text-left transition-all duration-300 relative group cursor-pointer ${
                  mapStatus === ''
                    ? 'bg-slate-900 border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
                title="Click to show all indexed tenders on the map"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Indexed</span>
                  {mapStatus === '' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      On Map
                    </span>
                  )}
                </div>
                <StatCounter
                  value={stats?.total_tenders || 18377}
                  className="block text-2xl md:text-3xl font-extrabold text-cyan-400"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {mapStatus === '' ? 'Showing all tenders on map' : 'Click to show all'}
                </span>
              </button>

              {/* Live Bidding Card */}
              <button
                type="button"
                onClick={() => setMapStatus(prev => prev === 'live' ? '' : 'live')}
                className={`p-4 rounded-2xl text-left transition-all duration-300 relative group cursor-pointer ${
                  mapStatus === 'live'
                    ? 'bg-emerald-950/50 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/30 ring-2 ring-emerald-400/60'
                    : 'bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/90'
                }`}
                title="Click to filter map to only show live bidding tenders"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-emerald-400 ${mapStatus === 'live' ? 'animate-ping' : ''}`} />
                    Live Bidding
                  </span>
                  {mapStatus === 'live' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400 animate-pulse">
                      Active on Map ⚡
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400/80 font-medium group-hover:underline">
                      Filter Map →
                    </span>
                  )}
                </div>
                <StatCounter
                  value={stats?.live_tenders || 16786}
                  className="block text-2xl md:text-3xl font-extrabold text-emerald-400"
                />
                <span className="text-[11px] text-emerald-300/80 mt-1 block font-medium">
                  {mapStatus === 'live' ? 'Showing live bids only (click to reset)' : 'Click to filter map to live only'}
                </span>
              </button>

              {/* Closing Soon Card */}
              <button
                type="button"
                onClick={() => setMapStatus(prev => prev === 'closing_soon' ? '' : 'closing_soon')}
                className={`p-4 rounded-2xl text-left transition-all duration-300 relative group cursor-pointer ${
                  mapStatus === 'closing_soon'
                    ? 'bg-amber-950/50 border-2 border-amber-400 shadow-2xl shadow-amber-500/30 ring-2 ring-amber-400/60'
                    : 'bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/90'
                }`}
                title="Click to filter map to tenders closing soon"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-amber-400 ${mapStatus === 'closing_soon' ? 'animate-ping' : ''}`} />
                    Closing Soon
                  </span>
                  {mapStatus === 'closing_soon' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-400 animate-pulse">
                      Active on Map ⏰
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/80 font-medium group-hover:underline">
                      Filter Map →
                    </span>
                  )}
                </div>
                <StatCounter
                  value={stats?.closing_soon || 1333}
                  className="block text-2xl md:text-3xl font-extrabold text-amber-400"
                />
                <span className="text-[11px] text-amber-300/80 mt-1 block font-medium">
                  {mapStatus === 'closing_soon' ? 'Showing closing soon (click to reset)' : 'Click to filter closing soon'}
                </span>
              </button>

              {/* Cumulative Value Card */}
              <button
                type="button"
                onClick={() => setMapMetric(prev => prev === 'value' ? 'count' : 'value')}
                className={`p-4 rounded-2xl text-left transition-all duration-300 relative group cursor-pointer ${
                  mapMetric === 'value'
                    ? 'bg-purple-950/40 border-2 border-purple-400 shadow-xl shadow-purple-500/20'
                    : 'bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/90'
                }`}
                title="Click to toggle map view between Count and Financial Value (₹ Cr)"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cumulative Value</span>
                  {mapMetric === 'value' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      ₹ Cr Mode
                    </span>
                  )}
                </div>
                <StatCounter
                  value={stats?.total_value_cr || 202}
                  prefix="₹"
                  suffix=" Cr"
                  className="block text-2xl md:text-3xl font-extrabold text-purple-400"
                />
                <span className="text-[11px] text-purple-300/80 mt-1 block">
                  {mapMetric === 'value' ? 'Map shows price values (click for counts)' : 'Click to switch map to ₹ values'}
                </span>
              </button>
            </div>

          </div>
        </section>

        {/* Interactive India Map Preview Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-emerald-400" />
                  Live Tender Distribution across India
                </h2>
                {mapStatus === 'live' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live Bidding Only
                  </span>
                )}
                {mapStatus === 'closing_soon' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Closing Soon Only
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {mapStatus === 'live'
                  ? 'Showing active live bidding tenders only. Click any state circle to view top live bids in that region.'
                  : 'Click any state circle on the map to inspect active procurement tenders in that region.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {mapStatus && (
                <button
                  onClick={() => setMapStatus('')}
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 transition-colors"
                >
                  Reset to All Data ✕
                </button>
              )}
              <Link
                href="/tenders"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Open Full Screen Map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <IndiaMap
            selectedState={activeState}
            onSelectState={handleSelectState}
            statusFilter={mapStatus}
            onStatusChange={setMapStatus}
            metric={mapMetric}
            onMetricChange={setMapMetric}
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
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
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
            <Layers className="w-6 h-6 text-cyan-400" />
            Browse Procurement by Sector
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {sectors?.map((sec) => (
              <Link
                key={sec.id}
                href={`/tenders?sector=${sec.slug}`}
                className="p-4 rounded-2xl tender-card-surface text-center space-y-2 group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  {sec.name.charAt(0)}
                </div>
                <h3 className="font-heading font-semibold text-xs text-slate-200 group-hover:text-emerald-300 truncate">
                  {sec.name}
                </h3>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-slate-950/80 text-slate-400 border border-slate-800">
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
