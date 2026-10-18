import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import SearchBar from '../../Components/SearchBar';
import FilterChips from '../../Components/FilterChips';
import AdvancedFilterDrawer from '../../Components/AdvancedFilterDrawer';
import TenderCard from '../../Components/TenderCard';
import IndiaMap from '../../Components/IndiaMap';
import MapListSplit from '../../Components/MapListSplit';
import StatusLegend from '../../Components/StatusLegend';
import LivePortalRadar from '../../Components/LivePortalRadar';
import LiveScrapeTicker from '../../Components/LiveScrapeTicker';
import StatCounter from '../../Components/StatCounter';
import { Search, SlidersHorizontal, Map, RefreshCw, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import gsap from 'gsap';

export default function Index({
  tenders,
  filters = {},
  states = [],
  sectors = [],
  portals = [],
  suggestions = [],
  totalCount,
  liveCount,
  closingSoonCount,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'map'
  const cardGridRef = useRef(null);

  // Stagger GSAP animation on cards whenever tenders list updates
  useEffect(() => {
    if (cardGridRef.current && cardGridRef.current.children.length > 0) {
      gsap.fromTo(
        cardGridRef.current.children,
        { y: 25, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.04,
          ease: 'power2.out',
        }
      );
    }
  }, [tenders?.data]);

  const handleFilterChange = (key, value) => {
    let newFilters = { ...filters };
    if (key === 'reset') {
      newFilters = {};
    } else {
      if (value) {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
    }
    router.get('/tenders', newFilters, { preserveState: true });
  };

  const handleSearch = (term, isSemantic = false) => {
    let newFilters = { ...filters };
    if (term) {
      newFilters.search = term;
      if (isSemantic) {
        newFilters.semantic = 1;
      } else {
        delete newFilters.semantic;
      }
    } else {
      delete newFilters.search;
      delete newFilters.semantic;
    }
    router.get('/tenders', newFilters, { preserveState: true });
  };

  const handleSaveSearch = (name, searchFilters) => {
    axios.post('/api/saved-searches', {
      name: name,
      filters_json: searchFilters,
      notify_email: true,
    }).catch(err => console.error('Error saving search:', err));
  };

  const totalMatching = tenders?.meta?.total || tenders?.data?.length || 0;

  return (
    <MainLayout>
      <Head title="Tender Discovery Hub - TenderSetu" />

      {/* Live Scraped Ticker Stream Banner */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-6">
        <LiveScrapeTicker bids={tenders?.data?.slice(0, 8)} />
      </div>

      <div className="space-y-6">
        
        {/* Top Header & Live Count Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Search className="w-6 h-6" />
              </span>
              Tender Discovery Hub
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 flex items-center gap-1.5">
              <span>Showing</span>
              <StatCounter value={totalMatching} className="text-emerald-400 font-bold" />
              <span>verified government notices across India.</span>
            </p>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-3">
            <MapListSplit
              activeMode={viewMode}
              onChangeMode={(mode) => setViewMode(mode)}
            />
          </div>
        </div>

        {/* Live Scraper Radar Status Bar */}
        <LivePortalRadar
          activePortal={filters.portal || ''}
          onSelectPortal={(portalCode) => handleFilterChange('portal', portalCode)}
        />

        {/* Search Bar with AI Vector DB mode */}
        <SearchBar
          value={filters.search || ''}
          semantic={Boolean(filters.semantic)}
          onSearch={handleSearch}
          suggestions={suggestions}
        />

        {/* Smart Horizon Filter Chips */}
        <FilterChips
          states={states}
          sectors={sectors}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onToggleDrawer={() => setDrawerOpen(true)}
        />

        {/* Status Legend */}
        <StatusLegend
          activeStatus={filters.status || ''}
          onSelectStatus={(statusKey) => handleFilterChange('status', statusKey)}
        />

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          
          {/* Map Column (Shown in 'split' or 'map' view) */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'map' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-4`}>
              <div className="sticky top-20">
                <IndiaMap
                  selectedState={filters.state || ''}
                  onSelectState={(code) => handleFilterChange('state', code)}
                  statusFilter={filters.status}
                  onStatusChange={(code) => handleFilterChange('status', code)}
                />
              </div>
            </div>
          )}

          {/* List Column (Shown in 'split' or 'list' view) */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`${viewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-6`}>
              
              {tenders?.data?.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                  <SlidersHorizontal className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="font-heading font-bold text-lg text-slate-200">No tenders match your active filters</h3>
                  <p className="text-slate-400 text-xs">Try switching between portals or searching with broader keywords.</p>
                  <button
                    onClick={() => handleFilterChange('reset', null)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold text-xs hover:bg-emerald-500/30 transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div ref={cardGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenders?.data?.map((t) => (
                    <TenderCard key={t.id} tender={t} />
                  ))}
                </div>
              )}

              {/* Pagination Links */}
              {tenders?.meta?.links && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                  {tenders.meta.links.map((link, idx) => (
                    <button
                      key={idx}
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        link.active
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Advanced Filter Drawer */}
      <AdvancedFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        portals={portals}
        activeFilters={filters}
        onApplyFilters={(newF) => router.get('/tenders', newF, { preserveState: true })}
        onSaveSearch={handleSaveSearch}
      />
    </MainLayout>
  );
}
