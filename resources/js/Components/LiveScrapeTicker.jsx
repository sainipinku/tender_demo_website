import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';

export default function LiveScrapeTicker({ bids = [] }) {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  // Fallback sample recent bids if none passed
  const sampleBids = [
    { id: 172780, ref: '10/AE(C)/Vadodara/2026-27', title: 'Providing Computer Operator & Misc Services, CPWD Vadodara', value: '₹4.75 Lakh', portal: 'CPWD' },
    { id: 172779, ref: '57/EE/Kanpur/2026-27', title: 'Re-Construction of Boundary Wall at NSI Campus, Kanpur', value: '₹65.32 Lakh', portal: 'CPWD' },
    { id: 172777, ref: '11/EE/BFD-V/Bhuj/2026-27', title: 'Construction of BOP Jetty, Approach Road & Substation, Bhuj', value: '₹43.20 Lakh', portal: 'CPWD' },
    { id: 10115, ref: 'DLB2627GSRC22780', title: 'Supply of Computers & High-Speed Network Hardware, Tinwari', value: '₹9.90 Lakh', portal: 'SPPP Rajasthan' },
    { id: 172773, ref: '40/EE(E)/Mysuru/2026', title: 'SITC of 6 kWp Roof-top Solar PV Power Plant, Mangalore', value: '₹3.81 Lakh', portal: 'CPWD' },
    { id: 172772, ref: '36/NIT/EE-BBSR-II/2026-27', title: 'Repair & Renovation of Residential Quarters, Bhubaneswar', value: '₹17.68 Lakh', portal: 'CPWD' },
  ];

  const rawBids = bids && bids.length > 0 ? bids : sampleBids;

  // Normalize tender data so no object is ever rendered as a React child
  const displayBids = rawBids.map((b) => {
    let portalLabel = 'LIVE';
    if (b.portal) {
      if (typeof b.portal === 'object') {
        portalLabel = b.portal.code || (b.portal.name ? b.portal.name.split(' ')[0] : 'LIVE');
      } else {
        portalLabel = String(b.portal);
      }
    }
    return {
      id: b.id,
      title: b.title || 'Government Tender Notice',
      searchKey: b.tender_ref || b.ref || b.title || '',
      value: b.formatted_value || b.value || 'Refer Notice',
      portal: portalLabel,
    };
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Seamless continuous loop
    tweenRef.current = gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      duration: 38,
      repeat: -1,
    });

    return () => tweenRef.current?.kill();
  }, [displayBids.length]);

  return (
    <div
      className="relative overflow-hidden w-full bg-slate-950/90 border-y border-slate-800/80 py-2 flex items-center group select-none"
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.play()}
    >
      {/* Fixed Live Label on Left */}
      <div className="absolute left-0 z-20 px-3 py-1 bg-slate-950/95 backdrop-blur-md text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 border-r border-slate-800/90 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="tracking-wider uppercase">Live Bids Stream</span>
      </div>

      {/* Ticker Track */}
      <div ref={trackRef} className="flex whitespace-nowrap gap-8 pl-36 will-change-transform">
        {[...displayBids, ...displayBids].map((bid, i) => (
          <Link
            key={i}
            href={`/tenders?search=${encodeURIComponent(bid.searchKey)}`}
            className="inline-flex items-center gap-2.5 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {bid.portal}
            </span>
            <span className="font-medium text-slate-200 truncate max-w-xs">{bid.title}</span>
            <span className="font-heading font-bold text-cyan-400">{bid.value}</span>
            <span className="text-slate-600 font-bold">•</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
