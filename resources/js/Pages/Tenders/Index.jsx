import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import SearchBar from '../../Components/SearchBar';
import FilterChips from '../../Components/FilterChips';
import AdvancedFilterDrawer from '../../Components/AdvancedFilterDrawer';
import TenderCard from '../../Components/TenderCard';
import IndiaMap from '../../Components/IndiaMap';
import MapListSplit from '../../Components/MapListSplit';
import StatusLegend from '../../Components/StatusLegend';
import { Search, SlidersHorizontal, Map, RefreshCw } from 'lucide-react';

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

  const handleSearch = (term) => {
    handleFilterChange('search', term);
  };

  const handleSaveSearch = (name, searchFilters) => {
    axios.post('/api/saved-searches', {
      name: name,
      filters_json: searchFilters,
      notify_email: true,
    }).catch(err => console.error('Error saving search:', err));
  };

  return (
    <MainLayout>
      <Head title="Tender Discovery & Search - TenderSetu" />

      <div className="space-y-6">
        
        {/* Top Header & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white flex items-center gap-3">
              <Search className="w-7 h-7 text-cyan-400" />
              Tender Discovery Hub
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Showing {tenders?.meta?.total || tenders?.data?.length || 0} matching tender notices across India.
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

        {/* Search Bar */}
        <SearchBar
          value={filters.search || ''}
          onSearch={handleSearch}
          suggestions={suggestions}
        />

        {/* Smart Filter Chips */}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Map Column (Shown in 'split' or 'map' view) */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'map' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-4`}>
              <div className="sticky top-20">
                <IndiaMap
                  selectedState={filters.state || ''}
                  onSelectState={(code) => handleFilterChange('state', code)}
                  statusFilter={filters.status}
                />
              </div>
            </div>
          )}

          {/* List Column (Shown in 'split' or 'list' view) */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`${viewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-6`}>
              
              {tenders?.data?.length === 0 ? (
                <div className="p-12 text-center glass-card rounded-2xl space-y-4">
                  <SlidersHorizontal className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="font-heading font-bold text-lg text-slate-200">No tenders match your filters</h3>
                  <p className="text-slate-400 text-xs">Try clearing some filters or searching with broader keywords.</p>
                  <button
                    onClick={() => handleFilterChange('reset', null)}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold text-xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        link.active
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
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
