import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { MapPin, Layers, Coins, Filter } from 'lucide-react';

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

export default function IndiaMap({ selectedState, onSelectState, statusFilter }) {
  const [mapData, setMapData] = useState([]);
  const [metric, setMetric] = useState('count'); // 'count' or 'value'
  const [loading, setLoading] = useState(true);

  const indiaCenter = [22.5937, 78.9629];
  const defaultZoom = 5;

  useEffect(() => {
    fetch(`/api/map/aggregate?metric=${metric}&status=${statusFilter || ''}`)
      .then(res => res.json())
      .then(res => {
        setMapData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching map data:', err);
        setLoading(false);
      });
  }, [metric, statusFilter]);

  const calculateRadius = (item) => {
    if (metric === 'count') {
      const count = parseInt(item.tender_count || 0);
      return Math.max(10, Math.min(45, count * 6));
    } else {
      const valCr = parseFloat(item.total_value || 0) / 10000000;
      return Math.max(10, Math.min(50, Math.log2(valCr + 1) * 8));
    }
  };

  const getMarkerColor = (item) => {
    if (selectedState && selectedState === item.state_code) {
      return '#06b6d4'; // Cyan for selected
    }
    const count = parseInt(item.tender_count || 0);
    if (count >= 5) return '#10b981'; // Emerald
    if (count >= 2) return '#f59e0b'; // Amber
    return '#64748b'; // Slate
  };

  return (
    <div className="w-full h-[450px] md:h-[550px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl bg-slate-950">
      
      {/* Map Header Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
        <span className="text-xs font-semibold text-slate-300 px-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          Metric:
        </span>
        <button
          onClick={() => setMetric('count')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            metric === 'count'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          By Tender Count
        </button>
        <button
          onClick={() => setMetric('value')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            metric === 'value'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          By ₹ Total Value
        </button>
      </div>

      {/* Reset Selected State */}
      {selectedState && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2">
          <span>Active State: <strong className="text-cyan-400">{selectedState}</strong></span>
          <button
            onClick={() => onSelectState('')}
            className="text-rose-400 hover:text-rose-300 font-bold text-xs underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={indiaCenter}
        zoom={defaultZoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={indiaCenter} zoom={defaultZoom} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {mapData.map((st) => {
          if (!st.latitude || !st.longitude) return null;
          const isSelected = selectedState === st.state_code;
          const radius = calculateRadius(st);
          const color = getMarkerColor(st);

          return (
            <CircleMarker
              key={st.state_id}
              center={[parseFloat(st.latitude), parseFloat(st.longitude)]}
              radius={radius}
              pathOptions={{
                color: isSelected ? '#38bdf8' : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.8 : 0.5,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelectState(st.state_code),
              }}
            >
              <Popup className="dark-popup">
                <div className="p-1 space-y-2 text-slate-100 min-w-[180px]">
                  <div className="font-heading font-bold text-sm text-cyan-300 flex items-center justify-between border-b border-slate-700 pb-1">
                    <span>{st.state_name} ({st.state_code})</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Tenders:</span>
                      <strong className="text-white">{st.tender_count}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Live Now:</span>
                      <strong className="text-emerald-400">{st.live_count || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Closing Soon:</span>
                      <strong className="text-rose-400">{st.closing_soon_count || 0}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
                      <span className="text-slate-400">Total Value:</span>
                      <strong className="text-cyan-400">
                        ₹{(parseFloat(st.total_value || 0) / 10000000).toFixed(1)} Cr
                      </strong>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectState(st.state_code)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs text-center hover:bg-cyan-400 transition-colors"
                  >
                    Filter List for {st.state_code}
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

    </div>
  );
}
