/**
 * BHU-DRISHTI Workflow Data
 * RFCTLARR Act 2013 — 8-Stage Statutory Land Acquisition Lifecycle
 *
 * Separated from component for reusability and testability.
 */

/** Status constants for workflow stages */
export const STAGE_STATUS = {
  COMPLETED: 'COMPLETED',
  CURRENT: 'CURRENT',
  UPCOMING: 'UPCOMING',
  AT_RISK: 'AT_RISK',
  DELAYED: 'DELAYED',
};

/** Status display configuration */
export const STATUS_CONFIG = {
  [STAGE_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    iconBg: 'bg-gov-primary text-white',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  [STAGE_STATUS.CURRENT]: {
    label: 'Current Stage',
    color: 'text-teal-800',
    bg: 'bg-teal-50',
    border: 'border-gov-primary',
    iconBg: 'bg-gov-primary text-white ring-4 ring-gov-primary/20',
    badge: 'bg-gov-primary text-white border-gov-primary',
  },
  [STAGE_STATUS.UPCOMING]: {
    label: 'Upcoming',
    color: 'text-slate-500',
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-slate-100 text-slate-500 border border-slate-200',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  [STAGE_STATUS.AT_RISK]: {
    label: 'At Risk',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    iconBg: 'bg-amber-500 text-white ring-4 ring-amber-300/30',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  [STAGE_STATUS.DELAYED]: {
    label: 'Delayed',
    color: 'text-red-800',
    bg: 'bg-red-50',
    border: 'border-red-400',
    iconBg: 'bg-red-600 text-white ring-4 ring-red-300/30',
    badge: 'bg-red-100 text-red-800 border-red-300',
  },
};

/** The 8 canonical RFCTLARR statutory stages */
export const RFCTLARR_STAGES = [
  {
    id: 1,
    code: 'SIA_STUDY',
    title: 'SIA Study',
    shortTitle: 'SIA Study',
    statute: 'Sec 4-9',
    fullTitle: 'Social Impact Assessment Study',
    description:
      'Public consultation, SIMP preparation, and Expert Group evaluation under Section 4 to 9.',
    slaDays: 60,
    requiredDocs: [
      'Form A - Notification',
      'SIMP Report',
      'Expert Group Consent Form',
    ],
    authority: 'State SIA Unit / Collector',
    owner: 'SIA Expert Group',
    requiredAction: 'Complete social impact assessment and submit report to Appropriate Government.',
  },
  {
    id: 2,
    code: 'SEC_11_NOTIF',
    title: 'Prelim Notice',
    shortTitle: 'Prelim Notice',
    statute: 'Sec 11',
    fullTitle: 'Preliminary Notification',
    description:
      'Publication of preliminary notification in Official Gazette and two local newspapers.',
    slaDays: 30,
    requiredDocs: [
      'Gazette Notification Copy',
      'Newspaper Publication Proof',
      'Gram Sabha Notice',
    ],
    authority: 'Appropriate Government (DoLR / State)',
    owner: 'State Revenue Department',
    requiredAction: 'Publish preliminary notification and serve copies to affected families.',
  },
  {
    id: 3,
    code: 'SEC_15_OBJECTION',
    title: 'Objections',
    shortTitle: 'Objections',
    statute: 'Sec 15',
    fullTitle: 'Hearing of Objections',
    description:
      '60-day statutory window for land owners to submit objections regarding land suitability.',
    slaDays: 60,
    requiredDocs: [
      'Objection Registry Log',
      'Hearing Minutes',
      'Collector Recommendation Report',
    ],
    authority: 'District Collector / SLAO',
    owner: 'District Collector',
    requiredAction: 'Conduct hearings for all filed objections and submit recommendation report.',
  },
  {
    id: 4,
    code: 'SEC_19_DECLARATION',
    title: 'Declaration',
    shortTitle: 'Declaration',
    statute: 'Sec 19',
    fullTitle: 'Publication of Declaration & R&R Summary',
    description:
      'Final declaration of land requirement along with Summary of R&R Scheme under Section 19.',
    slaDays: 365,
    requiredDocs: [
      'Sec 19 Declaration Order',
      'R&R Scheme Summary',
      'Final Cadastral Boundary Plan',
    ],
    authority: 'Secretary (Revenue / Land Acquisition)',
    owner: 'Secretary, Land Acquisition',
    requiredAction: 'Issue final declaration and publish R&R scheme summary.',
  },
  {
    id: 5,
    code: 'SEC_23_AWARD',
    title: 'Award & Solatium',
    shortTitle: 'Award',
    statute: 'Sec 23',
    fullTitle: 'Compensation Award & 100% Solatium Determination',
    description:
      'Determination of market value, 100% solatium, and 12% per annum interest award.',
    slaDays: 90,
    requiredDocs: [
      'Form 11 - Land Award Statement',
      'Valuation Report',
      'Direct Bank Transfer Ledger',
    ],
    authority: 'Land Acquisition Collector',
    owner: 'Land Acquisition Collector',
    requiredAction: 'Determine compensation, solatium, and interest; pass final award.',
  },
  {
    id: 6,
    code: 'SEC_38_POSSESSION',
    title: 'Possession',
    shortTitle: 'Possession',
    statute: 'Sec 38',
    fullTitle: 'Taking Possession of Acquired Land',
    description:
      'Execution of possession memo after full payment of compensation and R&R entitlements.',
    slaDays: 30,
    requiredDocs: [
      'Possession Certificate (Form 16)',
      'Full Compensation Receipt',
      'Spot Verification Video',
    ],
    authority: 'Tehsildar / District Collector',
    owner: 'Tehsildar',
    requiredAction: 'Execute possession memo after confirming full compensation payment.',
  },
  {
    id: 7,
    code: 'RR_PROGRESS',
    title: 'R&R Progress',
    shortTitle: 'R&R',
    statute: 'Schedule II',
    fullTitle: 'Rehabilitation & Resettlement Scheme Execution',
    description:
      'Distribution of infrastructural units, employment grants, and monetary R&R awards.',
    slaDays: 180,
    requiredDocs: [
      'Resettlement Allotment Letter',
      'Annuity Payment Passbook',
      'Infrastructure Completion Memo',
    ],
    authority: 'Administrator for R&R',
    owner: 'R&R Administrator',
    requiredAction: 'Execute R&R scheme: distribute allotments, annuities, and infrastructure.',
  },
  {
    id: 8,
    code: 'COMPLETED',
    title: 'Completed',
    shortTitle: 'Completed',
    statute: 'Vested',
    fullTitle: 'Final Vesting & Mutation in Revenue Records',
    description:
      'Land fully encumbrance-free and mutated in favour of Requiring Body with ULPIN updated.',
    slaDays: 0,
    requiredDocs: [
      'Khatauni Mutation Copy',
      'ULPIN Certificate',
      'Handover Deed',
    ],
    authority: 'Settlement Officer / Land Records Dept',
    owner: 'Settlement Officer',
    requiredAction: 'Complete mutation and ULPIN update; hand over possession to requiring body.',
  },
];

/**
 * Compute stage statuses based on project progress.
 *
 * @param {object} project - The selected project object
 * @returns {Array} Stages with computed status, daysRemaining, etc.
 */
export function computeStageStatuses(project) {
  if (!project) {
    return RFCTLARR_STAGES.map((stage) => ({
      ...stage,
      status: STAGE_STATUS.UPCOMING,
      daysRemaining: stage.slaDays,
      startDate: null,
      deadline: null,
    }));
  }

  const currentId = project.currentStageId;
  const isDelayed = (project.delayedByDays || 0) > 0;

  return RFCTLARR_STAGES.map((stage) => {
    let status;
    if (stage.id < currentId) {
      status = STAGE_STATUS.COMPLETED;
    } else if (stage.id === currentId) {
      status = isDelayed ? STAGE_STATUS.AT_RISK : STAGE_STATUS.CURRENT;
    } else {
      status = STAGE_STATUS.UPCOMING;
    }

    // Compute days remaining for current stage
    let daysRemaining = null;
    if (stage.id === currentId) {
      daysRemaining = Math.max(0, stage.slaDays - (project.daysInCurrentStage || 0));
    } else if (stage.id < currentId) {
      daysRemaining = 0;
    } else {
      daysRemaining = stage.slaDays;
    }

    // Compute deadline approximation
    const today = new Date();
    let deadline = null;
    if (stage.id <= currentId && stage.slaDays > 0) {
      deadline = new Date(today);
      deadline.setDate(deadline.getDate() + daysRemaining);
    }

    // Compute start date approximation
    let startDate = null;
    if (stage.id <= currentId) {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - (project.daysInCurrentStage || 0));
      if (stage.id < currentId) {
        // Approximate: completed stages took their SLA days
        startDate.setDate(startDate.getDate() - stage.slaDays);
      }
    }

    return {
      ...stage,
      status,
      daysRemaining,
      startDate: startDate ? formatDate(startDate) : null,
      deadline: deadline ? formatDate(deadline) : null,
    };
  });
}

/**
 * Compute summary statistics from staged data.
 *
 * @param {Array} stages - Stages with computed statuses
 * @returns {{ completed: number, total: number, atRisk: number, delayed: number, currentStageName: string }}
 */
export function computeStageSummary(stages) {
  const completed = stages.filter((s) => s.status === STAGE_STATUS.COMPLETED).length;
  const atRisk = stages.filter((s) => s.status === STAGE_STATUS.AT_RISK).length;
  const delayed = stages.filter((s) => s.status === STAGE_STATUS.DELAYED).length;
  const current = stages.find(
    (s) =>
      s.status === STAGE_STATUS.CURRENT ||
      s.status === STAGE_STATUS.AT_RISK ||
      s.status === STAGE_STATUS.DELAYED
  );

  return {
    completed,
    total: stages.length,
    atRisk,
    delayed,
    currentStageName: current ? current.title : 'N/A',
    currentStageId: current ? current.id : null,
  };
}

/** Format date as DD Mon YYYY */
function formatDate(date) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default RFCTLARR_STAGES;
