import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import TenderCard from '../Components/TenderCard';
import { Bookmark, Bell, Trash2, ArrowRight } from 'lucide-react';

export default function Saved({ bookmarks = [], savedSearches = [] }) {
  
  const handleDeleteSavedSearch = (id) => {
    axios.delete(`/api/saved-searches/${id}`)
      .then(() => router.reload({ preserveScroll: true }))
      .catch(err => console.error(err));
  };

  return (
    <MainLayout>
      <Head title="Saved Tenders & Alerts - TenderSetu" />

      <div className="space-y-10">
        
        {/* Page Title */}
        <div className="pb-4 border-b border-slate-800">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-cyan-400 fill-cyan-400" />
            Your Saved Bids & Search Alerts
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Quickly monitor bookmarked procurement opportunities and email digest settings.
          </p>
        </div>

        {/* Saved Search Alerts Section */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Active Email Alert Searches ({savedSearches.length})
          </h2>

          {savedSearches.length === 0 ? (
            <div className="p-6 rounded-2xl glass-card text-xs text-slate-400">
              No saved search alerts yet. You can save your progressive filters on the Tender Discovery page to receive daily digest emails.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSearches.map((s) => (
                <div key={s.id} className="p-4 rounded-xl glass-card space-y-3 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-cyan-300">{s.name}</h3>
                      <span className="text-[10px] text-slate-400">Daily Digest Email Alert Enabled</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSavedSearch(s.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/tenders?${new URLSearchParams(s.filters_json).toString()}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    Run Search Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarked Tenders List */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cyan-400" />
            Bookmarked Opportunities ({bookmarks.length})
          </h2>

          {bookmarks.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-2xl space-y-3">
              <Bookmark className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="font-heading font-bold text-base text-slate-200">No bookmarked tenders</h3>
              <p className="text-slate-400 text-xs">Click the bookmark icon on any tender card to keep track of it here.</p>
              <Link
                href="/tenders"
                className="inline-block px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold"
              >
                Browse Tenders
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((t) => (
                <TenderCard key={t.id} tender={t} />
              ))}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}
