/**
 * ParcelSummary — Selected Parcel Intelligence Card
 *
 * Displays key parcel metrics when a parcel is selected on the map
 * or from a bottleneck alert. Provides a quick overview without
 * requiring the full detail drawer.
 *
 * @module components/common/ParcelSummary
 */

import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  User,
  Layers,
} from 'lucide-react';

// ── Status config ──
const STATUS_CONFIG = {
  ACQUIRED: { label: 'Acquired', color: '#0D9488', bg: '#F0FDFA', icon: CheckCircle2 },
  UNDER_PROCESS: { label: 'Under Process', color: '#2563EB', bg: '#EFF6FF', icon: Clock },
  COMP_PENDING: { label: 'Comp. Pending', color: '#D97706', bg: '#FFFBEB', icon: Clock },
  POSSESSION_PENDING: { label: 'Possession Pending', color: '#9333EA', bg: '#F5F3FF', icon: Clock },
  RR_PENDING: { label: 'R&R Pending', color: '#2563EB', bg: '#EFF6FF', icon: Clock },
  HIGH_RISK: { label: 'High Risk', color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle },
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

// ── Empty state ──
function EmptyState() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Layers className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-900">Parcel Summary</h3>
      </div>
      <div className="p-6 text-center">
        <MapPin className="w-8 h-8 text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-slate-400 font-medium">No parcel selected</p>
        <p className="text-xs text-slate-300 mt-1">Click a parcel on the map or an alert to view details</p>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function ParcelSummary({ selectedParcel }) {
  if (!selectedParcel?.properties) return <EmptyState />;

  const p = selectedParcel.properties;
  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.UNDER_PROCESS;
  const StatusIcon = statusCfg.icon;
  const riskColor = getRiskColor(p.risk_score || 0);
  const areaHa = p.area_sq_meters ? (p.area_sq_meters / 10000).toFixed(2) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900">Parcel Summary</h3>
        </div>
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
          style={{
            color: statusCfg.color,
            backgroundColor: `${statusCfg.color}15`,
            borderColor: `${statusCfg.color}30`,
          }}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* ULPIN + Location */}
        <div>
          <p className="text-sm font-mono font-bold text-slate-900 truncate" title={p.ulpin}>
            {p.ulpin}
          </p>
          {p.village && (
            <p className="text-xs text-slate-500 mt-0.5">
              {p.village}{p.district ? `, ${p.district}` : ''}
            </p>
          )}
        </div>

        {/* Status + Risk row */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: `${statusCfg.color}15`, color: statusCfg.color }}
          >
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: `${riskColor}15`, color: riskColor }}
          >
            Risk: {p.risk_score || 0}
          </span>
        </div>

        {/* Risk bar */}
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-500 font-medium">{getRiskLabel(p.risk_level)}</span>
            <span className="font-bold" style={{ color: riskColor }}>{p.risk_score || 0}/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${p.risk_score || 0}%`, backgroundColor: riskColor }}
            />
          </div>
        </div>

        {/* Quick metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {areaHa && (
            <MetricPill icon={<MapPin className="w-3 h-3" />} label="Area" value={`${areaHa} ha`} />
          )}
          {p.compensation_progress_pct !== undefined && (
            <MetricPill icon={<TrendingUp className="w-3 h-3" />} label="Comp." value={`${p.compensation_progress_pct}%`} />
          )}
          {p.possession_status && (
            <MetricPill icon={<CheckCircle2 className="w-3 h-3" />} label="Possession" value={p.possession_status} />
          )}
          {p.rr_status && (
            <MetricPill icon={<FileText className="w-3 h-3" />} label="R&R" value={p.rr_status} />
          )}
        </div>

        {/* Bottleneck */}
        {p.main_bottleneck && p.main_bottleneck !== 'None' && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase mb-0.5">
              <AlertTriangle className="w-3 h-3" />
              Bottleneck
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">{p.main_bottleneck}</p>
          </div>
        )}

        {/* Stage + Pending With */}
        {p.stage && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              <Clock className="w-3 h-3 text-teal-500" />
              Current Stage
            </div>
            <p className="text-[11px] text-slate-800 font-semibold">{p.stage}</p>
          </div>
        )}

        {p.pending_with_role && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <User className="w-3 h-3" />
            <span>Pending with: <strong className="text-slate-700">{p.pending_with_role.replace(/_/g, ' ')}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small metric pill ──
function MetricPill({ icon, label, value }) {
  return (
    <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
      <div className="flex items-center gap-1 text-[9px] font-mono uppercase font-semibold text-slate-400">
        {icon}
        {label}
      </div>
      <p className="text-[11px] font-bold text-slate-800 mt-0.5 truncate" title={String(value)}>
        {value}
      </p>
    </div>
  );
}
