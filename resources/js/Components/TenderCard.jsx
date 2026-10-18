import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Calendar, Building2, FileText, Bookmark, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import gsap from 'gsap';

export default function TenderCard({ tender, onToggleBookmark }) {
  const [isBookmarked, setIsBookmarked] = useState(tender.is_bookmarked || false);
  const cardRef = useRef(null);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onToggleBookmark) onToggleBookmark(tender.id);
  };

  // GSAP 3D perspective tilt on hover
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(cardRef.current, {
      rotationY: x * 0.025,
      rotationX: -y * 0.025,
      transformPerspective: 900,
      ease: 'power1.out',
      duration: 0.25,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotationY: 0,
      rotationX: 0,
      duration: 0.45,
      ease: 'power2.out',
    });
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

  // Calculate days left to closing
  const getClosingUrgency = (dateStr) => {
    if (!dateStr) return null;
    try {
      const diffDays = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 2 && diffDays >= 0) return { label: `${diffDays === 0 ? 'Closes Today' : `${diffDays}d Left`}`, urgent: true };
      if (diffDays < 0) return { label: 'Bidding Closed', urgent: false, closed: true };
      return { label: `${diffDays}d Left`, urgent: false };
    } catch {
      return null;
    }
  };

  const urgency = getClosingUrgency(tender.closes_at);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tender-card-surface rounded-2xl p-5 flex flex-col justify-between space-y-4 relative group will-change-transform"
    >
      {/* Top Bar: Portal Code, Status & Bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={tender.status} />

          {tender.portal && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {(typeof tender.portal === 'object' ? (tender.portal?.name ? tender.portal.name.split(' ')[0] : tender.portal?.code) : tender.portal) || 'Govt'}
            </span>
          )}

          {tender.sector && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/90 text-cyan-300 border border-slate-700/60">
              {tender.sector.name}
            </span>
          )}
        </div>

        <button
          onClick={handleBookmarkClick}
          className={`p-2 rounded-xl transition-all duration-200 ${
            isBookmarked
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700'
          }`}
          title={isBookmarked ? 'Bookmarked' : 'Save Tender'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Main Title & Ref */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-slate-400 font-mono tracking-wide flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold truncate">Ref: {tender.tender_ref}</span>
        </div>
        <Link
          href={`/tenders/${tender.id}`}
          className="font-heading font-semibold text-slate-100 group-hover:text-emerald-300 text-base md:text-lg line-clamp-2 leading-snug transition-colors"
        >
          {tender.title}
        </Link>
      </div>

      {/* Authority & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate text-slate-300 font-medium">{tender.authority?.name || 'Central Authority'}</span>
        </div>
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate text-slate-300">{tender.location || tender.state?.name || 'India'}</span>
        </div>
      </div>

      {/* Value & Closing Date Bar */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2 shadow-inner">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Tender Value</span>
          <span className="font-heading font-extrabold text-sm md:text-base text-emerald-400">
            {tender.formatted_value || 'Refer Document'}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Submission Closes</span>
          <span className="font-semibold text-xs md:text-sm text-slate-200 flex items-center gap-1 justify-end">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {formatDate(tender.closes_at)}
          </span>
          {urgency && (
            <span className={`text-[10px] font-semibold flex items-center justify-end gap-1 ${
              urgency.urgent ? 'text-amber-400 animate-pulse' : urgency.closed ? 'text-rose-400' : 'text-slate-400'
            }`}>
              <Clock className="w-2.5 h-2.5" />
              {urgency.label}
            </span>
          )}
        </div>
      </div>

      {/* Action Links Footer */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px]">{tender.documents?.length || 1} Document Available</span>
        </div>

        <Link
          href={`/tenders/${tender.id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-all"
        >
          View Notice
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
