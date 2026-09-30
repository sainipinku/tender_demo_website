import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Calendar, Building2, FileText, Bookmark, ExternalLink, IndianRupee } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TenderCard({ tender, onToggleBookmark }) {
  const [isBookmarked, setIsBookmarked] = useState(tender.is_bookmarked || false);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onToggleBookmark) onToggleBookmark(tender.id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 relative group">
      
      {/* Top Bar: Authority, Status & Bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={tender.status} />
          {tender.sector && (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-cyan-300 border border-slate-700/60">
              {tender.sector.name}
            </span>
          )}
        </div>

        <button
          onClick={handleBookmarkClick}
          className={`p-2 rounded-xl transition-colors ${
            isBookmarked
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={isBookmarked ? 'Bookmarked' : 'Save Tender'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Main Title & Ref */}
      <div className="space-y-1.5">
        <div className="text-xs text-slate-400 font-mono tracking-wide flex items-center gap-1.5">
          <span>Ref: {tender.tender_ref}</span>
          {tender.portal && (
            <span className="text-slate-400">• {tender.portal.name}</span>
          )}
        </div>
        <Link
          href={`/tenders/${tender.id}`}
          className="font-heading font-semibold text-slate-100 group-hover:text-cyan-300 text-base md:text-lg line-clamp-2 leading-snug transition-colors"
        >
          {tender.title}
        </Link>
      </div>

      {/* Authority & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">{tender.authority?.name || 'Central Authority'}</span>
        </div>
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">{tender.location || tender.state?.name || 'India'}</span>
        </div>
      </div>

      {/* Value & Closing Date Bar */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between gap-2">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400">Tender Value</span>
          <span className="font-heading font-bold text-sm md:text-base text-cyan-300">
            {tender.formatted_value || 'Refer Document'}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wider text-slate-400">Submission Closes</span>
          <span className="font-semibold text-xs md:text-sm text-slate-200 flex items-center gap-1 justify-end">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {formatDate(tender.closes_at)}
          </span>
        </div>
      </div>

      {/* Action Links Footer */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>{tender.documents?.length || 0} Docs Available</span>
        </div>

        <Link
          href={`/tenders/${tender.id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-all"
        >
          View Tender Details
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
