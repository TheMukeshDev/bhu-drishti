/**
 * BottleneckAlerts — BHU-DRISHTI Bottleneck Detection Widget
 *
 * Identifies parcels stuck in processing queues beyond statutory thresholds.
 * Integrates with FastAPI backend via fetchBottlenecks() from api.js.
 * Falls back to enriched mock data when backend is unavailable.
 *
 * @module components/alerts/BottleneckAlerts
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Clock,
  FileWarning,
  Users,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  X,
  Bell,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { fetchBottlenecks } from '../../lib/api';

// ── Severity config ──────────────────────────────────────────────────

const SEVERITY = {
  CRITICAL: {
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    label: 'Critical',
    icon: AlertTriangle,
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  HIGH: {
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    label: 'High',
    icon: Clock,
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  MEDIUM: {
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    label: 'Medium',
    icon: FileWarning,
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
};

const TYPE_CONFIG = {
  SLA_BREACH: { label: 'SLA Breach', icon: Clock },
  DOCUMENTATION: { label: 'Documentation', icon: FileWarning },
  STAKEHOLDER: { label: 'Stakeholder', icon: Users },
  ENCUMBRANCE: { label: 'Encumbrance', icon: ShieldAlert },
};

// ── Risk score color helper ──
function getRiskColor(score) {
  if (score >= 80) return '#DC2626';
  if (score >= 50) return '#D97706';
  return '#0D9488';
}

// ── Time ago helper ──
function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  const hrs = Math.floor(mins / 60);
  if (hrs < 1) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Single Alert Card ────────────────────────────────────────────────

function AlertCard({ alert, isExpanded, onToggle, onSelect, onDismiss }) {
  const sev = SEVERITY[alert.severity] || SEVERITY.MEDIUM;
  const SevIcon = sev.icon;
  const typeConfig = TYPE_CONFIG[alert.type] || { label: alert.type, icon: FileWarning };
  const TypeIcon = typeConfig.icon;
  const riskColor = getRiskColor(alert.riskScore || 0);

  const isOverdue = alert.daysOverdue > 0;
  const progressPct = alert.statutoryThreshold
    ? Math.min(100, Math.round((alert.daysInStage / alert.statutoryThreshold) * 100))
    : 0;
  const isNearingThreshold = progressPct >= 80 && !isOverdue;

  return (
    <div
      className="border rounded-lg transition-colors"
      style={{ borderColor: sev.border, backgroundColor: sev.bg }}
    >
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-3 sm:px-4 flex items-start gap-3"
        aria-expanded={isExpanded}
        aria-label={`${sev.label} bottleneck alert for ULPIN ${alert.ulpin}: ${alert.description}`}
      >
        {/* Severity icon */}
        <span
          className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${sev.color}15` }}
          aria-hidden="true"
        >
          <SevIcon className="w-4 h-4" style={{ color: sev.color }} />
        </span>

        <div className="flex-1 min-w-0">
          {/* Severity + type + overdue */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${sev.badge}`}
            >
              {sev.label}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {typeConfig.label}
            </span>
            {isOverdue && (
              <span className="text-[10px] font-bold text-red-600">
                +{alert.daysOverdue}d overdue
              </span>
            )}
          </div>

          {/* ULPIN */}
          <p className="text-xs font-mono font-bold text-slate-900 mt-1 truncate" title={alert.ulpin}>
            {alert.ulpin}
          </p>

          {/* Stage + time */}
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
            <span className="truncate">{alert.stage}</span>
            <span className="flex-shrink-0">•</span>
            <span className="flex-shrink-0">{timeAgo(alert.detectedAt)}</span>
          </div>
        </div>

        {/* Expand chevron */}
        <span className="text-slate-300 mt-1 flex-shrink-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 pt-0 border-t" style={{ borderColor: sev.border }}>
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
            <MetricCell label="Stage" value={alert.stage} />
            <MetricCell label="District" value={alert.district} />
            <MetricCell
              label="Days in Stage"
              value={`${alert.daysInStage} days`}
              highlight={isOverdue}
            />
            <MetricCell
              label="Threshold"
              value={`${alert.statutoryThreshold} days`}
            />
            <MetricCell
              label="Days Overdue"
              value={isOverdue ? `${alert.daysOverdue} days` : 'Within SLA'}
              highlight={isOverdue}
            />
            <MetricCell
              label="Risk Score"
              value={`${alert.riskScore}/100`}
              valueStyle={{ color: riskColor }}
            />
            <MetricCell label="Project" value={alert.projectName || alert.project} />
            <MetricCell label="Responsible" value={alert.owner} />
          </div>

          {/* SLA progress bar */}
          {alert.statutoryThreshold > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-500 font-medium">SLA Progress</span>
                <span
                  className="font-bold"
                  style={{ color: isOverdue ? '#DC2626' : isNearingThreshold ? '#D97706' : '#0D9488' }}
                >
                  {progressPct}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, progressPct)}%`,
                    backgroundColor: isOverdue ? '#DC2626' : isNearingThreshold ? '#D97706' : '#0D9488',
                  }}
                />
              </div>
            </div>
          )}

          {/* Recommended action */}
          {alert.action && (
            <div className="mt-3 p-2.5 bg-white rounded-md border border-slate-200">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase mb-1">
                <TrendingUp className="w-3 h-3 text-teal-500" />
                Recommended Action
              </div>
              <p className="text-xs text-slate-700 font-medium">{alert.action}</p>
            </div>
          )}

          {/* View Parcel button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(alert);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
            aria-label={`View parcel ${alert.ulpin} on map`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-500" />
            View Parcel on Map
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Small metric cell ──
function MetricCell({ label, value, highlight = false, valueStyle = {} }) {
  return (
    <div className="p-2 bg-white rounded-md border border-slate-200">
      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
        {label}
      </span>
      <p
        className={`text-xs font-semibold mt-0.5 truncate ${highlight ? 'text-red-700' : 'text-slate-800'}`}
        style={!highlight ? valueStyle : undefined}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export function BottleneckAlerts({ projectCode, onParcelSelect }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [dismissed, setDismissed] = useState(new Set());
  const [filter, setFilter] = useState('all');

  // ── Load bottleneck alerts ──
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBottlenecks(projectCode);
        if (!cancelled) {
          if (Array.isArray(data)) {
            setAlerts(data);
          } else {
            setAlerts([]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load bottleneck alerts.');
          setAlerts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [projectCode]);

  // ── Filtering ──
  const visible = alerts.filter((a) => {
    if (dismissed.has(a.id)) return false;
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const counts = {
    all: alerts.filter((a) => !dismissed.has(a.id)).length,
    CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL' && !dismissed.has(a.id)).length,
    HIGH: alerts.filter((a) => a.severity === 'HIGH' && !dismissed.has(a.id)).length,
    MEDIUM: alerts.filter((a) => a.severity === 'MEDIUM' && !dismissed.has(a.id)).length,
  };

  // ── Handlers ──
  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const dismiss = useCallback((id) => {
    setDismissed((prev) => new Set([...prev, id]));
  }, []);

  const handleSelect = useCallback((alert) => {
    if (onParcelSelect && alert) {
      // Construct a feature-like object for the parcel
      onParcelSelect({
        type: 'Feature',
        properties: {
          id: alert.parcelId,
          ulpin: alert.ulpin,
          status: alert.severity === 'CRITICAL' ? 'HIGH_RISK' : 'UNDER_PROCESS',
          risk_score: alert.riskScore,
          risk_level: alert.riskScore >= 80 ? 'High' : alert.riskScore >= 50 ? 'Medium' : 'Low',
          stage: alert.stage,
          district: alert.district,
          state: alert.state,
          village: '',
          khasra_no: '',
          area_sq_meters: 0,
          compensation_progress_pct: 0,
          possession_status: 'Pending',
          rr_status: 'Pending',
          main_bottleneck: alert.description,
          pending_with_role: alert.ownerRole,
        },
      });
    }
  }, [onParcelSelect]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900">Bottleneck Alerts</h3>
        </div>
        <div className="p-6 text-center">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Bottleneck alerts loading…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Bottleneck Alerts</h3>
        </div>
        <div className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-300 mx-auto mb-2" />
          <p className="text-sm text-slate-700 font-medium">{error}</p>
          <p className="text-xs text-slate-400 mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">Bottleneck Alerts</h3>
              <p className="text-[10px] text-slate-400 truncate">
                Parcels requiring administrative intervention
              </p>
            </div>
          </div>
          {counts.all > 0 && (
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0 ml-2">
              {counts.all}
            </span>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'CRITICAL', label: 'Critical', count: counts.CRITICAL },
          { key: 'HIGH', label: 'High', count: counts.HIGH },
          { key: 'MEDIUM', label: 'Medium', count: counts.MEDIUM },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors min-h-[32px] ${
              filter === f.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            aria-pressed={filter === f.key}
          >
            {f.label}
            {f.count > 0 && <span className="ml-1">{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-teal-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">
              {filter === 'all'
                ? 'No critical bottlenecks detected.'
                : `No ${filter.toLowerCase()} severity alerts.`}
            </p>
            {filter === 'all' && (
              <p className="text-xs text-slate-400 mt-1">
                All parcels are within statutory thresholds.
              </p>
            )}
          </div>
        ) : (
          visible.map((alert) => (
            <div key={alert.id} className="relative group">
              <AlertCard
                alert={alert}
                isExpanded={expanded.has(alert.id)}
                onToggle={() => toggleExpand(alert.id)}
                onSelect={handleSelect}
                onDismiss={() => dismiss(alert.id)}
              />
              {/* Dismiss button — visible on hover, touch-friendly on mobile */}
              <button
                onClick={() => dismiss(alert.id)}
                className="absolute top-2 right-10 p-2 rounded-full opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 opacity-100 sm:opacity-0 hover:bg-slate-100 transition-opacity min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label={`Dismiss alert ${alert.id}`}
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BottleneckAlerts;
