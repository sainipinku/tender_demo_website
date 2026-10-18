import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from '@inertiajs/react';
import { MapPin, Layers, Coins, Filter, X, ExternalLink, Calendar, ShieldCheck, Building2, ChevronRight, Activity, Maximize2, Minimize2 } from 'lucide-react';
import gsap from 'gsap';

// Helper component to auto-invalidate Leaflet map size on resize, drawer toggle, or size change
function MapResizeHandler({ isDetailOpen, isExpanded }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', onResize);
    };
  }, [map, isDetailOpen, isExpanded]);

  return null;
}

// Helper component to smoothly fly/pan map to clicked state without over-zooming
function MapFlyTo({ targetCoords, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (targetCoords && targetCoords[0] && targetCoords[1]) {
      map.flyTo(targetCoords, zoom || 5.2, {
        duration: 1.1,
        easeLinearity: 0.25,
      });
    }
  }, [targetCoords, zoom, map]);

  return null;
}

// Factory function to create custom HTML markers displaying State Code & Number/Price inside the circle
const createCustomStateIcon = (st, isSelected, metric, currentStatus) => {
  const count = parseInt(st.tender_count || 0);
  const valCr = parseFloat(st.total_value || 0) / 10000000;

  let displayValue = '';
  let subLabel = '';

  if (metric === 'count') {
    displayValue = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
    if (currentStatus === 'live') {
      subLabel = count === 1 ? 'Live Bid' : 'Live Bids';
    } else if (currentStatus === 'closing_soon') {
      subLabel = count === 1 ? 'Urgent' : 'Closing';
    } else {
      subLabel = count === 1 ? 'Bid' : 'Bids';
    }
  } else {
    if (valCr >= 1) {
      displayValue = `₹${valCr.toFixed(valCr >= 10 ? 0 : 1)}Cr`;
    } else {
      const valLakh = parseFloat(st.total_value || 0) / 100000;
      displayValue = `₹${valLakh.toFixed(0)}L`;
    }
    subLabel = currentStatus === 'live' ? 'Live Val' : currentStatus === 'closing_soon' ? 'Urg Val' : 'Val';
  }

  // Size scales proportionally
  let diameter = 52;
  if (count >= 15) diameter = 70;
  else if (count >= 5) diameter = 62;
  else if (count >= 1) diameter = 52;
  else diameter = 42;

  // Visual Palette
  let bgGrad = 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
  let borderCol = '#34d399';
  let glowCol = 'rgba(16, 185, 129, 0.45)';
  let opacity = '1';

  if (isSelected) {
    bgGrad = 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)';
    borderCol = '#38bdf8';
    glowCol = 'rgba(6, 182, 212, 0.8)';
  } else if (currentStatus === 'live') {
    // When Live mode is active: vibrant neon emerald for active live states, dimmed for 0 live
    if (count > 0) {
      bgGrad = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      borderCol = '#34d399';
      glowCol = 'rgba(16, 185, 129, 0.65)';
    } else {
      bgGrad = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      borderCol = '#334155';
      glowCol = 'transparent';
      opacity = '0.4';
    }
  } else if (currentStatus === 'closing_soon') {
    // When Closing Soon mode is active: amber / flame palette
    if (count > 0) {
      bgGrad = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      borderCol = '#fbbf24';
      glowCol = 'rgba(245, 158, 11, 0.65)';
    } else {
      bgGrad = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      borderCol = '#334155';
      glowCol = 'transparent';
      opacity = '0.4';
    }
  } else {
    // All Data mode: multi-tier palette
    if (count >= 10) {
      bgGrad = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      borderCol = '#6ee7b7';
      glowCol = 'rgba(16, 185, 129, 0.55)';
    } else if (count >= 3) {
      bgGrad = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      borderCol = '#fcd34d';
      glowCol = 'rgba(245, 158, 11, 0.45)';
    } else if (count >= 1) {
      bgGrad = 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)';
      borderCol = '#2dd4bf';
      glowCol = 'rgba(45, 212, 191, 0.35)';
    } else {
      bgGrad = 'linear-gradient(135deg, #334155 0%, #1e293b 100%)';
      borderCol = '#64748b';
      glowCol = 'transparent';
      opacity = '0.45';
    }
  }

  const pulseRing = (count > 0 || isSelected)
    ? `<span style="
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: ${borderCol};
        opacity: 0.25;
        animation: beacon-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        pointer-events: none;
      "></span>`
    : '';

  const html = `
    <div style="position: relative; width: ${diameter}px; height: ${diameter}px; opacity: ${opacity};">
      ${pulseRing}
      <div style="
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: ${bgGrad};
        border: 2.5px solid ${borderCol};
        box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 16px ${glowCol};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        cursor: pointer;
        user-select: none;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
        <span style="font-size: ${diameter >= 60 ? '10px' : '9px'}; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; opacity: 0.95; line-height: 1;">
          ${st.state_code}
        </span>
        <span style="font-size: ${diameter >= 68 ? '13px' : diameter >= 60 ? '12px' : '11px'}; font-weight: 800; line-height: 1.1; margin-top: 1px; color: #ffffff;">
          ${displayValue}
        </span>
        <span style="font-size: 8px; font-weight: 700; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1;">
          ${subLabel}
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-state-marker',
    iconSize: [diameter, diameter],
    iconAnchor: [diameter / 2, diameter / 2],
    popupAnchor: [0, -diameter / 2],
  });
};

export default function IndiaMap({
  selectedState,
  onSelectState,
  statusFilter,
  onStatusChange,
  metric: externalMetric,
  onMetricChange,
}) {
  const [mapData, setMapData] = useState([]);
  const [internalMetric, setInternalMetric] = useState('count'); // 'count' or 'value'
  const [internalStatus, setInternalStatus] = useState(statusFilter || '');
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync internal state with props if provided
  useEffect(() => {
    if (statusFilter !== undefined) {
      setInternalStatus(statusFilter || '');
    }
  }, [statusFilter]);

  const metric = externalMetric !== undefined ? externalMetric : internalMetric;
  const currentStatus = statusFilter !== undefined ? statusFilter : internalStatus;

  const handleMetricToggle = (newMetric) => {
    setInternalMetric(newMetric);
    if (onMetricChange) {
      onMetricChange(newMetric);
    }
  };

  const handleStatusToggle = (newStatus) => {
    setInternalStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // State Inspector Details Drawer
  const [activeStateInfo, setActiveStateInfo] = useState(null);
  const [stateTenders, setStateTenders] = useState([]);
  const [loadingTenders, setLoadingTenders] = useState(false);
  const [flyCoords, setFlyCoords] = useState(null);

  const drawerRef = useRef(null);
  const indiaCenter = [22.5937, 78.9629];
  const defaultZoom = 4.8;

  const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY || import.meta.env.VITE_MAPBOX_API_KEY || 'cb1_4ny8_1_bf2fe07c1193a4c78e0d4e99';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/map/aggregate?metric=${metric}&status=${currentStatus || ''}`)
      .then(res => res.json())
      .then(res => {
        setMapData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching map data:', err);
        setLoading(false);
      });
  }, [metric, currentStatus]);

  // When a state is clicked, fly to it gently, open details drawer and fetch its top tenders
  const handleStateClick = (st) => {
    setActiveStateInfo(st);
    if (st.latitude && st.longitude) {
      setFlyCoords([parseFloat(st.latitude), parseFloat(st.longitude)]);
    }

    setLoadingTenders(true);
    fetch(`/api/map/state-tenders/${st.state_code}?status=${currentStatus || ''}`)
      .then(res => res.json())
      .then(res => {
        setStateTenders(res.tenders || []);
        setLoadingTenders(false);
      })
      .catch(() => {
        setStateTenders([]);
        setLoadingTenders(false);
      });

    // Animate drawer in
    if (drawerRef.current) {
      gsap.fromTo(
        drawerRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  };

  const closeDrawer = () => {
    if (drawerRef.current) {
      gsap.to(drawerRef.current, {
        x: '100%',
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          setActiveStateInfo(null);
          setStateTenders([]);
        },
      });
    } else {
      setActiveStateInfo(null);
      setStateTenders([]);
    }
  };

  const formatCost = (val) => {
    const num = parseFloat(val || 0);
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className={`w-full ${isExpanded ? 'h-[850px] md:h-[920px]' : 'h-[640px] md:h-[740px]'} rounded-3xl overflow-hidden border border-slate-800/80 relative shadow-2xl bg-slate-950 flex transition-all duration-300`}>
      
      {/* Map Header Controls */}
      <div className="absolute top-4 left-4 z-[999] flex flex-wrap items-center gap-2 bg-slate-950/90 p-2 rounded-2xl border border-slate-800/90 backdrop-blur-md shadow-xl max-w-[calc(100%-2rem)]">
        
        {/* Metric Switch */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-1.5 hidden sm:inline">
            Metric:
          </span>
          <button
            onClick={() => handleMetricToggle('count')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === 'count'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Tender Count
          </button>
          <button
            onClick={() => handleMetricToggle('value')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === 'value'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Total Value (₹ Cr)
          </button>
        </div>

        {/* Status Filter Switch: All vs Live Bidding Only vs Closing Soon */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleStatusToggle('')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentStatus === ''
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Data
          </button>
          <button
            onClick={() => handleStatusToggle(currentStatus === 'live' ? '' : 'live')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentStatus === 'live'
                ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 font-extrabold'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentStatus === 'live' ? 'bg-slate-950 animate-ping' : 'bg-emerald-400'}`} />
            Live Bidding Only
          </button>
          <button
            onClick={() => handleStatusToggle(currentStatus === 'closing_soon' ? '' : 'closing_soon')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentStatus === 'closing_soon'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 font-extrabold'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentStatus === 'closing_soon' ? 'bg-slate-950 animate-ping' : 'bg-amber-400'}`} />
            Closing Soon
          </button>
        </div>

        {/* Expand / Collapse Size Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all ml-auto"
          title={isExpanded ? 'Compress Map' : 'Expand Big Map Size'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Floating Active Filter Notification Banner */}
      {currentStatus === 'live' && (
        <div className="absolute top-20 left-4 z-[990] bg-emerald-950/95 border border-emerald-500/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2 text-xs text-emerald-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Active Filter: <strong>Live Bidding Only</strong> ({metric === 'count' ? 'Counting Live Bids' : 'Showing Live Total Value'})</span>
          <button
            onClick={() => handleStatusToggle('')}
            className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[11px] font-bold border border-emerald-500/40 transition-colors"
          >
            Show All Data ✕
          </button>
        </div>
      )}

      {/* Floating Selected State Chip */}
      {selectedState && !activeStateInfo && (
        <div className="absolute top-20 right-4 z-[990] bg-slate-950/90 px-3.5 py-1.5 rounded-2xl border border-slate-800 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 shadow-lg">
          <span>Active State: <strong className="text-emerald-400 font-bold">{selectedState}</strong></span>
          <button
            onClick={() => onSelectState('')}
            className="text-rose-400 hover:text-rose-300 font-bold text-xs underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={indiaCenter}
          zoom={defaultZoom}
          scrollWheelZoom={false}
          className="w-full h-full bg-[#05070d]"
        >
          <MapResizeHandler isDetailOpen={Boolean(activeStateInfo)} isExpanded={isExpanded} />
          <MapFlyTo targetCoords={flyCoords} zoom={5.2} />

          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
            url={`https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${cartoApiKey}`}
            subdomains="abcd"
            maxZoom={19}
          />

          {mapData.map((st) => {
            if (!st.latitude || !st.longitude) return null;
            const isSelected = activeStateInfo?.state_code === st.state_code || selectedState === st.state_code;
            const markerIcon = createCustomStateIcon(st, isSelected, metric, currentStatus);

            return (
              <Marker
                key={st.state_id}
                position={[parseFloat(st.latitude), parseFloat(st.longitude)]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => handleStateClick(st),
                }}
              >
                <Popup className="dark-popup">
                  <div className="p-1.5 space-y-2 text-slate-100 min-w-[200px]">
                    <div className="font-heading font-bold text-sm text-emerald-300 flex items-center justify-between border-b border-slate-700/80 pb-1">
                      <span>{st.state_name} ({st.state_code})</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Bids:</span>
                        <strong className="text-white">{st.tender_count}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Live Bidding:</span>
                        <strong className="text-emerald-400">{st.live_count || 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Closing Soon:</span>
                        <strong className="text-amber-400">{st.closing_soon_count || 0}</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
                        <span className="text-slate-400">Value:</span>
                        <strong className="text-cyan-400">
                          ₹ {(parseFloat(st.total_value || 0) / 10000000).toFixed(1)} Cr
                        </strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStateClick(st)}
                      className="w-full mt-2 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs text-center hover:brightness-110 transition-all shadow-md shadow-emerald-500/20"
                    >
                      Open State Opportunities &rarr;
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Slide-Out State Details Inspector Drawer */}
      {activeStateInfo && (
        <div
          ref={drawerRef}
          className="absolute top-0 right-0 z-[1001] w-full sm:w-[390px] md:w-[440px] h-full bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800/90 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/90 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {activeStateInfo.state_code}
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-white">
                    {activeStateInfo.state_name}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  State Procurement Intelligence Overview
                </p>
              </div>

              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                title="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* State Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Total Bids</span>
                <span className="text-xl font-extrabold text-white font-heading">
                  {activeStateInfo.tender_count}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Live Bidding</span>
                <span className="text-xl font-extrabold text-emerald-400 font-heading">
                  {activeStateInfo.live_count || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Closing Soon</span>
                <span className="text-xl font-extrabold text-amber-400 font-heading">
                  {activeStateInfo.closing_soon_count || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Total Value</span>
                <span className="text-xl font-extrabold text-purple-400 font-heading truncate">
                  ₹ {(parseFloat(activeStateInfo.total_value || 0) / 10000000).toFixed(1)} Cr
                </span>
              </div>
            </div>

            {/* Active Tenders List in this State */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Active Opportunities ({stateTenders.length})
                </span>
              </div>

              {loadingTenders ? (
                <div className="py-10 text-center text-xs text-slate-400 animate-pulse">
                  Loading state tenders...
                </div>
              ) : stateTenders.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400">
                  No active tenders found for this state in current dataset.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {stateTenders.map((tender) => (
                    <div
                      key={tender.id}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 transition-all text-xs space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          {tender.portal_code || 'LIVE'}
                        </span>
                        <span className="font-heading font-extrabold text-emerald-400 text-xs">
                          {formatCost(tender.tender_value)}
                        </span>
                      </div>
                      <p className="font-medium text-slate-200 line-clamp-2 leading-snug">
                        {tender.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="truncate max-w-[190px]">Ref: {tender.tender_ref}</span>
                        <Link
                          href={`/tenders/${tender.id}`}
                          className="font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 shrink-0"
                        >
                          View Notice &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800/90 space-y-2">
            <button
              onClick={() => {
                onSelectState(activeStateInfo.state_code);
                closeDrawer();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              Filter Full Platform for {activeStateInfo.state_name}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={closeDrawer}
              className="w-full py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Back to Map
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
