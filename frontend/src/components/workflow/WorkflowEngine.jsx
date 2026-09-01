/**
 * WorkflowEngine — Interactive RFCTLARR Workflow Stage Transitions
 *
 * Wraps WorkflowTracker with:
 *  - Role-based transition authorization
 *  - Confirmation dialog before transitions
 *  - SLA countdown display
 *  - Audit trail of completed transitions
 *  - Backend integration via transitionWorkflow() from api.js
 *  - Error handling with rollback
 *
 * @module components/workflow/WorkflowEngine
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  History,
} from 'lucide-react';
import {
  RFCTLARR_STAGES,
  STAGE_STATUS,
  STATUS_CONFIG,
  computeStageStatuses,
  computeStageSummary,
} from '../../data/workflowData';
import { transitionWorkflow, fetchWorkflowHistory } from '../../lib/api';
import { WorkflowTracker } from './WorkflowTracker';
import { OFFICER_REGISTRY } from '../../data/mockData';

// ═══════════════════════════════════════════════════════════════════════
// AUTHORIZATION LAYER (Demo frontend-only — NOT backend-enforced)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Role → allowed stage transitions mapping.
 * Central can do everything. Other roles have restrictions.
 */
const ROLE_TRANSITIONS = {
  CENTRAL: RFCTLARR_STAGES.map((s) => s.code), // can transition all stages
  STATE: ['SEC_11_NOTIF', 'SEC_19_DECLARATION', 'SEC_23_AWARD'],
  DISTRICT: ['SEC_15_OBJECTION', 'SEC_19_DECLARATION', 'SEC_23_AWARD', 'SEC_38_POSSESSION', 'RR_PROGRESS'],
  PROJECT: ['SEC_15_OBJECTION', 'SEC_23_AWARD', 'SEC_38_POSSESSION'],
  FIELD_OFFICER: ['SIA_STUDY', 'SEC_15_OBJECTION', 'SEC_38_POSSESSION'],
};

/**
 * Check if a role can transition to a specific stage.
 */
function canTransition(role, stageCode) {
  if (!role || !stageCode) return false;
  const allowed = ROLE_TRANSITIONS[role];
  if (!allowed) return false;
  return allowed.includes(stageCode);
}

/**
 * Get next valid stage from current.
 * Returns null if already at final stage.
 */
function getNextStage(currentStageId) {
  if (!currentStageId || currentStageId >= 8) return null;
  return RFCTLARR_STAGES.find((s) => s.id === currentStageId + 1);
}

/**
 * Compute SLA countdown text from deadline.
 */
function computeSlaCountdown(stage) {
  if (!stage || stage.status === STAGE_STATUS.COMPLETED) {
    return { text: 'Completed', urgency: 'none', daysRemaining: null };
  }
  if (!stage.deadline) {
    return { text: `SLA: ${stage.slaDays} days`, urgency: 'none', daysRemaining: null };
  }

  const now = new Date();
  const deadline = new Date(stage.deadline);
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `SLA breached by ${Math.abs(diffDays)} days`,
      urgency: 'critical',
      daysRemaining: diffDays,
    };
  }
  if (diffDays === 0) {
    return { text: 'Due today', urgency: 'warning', daysRemaining: 0 };
  }
  if (diffDays <= 7) {
    return { text: `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`, urgency: 'warning', daysRemaining: diffDays };
  }
  if (diffDays <= 14) {
    return { text: `${diffDays} days remaining`, urgency: 'caution', daysRemaining: diffDays };
  }
  return { text: `${diffDays} days remaining`, urgency: 'safe', daysRemaining: diffDays };
}

// ═══════════════════════════════════════════════════════════════════════
// CONFIRMATION DIALOG
// ═══════════════════════════════════════════════════════════════════════

function TransitionConfirmDialog({
  isOpen,
  currentStage,
  nextStage,
  officer,
  onConfirm,
  onCancel,
  isPending,
}) {
  if (!isOpen || !currentStage || !nextStage) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transition-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={isPending ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2 id="transition-dialog-title" className="text-base font-bold text-slate-900">
              Confirm Workflow Transition
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Current → Next */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Current Stage</span>
              <span className="text-sm font-bold text-slate-800">{currentStage.title}</span>
              <span className="text-[10px] font-mono text-slate-400 block">{currentStage.statute}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-teal-500 shrink-0 self-center rotate-90 sm:rotate-0" />
            <div className="flex-1 p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <span className="text-[10px] font-mono uppercase text-teal-400 block mb-0.5">Next Stage</span>
              <span className="text-sm font-bold text-teal-800">{nextStage.title}</span>
              <span className="text-[10px] font-mono text-teal-500 block">{nextStage.statute}</span>
            </div>
          </div>

          {/* Officer info */}
          {officer && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <User className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-blue-800 block truncate">{officer.fullName}</span>
                <span className="text-[10px] text-blue-500">{officer.designation} · {officer.role}</span>
              </div>
            </div>
          )}

          {/* SLA info */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Statutory SLA: {nextStage.slaDays} days</span>
            </div>
            <p className="text-[11px] text-amber-600 mt-1">
              This action is irreversible and will be logged in the audit trail.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-3 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm Transition
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSITION ERROR TOAST
// ═══════════════════════════════════════════════════════════════════════

function TransitionError({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="mx-3 sm:mx-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 sm:gap-3" role="alert">
      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-800">Workflow transition failed.</p>
        <p className="text-xs text-red-600 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1.5 rounded hover:bg-red-100 min-w-[32px] min-h-[32px] flex items-center justify-center"
        aria-label="Dismiss error"
      >
        <XCircle className="w-4 h-4 text-red-400" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// AUDIT TRAIL
// ═══════════════════════════════════════════════════════════════════════

function AuditTrail({ entries, isExpanded, onToggle }) {
  return (
    <div className="border-t border-slate-200">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 sm:px-6 py-3 flex items-center gap-2 hover:bg-slate-50 transition-colors min-h-[44px]"
        aria-expanded={isExpanded}
      >
        <History className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Audit Trail
        </span>
        {entries.length > 0 && (
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
            {entries.length}
          </span>
        )}
        <span className="ml-auto text-slate-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 space-y-2 max-h-[300px] overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No transitions recorded yet.</p>
          ) : (
            entries.slice().reverse().map((entry, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-teal-700">
                    {entry.fromStage} → {entry.toStage}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    {new Date(entry.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="font-semibold">{entry.officer}</span>
                  {entry.remarks && (
                    <>
                      <span className="text-slate-400">—</span>
                      <span className="text-slate-500 italic">{entry.remarks}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLA COUNTDOWN DISPLAY
// ═══════════════════════════════════════════════════════════════════════

function SlaCountdownBadge({ countdown }) {
  if (!countdown || countdown.urgency === 'none') return null;

  const styles = {
    critical: 'bg-red-50 border-red-300 text-red-700',
    warning: 'bg-amber-50 border-amber-300 text-amber-700',
    caution: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    safe: 'bg-teal-50 border-teal-200 text-teal-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border ${styles[countdown.urgency]}`}
      role="status"
      aria-label={countdown.text}
    >
      <Clock className="w-3 h-3" />
      <span className="hidden sm:inline">{countdown.text}</span>
      <span className="sm:hidden">{countdown.text.length > 15 ? countdown.text.slice(0, 15) + '…' : countdown.text}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TRANSITION ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════

function TransitionButton({ currentStage, nextStage, canUserTransition, onClick }) {
  if (!currentStage || !nextStage) {
    if (currentStage?.status === STAGE_STATUS.COMPLETED || currentStage?.id === 8) {
      return (
        <div className="flex items-center gap-2 px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-teal-600" />
          <div>
            <span className="text-sm font-bold text-teal-800">Workflow Complete</span>
            <p className="text-xs text-teal-600">All 8 statutory stages have been completed.</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-2">
      {!canUserTransition && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            Your role does not have permission to advance to <strong>{nextStage.title}</strong>.
            Required: authorized officer for this stage.
          </span>
        </div>
      )}
      <button
        onClick={onClick}
        disabled={!canUserTransition}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors min-h-[48px] ${
          canUserTransition
            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
        }`}
        aria-label={canUserTransition ? `Advance to ${nextStage.title}` : 'Transition not permitted for your role'}
      >
        <ArrowRight className="w-4 h-4" />
        Advance to {nextStage.title}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN WORKFLOW ENGINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export function WorkflowEngine({
  selectedProject,
  currentStage: currentStageProp,
  onStageSelect,
  currentUser,
}) {
  // ── State ──
  const [stages, setStages] = useState(() => computeStageStatuses(selectedProject));
  const [auditTrail, setAuditTrail] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState(null);
  const [auditExpanded, setAuditExpanded] = useState(false);

  // ── Recompute stages when project changes ──
  useEffect(() => {
    setStages(computeStageStatuses(selectedProject));
  }, [selectedProject]);

  // ── Load audit history from backend ──
  useEffect(() => {
    if (!selectedProject?.code) return;
    let cancelled = false;
    async function load() {
      const history = await fetchWorkflowHistory(selectedProject.code);
      if (!cancelled && Array.isArray(history)) {
        setAuditTrail(history.map((h) => ({
          fromStage: RFCTLARR_STAGES.find((s) => s.id === h.stage)?.title || `Stage ${h.stage}`,
          toStage: h.status === 'COMPLETED' ? 'Completed' : 'In Progress',
          officer: h.actor,
          timestamp: h.date,
          remarks: h.remarks,
        })));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedProject?.code]);

  // ── Derived state ──
  const summary = computeStageSummary(stages);
  const activeStage = stages.find(
    (s) => s.id === (currentStageProp || summary.currentStageId)
  );
  const nextStage = getNextStage(activeStage?.id);

  // ── Authorization ──
  const userRole = currentUser?.role || 'FIELD_OFFICER';
  const isAllowed = nextStage ? canTransition(userRole, nextStage.code) : false;

  // ── SLA countdown for active stage ──
  const countdown = useMemo(() => computeSlaCountdown(activeStage), [activeStage]);

  // ── Selected officer for confirmation ──
  const officer = useMemo(() => {
    return OFFICER_REGISTRY.find((o) => o.role === userRole) || OFFICER_REGISTRY[0];
  }, [userRole]);

  // ── Handlers ──
  const handleAdvanceClick = useCallback(() => {
    setError(null);
    setConfirmOpen(true);
  }, []);

  const handleConfirmTransition = useCallback(async () => {
    if (!nextStage || !selectedProject?.code) return;

    setIsTransitioning(true);
    setError(null);

    try {
      const result = await transitionWorkflow(
        selectedProject.code,
        nextStage.id,
        `Advancing from ${activeStage?.title} to ${nextStage.title}`,
        officer.officerId || officer.bhoomiId || 'DEMO-OFFICER'
      );

      if (result && (result.success || result.status === 'SUCCESS' || result.transition)) {
        // Update local state only after backend confirmation
        setStages((prev) => computeStageStatuses({
          ...selectedProject,
          currentStageId: nextStage.id,
          daysInCurrentStage: 0,
          delayedByDays: 0,
        }));

        // Add to audit trail
        setAuditTrail((prev) => [
          ...prev,
          {
            fromStage: activeStage?.title || `Stage ${activeStage?.id}`,
            toStage: nextStage.title,
            officer: officer.fullName,
            timestamp: new Date().toISOString(),
            remarks: `Advanced to Stage ${nextStage.id} — ${nextStage.title}`,
          },
        ]);

        setConfirmOpen(false);
        onStageSelect?.(nextStage.id);
      } else {
        setError('Workflow transition failed. The backend did not confirm the transition.');
      }
    } catch (err) {
      console.error('[WorkflowEngine] Transition failed');
      // Only show safe error message to user — full error may contain sensitive details
      const safeMessage = err.name === 'AbortError'
        ? 'Request timed out.'
        : 'Workflow transition failed. Please try again.';
      setError(safeMessage);
    } finally {
      setIsTransitioning(false);
    }
  }, [nextStage, selectedProject, activeStage, officer, onStageSelect]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-3 py-3 sm:px-6 flex flex-wrap items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gov-primary shrink-0" />
          <h2 className="text-[11px] sm:text-base font-bold tracking-wide uppercase truncate">
            RFCTLARR Workflow Engine
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          <SlaCountdownBadge countdown={countdown} />
          <span className="text-[9px] sm:text-[11px] font-mono bg-slate-800 text-teal-300 border border-slate-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shrink-0">
            Stage {summary.currentStageId || '—'}: {summary.currentStageName}
          </span>
        </div>
      </div>

      {/* Progress summary */}
      <div className="px-3 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-slate-700" role="status" aria-label={`${summary.completed} of ${summary.total} stages completed`}>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: summary.total }).map((_, i) => (
              <div
                key={i}
                className={`w-4 sm:w-5 h-1.5 rounded-full transition-colors ${
                  i < summary.completed ? 'bg-gov-primary' : i === summary.completed ? 'bg-amber-400' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="font-mono font-semibold whitespace-nowrap">{summary.completed} of {summary.total}</span>
          <span className="text-slate-500 whitespace-nowrap">stages completed</span>
        </div>
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
          {/* Role badge */}
          <span className="flex items-center gap-1 text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
            <User className="w-3 h-3" />
            {userRole}
          </span>
        </div>
      </div>

      {/* Error toast */}
      <TransitionError message={error} onDismiss={() => setError(null)} />

      {/* Visual timeline — delegates to WorkflowTracker */}
      <WorkflowTracker
        stages={stages}
        currentStage={currentStageProp || summary.currentStageId}
        onStageSelect={onStageSelect}
        selectedProject={selectedProject}
      />

      {/* Transition action area */}
      <div className="px-3 sm:px-6 py-4 border-t border-slate-200 space-y-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">
            Authorized officers can advance the workflow to the next statutory stage.
            All transitions require confirmation and are recorded in the audit trail.
          </p>
        </div>
        <TransitionButton
          currentStage={activeStage}
          nextStage={nextStage}
          canUserTransition={isAllowed}
          onClick={handleAdvanceClick}
        />
      </div>

      {/* Audit trail */}
      <AuditTrail entries={auditTrail} isExpanded={auditExpanded} onToggle={() => setAuditExpanded(!auditExpanded)} />

      {/* Confirmation dialog */}
      <TransitionConfirmDialog
        isOpen={confirmOpen}
        currentStage={activeStage}
        nextStage={nextStage}
        officer={officer}
        onConfirm={handleConfirmTransition}
        onCancel={() => { setConfirmOpen(false); setError(null); }}
        isPending={isTransitioning}
      />
    </div>
  );
}

export default WorkflowEngine;
