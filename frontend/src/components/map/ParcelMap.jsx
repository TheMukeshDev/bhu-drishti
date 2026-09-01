import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  X,
  Home,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import {
  PARCEL_STATUS_COLORS,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from '../../data/parcelData';

// ── Leaflet default icon fix ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Status helpers ──
const STATUS_LABELS = {
  ACQUIRED: 'Acquired',
  UNDER_PROCESS: 'Under Process',
  COMP_PENDING: 'Compensation Pending',
  POSSESSION_PENDING: 'Possession Pending',
  RR_PENDING: 'R&R Pending',
  HIGH_RISK: 'High Risk',
};

const STATUS_ICONS = {
  ACQUIRED: CheckCircle2,
  UNDER_PROCESS: Clock,
  COMP_PENDING: AlertTriangle,
  POSSESSION_PENDING: Clock,
  RR_PENDING: Clock,
  HIGH_RISK: AlertTriangle,
};

function getRiskColor(score) {
  if (score >= 80) return '#DC2626';
  if (score >= 50) return '#D97706';
  return '#0D9488';
}

function getRiskLabel(level) {
  if (level === 'High') return 'High Risk';
  if (level === 'Medium') return 'Medium Risk';
  return 'Low Risk';
}

// ── Hover Tooltip (positioned over map) ──
function HoverTooltip({ feature, position }) {
  if (!feature || !position) return null;
  const p = feature.properties;
  const statusColor = PARCEL_STATUS_COLORS[p.status] || '#64748B';
  const riskColor = getRiskColor(p.risk_score);

  return (
    <div
      className="absolute z-[1000] pointer-events-none bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 max-w-[220px]"
      style={{ left: position.x + 12, top: position.y - 60 }}
    >
      <p className="text-xs font-bold text-slate-900 font-mono truncate" title={p.ulpin}>
        {p.ulpin}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
        >
          {STATUS_LABELS[p.status] || p.status}
        </span>
        <span
          className="text-[10px] font-bold"
          style={{ color: riskColor }}
        >
          {p.risk_score}
        </span>
      </div>
    </div>
  );
}

// ── Reset/Home view button ──
function HomeButton({ center, zoom }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(center, zoom)}
      className="absolute bottom-4 right-4 z-[999] bg-white rounded-lg shadow-md border border-slate-200 p-2 hover:bg-slate-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
      aria-label="Reset map view"
      title="Reset view"
    >
      <Home className="w-4 h-4 text-slate-600" />
    </button>
  );
}

// ── Auto-fit bounds to GeoJSON ──
function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson.features || geojson.features.length === 0) return;
    const json = L.geoJSON(geojson);
    map.fitBounds(json.getBounds(), { padding: [30, 30], maxZoom: 16 });
  }, [geojson, map]);
  return null;
}

// ── Parcel Detail Panel ──
function ParcelDetailPanel({ parcel, onClose }) {
  if (!parcel) return null;
  const { properties: p } = parcel;
  const StatusIcon = STATUS_ICONS[p.status] || MapPin;
  const riskColor = getRiskColor(p.risk_score);
  const statusColor = PARCEL_STATUS_COLORS[p.status] || '#64748B';
  const statusLabel = STATUS_LABELS[p.status] || p.status;
  const areaHa = (p.area_sq_meters / 10000).toFixed(2);

  return (
    <>
      {/* Desktop: side drawer */}
      <div className="hidden sm:flex absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-lg z-[1000] flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate font-mono">{p.ulpin}</h3>
            <p className="text-xs text-slate-500 truncate">{p.village}, {p.taluka}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close parcel details"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <DetailContent p={p} statusColor={statusColor} riskColor={riskColor} statusLabel={statusLabel} areaHa={areaHa} StatusIcon={StatusIcon} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-white rounded-lg font-semibold text-sm hover:bg-teal-600 transition-colors min-h-[48px]"
            aria-label="View full parcel analysis"
          >
            View Full Analysis
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <MobileBottomSheet parcel={parcel} onClose={onClose} />
    </>
  );
}

// ── Mobile Bottom Sheet ──
function MobileBottomSheet({ parcel, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const { properties: p } = parcel;
  const StatusIcon = STATUS_ICONS[p.status] || MapPin;
  const riskColor = getRiskColor(p.risk_score);
  const statusColor = PARCEL_STATUS_COLORS[p.status] || '#64748B';
  const statusLabel = STATUS_LABELS[p.status] || p.status;
  const areaHa = (p.area_sq_meters / 10000).toFixed(2);

  return (
    <div className="sm:hidden absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] max-h-[70vh] flex flex-col">
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-slate-300 rounded-full" />
      </div>

      {/* Compact header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-2 flex items-center gap-3"
        aria-expanded={expanded}
        aria-label={`Parcel ${p.ulpin}. ${statusLabel}. Risk ${p.risk_score}. Tap to ${expanded ? 'collapse' : 'expand'}`}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 font-mono truncate">{p.ulpin}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold" style={{ color: statusColor }}>{statusLabel}</span>
            <span className="text-[10px] font-bold" style={{ color: riskColor }}>Risk: {p.risk_score}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close parcel details"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 border-t border-slate-100">
          <DetailContent p={p} statusColor={statusColor} riskColor={riskColor} statusLabel={statusLabel} areaHa={areaHa} StatusIcon={StatusIcon} />

          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-white rounded-lg font-semibold text-sm hover:bg-teal-600 transition-colors min-h-[48px]"
            aria-label="View full parcel analysis"
          >
            View Full Analysis
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared detail content ──
function DetailContent({ p, statusColor, riskColor, statusLabel, areaHa, StatusIcon }) {
  return (
    <>
      {/* Status + Risk badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
          role="status"
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusLabel}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${riskColor}15`, color: riskColor }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {getRiskLabel(p.risk_level)}
        </span>
      </div>

      {/* Risk score bar */}
      <div className="bg-slate-50 rounded-lg p-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Risk Score</span>
          <span className="font-bold" style={{ color: riskColor }}>
            {p.risk_score}/100
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={p.risk_score} aria-valuemin={0} aria-valuemax={100} aria-label={`Risk score ${p.risk_score} out of 100`}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${p.risk_score}%`, backgroundColor: riskColor }}
          />
        </div>
      </div>

      {/* Main bottleneck */}
      {p.main_bottleneck && p.main_bottleneck !== 'None' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Bottleneck
          </div>
          <p className="text-xs text-amber-800">{p.main_bottleneck}</p>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <DetailField label="Khasra No." value={p.khasra_no} />
        <DetailField label="Area" value={`${areaHa} ha`} />
        <DetailField label="District" value={p.district} />
        <DetailField label="State" value={p.state} />
        <DetailField label="Compensation" value={`${p.compensation_progress_pct}%`} />
        <DetailField label="Possession" value={p.possession_status} />
        <div className="col-span-2">
          <DetailField label="R&R Status" value={p.rr_status} />
        </div>
        <div className="col-span-2">
          <DetailField label="Current Stage" value={p.stage} />
        </div>
        {p.pending_with_role && (
          <div className="col-span-2">
            <DetailField label="Pending With" value={p.pending_with_role.replace(/_/g, ' ')} />
          </div>
        )}
      </div>
    </>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">{label}</span>
      <p className="text-slate-800 font-semibold mt-0.5">{value}</p>
    </div>
  );
}

// ── Legend ──
function MapLegend() {
  const items = [
    { status: 'ACQUIRED', label: 'Acquired' },
    { status: 'UNDER_PROCESS', label: 'Under Process' },
    { status: 'COMP_PENDING', label: 'Comp. Pending' },
    { status: 'POSSESSION_PENDING', label: 'Possession Pending' },
    { status: 'RR_PENDING', label: 'R&R Pending' },
    { status: 'HIGH_RISK', label: 'High Risk' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[999] bg-white rounded-lg shadow-md border border-slate-200 px-3 py-2.5 max-w-[180px] hidden sm:block" role="img" aria-label="Parcel status legend">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Parcel Status</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: PARCEL_STATUS_COLORS[item.status] }}
              aria-hidden="true"
            />
            <span className="text-[10px] text-slate-600 font-medium leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile compact legend (bottom-left, above bottom sheet) ──
function MobileLegend({ selectedParcel }) {
  return (
    <div
      className={`absolute z-[998] bg-white rounded-lg shadow-md border border-slate-200 px-2.5 py-1.5 sm:hidden transition-all ${
        selectedParcel ? 'bottom-[90px]' : 'bottom-4'
      } left-4`}
      role="img"
      aria-label="Parcel status legend"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { color: '#0D9488', label: 'Acq.' },
          { color: '#2563EB', label: 'Proc.' },
          { color: '#D97706', label: 'Comp.' },
          { color: '#DC2626', label: 'Risk' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span className="text-[9px] text-slate-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Loading state ──
function MapLoadingState() {
  return (
    <div className="absolute inset-0 z-[1001] bg-white/80 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">Loading parcel data…</p>
      </div>
    </div>
  );
}

// ── Empty state ──
function MapEmptyState() {
  return (
    <div className="absolute inset-0 z-[1001] bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">No parcels found for this jurisdiction.</p>
        <p className="text-xs text-slate-400 mt-1">Try selecting a different project or region.</p>
      </div>
    </div>
  );
}

// ── Error state ──
function MapErrorState({ message }) {
  return (
    <div className="absolute inset-0 z-[1001] bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-slate-700 font-medium">Unable to load parcel data.</p>
        <p className="text-xs text-slate-400 mt-1">{message || 'Please try again later.'}</p>
      </div>
    </div>
  );
}

// ── Main ParcelMap Component ──
function ParcelMap({ parcels, selectedParcel, onParcelSelect, loading, error }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoverFeature, setHoverFeature] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const mapRef = useRef(null);

  // Determine parcel source — data comes from parent (App.jsx)
  const features = parcels?.features || [];
  const filtered = useMemo(() => {
    if (filterStatus === 'all') return features;
    return features.filter((f) => f.properties.status === filterStatus);
  }, [features, filterStatus]);

  // Selected parcel — accept from prop (controlled) or internal
  const selectedId = selectedParcel?.properties?.id || null;

  // Determine which feature is selected (match from the data array)
  const activeFeature = useMemo(() => {
    if (!selectedId) return null;
    return features.find((f) => f.properties.id === selectedId) || null;
  }, [features, selectedId]);

  const handleSelect = useCallback((feature) => {
    if (onParcelSelect) onParcelSelect(feature);
  }, [onParcelSelect]);

  // GeoJSON event handlers
  const onEachFeature = useCallback((feature, layer) => {
    // Accessible label
    const p = feature.properties;
    layer.options.alt = `Parcel ${p.ulpin}, ${STATUS_LABELS[p.status] || p.status}, Risk ${p.risk_score}`;

    layer.on({
      click: () => {
        handleSelect(feature);
      },
      mouseover: (e) => {
        // Highlight
        e.target.setStyle({ weight: 3, fillOpacity: 0.65, dashArray: '' });
        e.target.bringToFront();
        setHoverFeature(feature);
      },
      mouseout: (e) => {
        // Reset to default (unless selected)
        const isSelected = selectedId === feature.properties.id;
        e.target.setStyle({
          weight: isSelected ? 3 : 2,
          fillOpacity: isSelected ? 0.6 : 0.45,
          dashArray: isSelected ? '6 4' : undefined,
        });
        setHoverFeature(null);
        setMousePos(null);
      },
      mousemove: (e) => {
        const container = e.target._map?.getContainer();
        if (container) {
          const rect = container.getBoundingClientRect();
          setMousePos({ x: e.originalEvent.clientX - rect.left, y: e.originalEvent.clientY - rect.top });
        }
      },
    });
  }, [handleSelect, selectedId]);

  // Style function
  const geoStyle = useCallback((feature) => {
    const status = feature.properties.status;
    const isSelected = selectedId === feature.properties.id;
    const color = PARCEL_STATUS_COLORS[status] || '#64748B';
    return {
      color,
      fillColor: color,
      fillOpacity: isSelected ? 0.6 : 0.45,
      weight: isSelected ? 3 : 2,
      opacity: 0.8,
      dashArray: isSelected ? '6 4' : undefined,
    };
  }, [selectedId]);

  // Key for GeoJSON layer — only re-create when data or selection changes
  const geojsonKey = `${filterStatus}-${filtered.length}-${selectedId || 'none'}`;

  const geojsonData = useMemo(() => ({
    type: 'FeatureCollection',
    features: filtered,
  }), [filtered]);

  return (
    <div className="relative w-full overflow-hidden border border-slate-200 bg-white max-w-full" ref={mapRef}>
      {/* Toolbar */}
      <div className="absolute top-2 left-10 right-10 sm:top-3 sm:left-14 sm:right-14 z-[999] flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 px-1.5 sm:px-2 py-1 sm:py-1.5 max-w-[calc(100vw-80px)]">
          <Layers className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[11px] sm:text-xs font-medium text-slate-700 bg-transparent outline-none cursor-pointer pr-1 min-h-[36px] max-w-[160px] sm:max-w-none truncate"
            aria-label="Filter parcels by status"
          >
            <option value="all">All Parcels ({features.length})</option>
            <option value="ACQUIRED">Acquired</option>
            <option value="UNDER_PROCESS">Under Process</option>
            <option value="COMP_PENDING">Comp. Pending</option>
            <option value="POSSESSION_PENDING">Possession Pending</option>
            <option value="RR_PENDING">R&R Pending</option>
            <option value="HIGH_RISK">High Risk</option>
          </select>
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium bg-white/80 rounded-md px-1.5 sm:px-2 py-1 hidden sm:inline">
          {filtered.length} parcels
        </span>
      </div>

      {/* Map */}
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        className="w-full"
        style={{ height: 'min(70vh, 500px)', minHeight: '280px' }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds when there are parcels */}
        {filtered.length > 0 && !activeFeature && (
          <FitBounds geojson={geojsonData} />
        )}

        {/* Fit to selected parcel */}
        {activeFeature && (
          <FitBounds geojson={{ type: 'FeatureCollection', features: [activeFeature] }} />
        )}

        {/* GeoJSON parcels */}
        <GeoJSON
          key={geojsonKey}
          data={geojsonData}
          onEachFeature={onEachFeature}
          style={geoStyle}
        />

        <HomeButton center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} />
      </MapContainer>

      {/* Hover tooltip */}
      <HoverTooltip feature={hoverFeature} position={mousePos} />

      {/* Legend */}
      <MapLegend />
      <MobileLegend selectedParcel={activeFeature} />

      {/* Loading */}
      {loading && <MapLoadingState />}

      {/* Empty */}
      {!loading && !error && features.length === 0 && <MapEmptyState />}

      {/* Error */}
      {error && <MapErrorState message={error} />}

      {/* Detail panel */}
      <ParcelDetailPanel
        parcel={activeFeature}
        onClose={() => handleSelect(null)}
      />
    </div>
  );
}

export default ParcelMap;
