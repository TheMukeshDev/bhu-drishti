import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  Building2,
  Calendar,
  ChevronDown,
  Info,
  User,
  ArrowRight,
} from 'lucide-react';
import {
  STAGE_STATUS,
  STATUS_CONFIG,
  computeStageStatuses,
  computeStageSummary,
} from '../../data/workflowData';

/**
 * WorkflowTracker — RFCTLARR Act 2013 8-Stage Statutory Workflow.
 *
 * @param {Object} props
 * @param {Array} [props.stages] - Pre-computed stages (optional; computes from project if omitted)
 * @param {number} [props.currentStage] - Current stage id (used when stages not provided)
 * @param {(stageId: number) => void} props.onStageSelect - Callback when stage is clicked
 * @param {object} [props.selectedProject] - Project data for status computation
 */
export const WorkflowTracker = ({
  stages: stagesProp,
  currentStage,
  onStageSelect,
  selectedProject,
}) => {
  const [activeDetailId, setActiveDetailId] = useState(null);
  const scrollRef = useRef(null);

  // Compute stages from project data if not provided
  const stages = stagesProp || computeStageStatuses(selectedProject);
  const summary = computeStageSummary(stages);

  // Initialize selection to current stage
  useEffect(() => {
    if (activeDetailId === null) {
      const initial = currentStage || summary.currentStageId || stages[0]?.id;
      setActiveDetailId(initial);
    }
  }, [currentStage, summary.currentStageId, stages]);

  const selectedStage = stages.find((s) => s.id === activeDetailId) || stages[0];

  const handleStageClick = (stageId) => {
    setActiveDetailId(stageId);
    onStageSelect?.(stageId);
  };

  // Respect prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Scroll active stage into view on desktop
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeDetailId, prefersReducedMotion]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-gov-primary shrink-0" />
          <h2 className="text-xs sm:text-base font-bold tracking-wide uppercase truncate">
            RFCTLARR Act 2013 — Statutory Workflow
          </h2>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono bg-slate-800 text-teal-300 border border-slate-700 px-2 py-1 rounded shrink-0">
          Stage {summary.currentStageId || '—'}: {summary.currentStageName}
        </span>
      </div>

      {/* PROGRESS SUMMARY BAR */}
      <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        {/* Completed count */}
        <div
          className="flex items-center gap-2 text-xs font-medium text-slate-700"
          role="status"
          aria-label={`${summary.completed} of ${summary.total} stages completed`}
        >
          <div className="flex items-center gap-0.5">
            {Array.from({ length: summary.total }).map((_, i) => (
              <div
                key={i}
                className={`w-4 sm:w-5 h-1.5 rounded-full transition-colors ${
                  i < summary.completed
                    ? 'bg-gov-primary'
                    : i === summary.completed
                      ? 'bg-amber-400'
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="font-mono font-semibold whitespace-nowrap">
            {summary.completed} of {summary.total}
          </span>
          <span className="text-slate-500 whitespace-nowrap">stages completed</span>
        </div>

        {/* Risk/Delay indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          {summary.atRisk > 0 && (
            <span className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {summary.atRisk} stage{summary.atRisk > 1 ? 's' : ''} at risk
            </span>
          )}
          {summary.delayed > 0 && (
            <span className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {summary.delayed} delayed
            </span>
          )}
        </div>
      </div>

      {/* ===== DESKTOP HORIZONTAL STEPPER (≥ lg) ===== */}
      <div className="hidden lg:block border-b border-slate-200">
        <div ref={scrollRef} className="overflow-x-auto px-6 py-5">
          <div className="flex items-start justify-between min-w-[800px] relative">
            {stages.map((stage, idx) => {
              const cfg = STATUS_CONFIG[stage.status];
              const isSelected = stage.id === activeDetailId;
              const isLast = idx === stages.length - 1;

              return (
                <React.Fragment key={stage.id}>
                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className="absolute top-[18px] h-[2px] z-0"
                      style={{
                        left: `calc(${(idx / (stages.length - 1)) * 100}% + 20px)`,
                        width: `calc(${100 / (stages.length - 1)}% - 40px)`,
                      }}
                      aria-hidden="true"
                    >
                      <div
                        className={`h-full rounded-full transition-colors ${
                          stage.status === STAGE_STATUS.COMPLETED
                            ? 'bg-gov-primary'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  )}

                  {/* Stage node */}
                  <button
                    type="button"
                    data-active={isSelected ? 'true' : undefined}
                    onClick={() => handleStageClick(stage.id)}
                    className={`relative z-10 flex flex-col items-center w-[calc(100%/8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-primary rounded-lg transition-transform ${
                      prefersReducedMotion ? '' : 'hover:scale-105'
                    } ${isSelected ? 'scale-105' : ''}`}
                    aria-label={`Stage ${stage.id}: ${stage.fullTitle}. Status: ${cfg.label}`}
                    aria-current={stage.status === STAGE_STATUS.CURRENT ? 'step' : undefined}
                  >
                    {/* Circle */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all ${cfg.iconBg} ${
                        isSelected ? 'ring-2 ring-gov-primary ring-offset-2' : ''
                      }`}
                    >
                      {stage.status === STAGE_STATUS.COMPLETED ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : stage.status === STAGE_STATUS.AT_RISK ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : stage.status === STAGE_STATUS.DELAYED ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <span>{String(stage.id).padStart(2, '0')}</span>
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-center px-0.5">
                      <span className={`block text-[11px] font-semibold leading-tight ${cfg.color}`}>
                        {stage.title}
                      </span>
                      <span className="inline-block text-[9px] font-mono text-slate-400 mt-0.5">
                        {stage.statute}
                      </span>
                    </div>

                    {/* Status badge */}
                    {(stage.status === STAGE_STATUS.CURRENT ||
                      stage.status === STAGE_STATUS.AT_RISK ||
                      stage.status === STAGE_STATUS.DELAYED) && (
                      <span
                        className={`mt-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== MOBILE VERTICAL TIMELINE (< lg) ===== */}
      <div className="lg:hidden px-4 py-4 space-y-0">
        <div className="text-[11px] font-mono font-semibold uppercase text-slate-400 tracking-wider mb-3">
          8 Statutory Stages — tap for details
        </div>
        <div className="relative">
          {stages.map((stage, idx) => {
            const cfg = STATUS_CONFIG[stage.status];
            const isSelected = stage.id === activeDetailId;
            const isLast = idx === stages.length - 1;

            return (
              <div key={stage.id} className="relative flex gap-3">
                {/* Vertical line + dot */}
                <div className="flex flex-col items-center shrink-0 w-8">
                  {/* Dot */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-[10px] z-10 shrink-0 ${cfg.iconBg}`}
                  >
                    {stage.status === STAGE_STATUS.COMPLETED ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : stage.status === STAGE_STATUS.AT_RISK ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : stage.status === STAGE_STATUS.DELAYED ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <span>{String(stage.id).padStart(2, '0')}</span>
                    )}
                  </div>
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-[8px] ${
                        stage.status === STAGE_STATUS.COMPLETED
                          ? 'bg-gov-primary'
                          : 'bg-slate-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Stage card */}
                <button
                  type="button"
                  onClick={() => handleStageClick(stage.id)}
                  className={`flex-1 mb-2 p-3 rounded-lg border text-left transition-all min-h-[52px] ${cfg.bg} ${
                    isSelected
                      ? `${cfg.border} ring-2 ring-gov-primary shadow-sm`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  aria-label={`Stage ${stage.id}: ${stage.fullTitle}. Status: ${cfg.label}`}
                  aria-current={stage.status === STAGE_STATUS.CURRENT ? 'step' : undefined}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${cfg.color}`}>
                          {stage.title}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {stage.statute}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {(stage.status === STAGE_STATUS.CURRENT ||
                          stage.status === STAGE_STATUS.AT_RISK ||
                          stage.status === STAGE_STATUS.DELAYED) && (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        )}
                        {stage.slaDays > 0 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            SLA: {stage.slaDays}d
                          </span>
                        )}
                        {stage.daysRemaining !== null && stage.daysRemaining !== undefined && stage.status !== STAGE_STATUS.COMPLETED && (
                          <span className={`text-[10px] font-mono font-semibold ${
                            stage.daysRemaining <= 7 ? 'text-red-600' : 'text-slate-500'
                          }`}>
                            {stage.daysRemaining}d left
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isSelected ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== STAGE DETAIL PANEL ===== */}
      {selectedStage && (
        <div className="px-4 sm:px-6 py-5 bg-white border-t border-slate-200 space-y-4">
          {/* Stage header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 tracking-wider">
                  Stage {String(selectedStage.id).padStart(2, '0')} of 08
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    STATUS_CONFIG[selectedStage.status].badge
                  }`}
                >
                  {STATUS_CONFIG[selectedStage.status].label}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
                {selectedStage.fullTitle}
                <span className="text-[11px] font-mono font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {selectedStage.statute}
                </span>
              </h3>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaItem
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Statutory SLA"
              value={`${selectedStage.slaDays} Days`}
            />
            {selectedStage.startDate && (
              <MetaItem
                icon={<Calendar className="w-3.5 h-3.5" />}
                label="Start Date"
                value={selectedStage.startDate}
              />
            )}
            {selectedStage.deadline && (
              <MetaItem
                icon={<Calendar className="w-3.5 h-3.5" />}
                label="Deadline"
                value={selectedStage.deadline}
                highlight={
                  selectedStage.daysRemaining !== null && selectedStage.daysRemaining <= 7
                }
              />
            )}
            {selectedStage.daysRemaining !== null &&
              selectedStage.status !== STAGE_STATUS.COMPLETED && (
                <MetaItem
                  icon={<Clock className="w-3.5 h-3.5" />}
                  label="Days Remaining"
                  value={`${selectedStage.daysRemaining} days`}
                  highlight={
                    selectedStage.daysRemaining <= 7
                  }
                />
              )}
          </div>

          {/* Three-column detail grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Description */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                Mandate Description
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedStage.description}
              </p>
            </div>

            {/* Authority & Owner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Competent Authority
              </span>
              <p className="text-xs font-semibold text-slate-800">
                {selectedStage.authority}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                <User className="w-3 h-3" />
                <span>Owner: {selectedStage.owner}</span>
              </div>
            </div>

            {/* Required Action */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                Required Action
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedStage.requiredAction}
              </p>
            </div>
          </div>

          {/* Mandatory documents */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-teal-600" />
              Mandatory Statutory Documents
            </span>
            <ul className="text-xs text-slate-700 space-y-1 grid grid-cols-1 sm:grid-cols-3 gap-1">
              {selectedStage.requiredDocs.map((doc, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-teal-500 mt-0.5">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

/** Small metadata item used in the detail panel */
function MetaItem({ icon, label, value, highlight = false }) {
  return (
    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-semibold text-slate-400">
        {icon}
        {label}
      </div>
      <div
        className={`text-xs font-bold mt-0.5 ${
          highlight ? 'text-red-600' : 'text-slate-800'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default WorkflowTracker;
