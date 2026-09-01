/**
 * BHU-DRISHTI API Service Layer
 *
 * Provides typed accessors for FastAPI endpoints.
 * Falls back to mock data when the backend is unreachable,
 * so the UI works fully offline during demo.
 *
 * Environment variables (Vite):
 *   VITE_API_BASE_URL   — FastAPI base URL (e.g. http://localhost:8000/api/v1)
 *   VITE_SUPABASE_URL   — Supabase project URL (for direct client if needed)
 *   VITE_SUPABASE_ANON_KEY — Supabase anonymous key (frontend-safe only)
 */

// ── Configuration ────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const REQUEST_TIMEOUT_MS = 15000; // 15 seconds

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Get stored auth token (set after login).
 * Returns null if not authenticated.
 */
function getAuthToken() {
  try {
    return localStorage.getItem('bhu_drishti_token');
  } catch {
    return null;
  }
}

/**
 * Set/clear auth token after login/logout.
 */
export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem('bhu_drishti_token', token);
    else localStorage.removeItem('bhu_drishti_token');
  } catch { /* private browsing */ }
}

/**
 * Fetch wrapper with timeout, auth, and error handling.
 * Returns null when backend is unavailable → consumer falls back to mock data.
 */
async function apiFetch(path, options = {}) {
  if (!API_BASE) return null; // No backend configured → null = use mock

  const url = `${API_BASE}${path}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Discard error body — may contain sensitive server internals
      await res.text().catch(() => '');
      console.warn(`[API] ${path} → ${res.status}`);
      return null;
    }

    const data = await res.json();

    // Basic shape validation for GeoJSON
    if (path.includes('geojson') && data) {
      if (!data.type || !Array.isArray(data.features)) {
        console.warn(`[API] ${path} returned malformed GeoJSON — features array missing`);
        return null;
      }
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[API] ${path} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    } else {
      console.warn(`[API] ${path} failed:`, err.message);
    }
    return null;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Officer Verification ─────────────────────────────────────────────

const MOCK_OFFICERS = [
  { id: 1, name: 'Ananya Sharma', designation: 'IAS', role: 'CENTRAL', bhoomiId: 'AG-2026-001' },
  { id: 2, name: 'Deepak Verma', designation: 'IAS', role: 'STATE', bhoomiId: 'UP-2026-012' },
  { id: 3, name: 'Ritu Patel', designation: 'SDM', role: 'DISTRICT', bhoomiId: 'UP-2026-047' },
  { id: 4, name: 'Arun Singh', designation: 'Tehsildar', role: 'PROJECT', bhoomiId: 'UP-2026-103' },
  { id: 5, name: 'Sunita Devi', designation: 'Patwari', role: 'FIELD', bhoomiId: 'UP-2026-218' },
];

export async function verifyOfficer(officerId) {
  const data = await apiFetch(`/officers/verify/${officerId}`);
  if (data) return data;

  // Mock fallback
  await delay(300);
  return MOCK_OFFICERS.find((o) => o.bhoomiId === officerId) || null;
}

// ── Login ────────────────────────────────────────────────────────────

export async function login(email, password, role) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
  if (data) {
    // Persist token if returned
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  }

  // Mock fallback — always succeeds
  await delay(600);
  const officer = MOCK_OFFICERS.find(
    (o) => o.role === role || o.name.toLowerCase().includes(email.split('@')[0].split('.')[0])
  );
  const mockToken = `mock-token-${Date.now()}`;
  setAuthToken(mockToken);
  return {
    success: true,
    user: officer || {
      id: 99,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      designation: role === 'CENTRAL' ? 'IAS' : 'SDM',
      role,
      bhoomiId: `DEMO-${Date.now()}`,
    },
    access_token: mockToken,
    token_type: 'bearer',
  };
}

export function logout() {
  setAuthToken(null);
}

// ── Workflow Transitions ─────────────────────────────────────────────

const MOCK_WORKFLOW_HISTORY = [
  { stage: 1, status: 'COMPLETED', actor: 'Ritu Patel', date: '2026-06-15', remarks: 'SIA study initiated' },
  { stage: 2, status: 'COMPLETED', actor: 'Ritu Patel', date: '2026-07-21', remarks: 'Public hearing conducted' },
  { stage: 3, status: 'IN_PROGRESS', actor: 'Deepak Verma', date: '2026-07-28', remarks: 'Objections under review' },
];

export async function fetchWorkflowHistory(projectCode) {
  const data = await apiFetch(`/workflow/history/${projectCode}`);
  if (data) return data;

  await delay(200);
  return MOCK_WORKFLOW_HISTORY;
}

export async function transitionWorkflow(projectCode, targetStage, remarks, actorBhoomiId) {
  const data = await apiFetch('/workflow/transition', {
    method: 'POST',
    body: JSON.stringify({
      project_code: projectCode,
      target_stage: targetStage,
      remarks,
      actor_bhoomi_id: actorBhoomiId,
    }),
  });
  if (data) return data;

  // Mock transition
  await delay(500);
  return {
    success: true,
    transition: {
      from_stage: targetStage - 1,
      to_stage: targetStage,
      timestamp: new Date().toISOString(),
      actor: actorBhoomiId,
    },
    message: `Workflow transitioned to Stage ${targetStage}`,
  };
}

// ── Parcels GeoJSON ──────────────────────────────────────────────────

/**
 * Fetch parcels as GeoJSON FeatureCollection.
 *
 * Supports filtering by:
 *   - project_code (string)
 *   - status (parcel_status enum)
 *   - risk_level ('High', 'Medium', 'Low')
 *   - district (string)
 *   - state (string)
 *
 * Returns null on API error so the caller can fall back to mock data.
 */
export async function fetchParcelsGeoJSON({ projectCode, status, riskLevel, district, state } = {}) {
  const params = new URLSearchParams();
  if (projectCode) params.set('project_code', projectCode);
  if (status) params.set('status', status);
  if (riskLevel) params.set('risk_level', riskLevel);
  if (district) params.set('district', district);
  if (state) params.set('state', state);

  const qs = params.toString();
  const path = `/parcels/geojson${qs ? `?${qs}` : ''}`;

  const data = await apiFetch(path);
  if (data) return data;

  // Mock fallback — filter MOCK_PARCEL_GEOJSON client-side
  const { MOCK_PARCEL_GEOJSON } = await import('../data/parcelData.js');
  await delay(200);

  let features = MOCK_PARCEL_GEOJSON.features;
  if (status) features = features.filter((f) => f.properties.status === status);
  if (riskLevel) features = features.filter((f) => f.properties.risk_level === riskLevel);
  if (district) features = features.filter((f) => f.properties.district === district);
  if (state) features = features.filter((f) => f.properties.state === state);

  return { type: 'FeatureCollection', features };
}

/**
 * Convenience alias for components that want a simple "give me parcels" call.
 * Supports the same filter object as fetchParcelsGeoJSON.
 */
export async function getParcels(filters) {
  return fetchParcelsGeoJSON(filters);
}

// ── Risk Evaluation ──────────────────────────────────────────────────

export async function evaluateRisk(ulpin) {
  const data = await apiFetch(`/risk/evaluate/${ulpin}`);
  if (data) return data;

  await delay(400);
  return {
    ulpin,
    total_risk_score: `${Math.floor(Math.random() * 100)}%`,
    risk_band: 'Medium',
    factors: [
      { label: 'Encumbrance density', weight: 30, pct: `${Math.floor(Math.random() * 30)}%` },
      { label: 'Heritage proximity', weight: 15, pct: `${Math.floor(Math.random() * 15)}%` },
      { label: 'Forest clearance', weight: 20, pct: `${Math.floor(Math.random() * 20)}%` },
      { label: 'Acquisition difficulty', weight: 20, pct: `${Math.floor(Math.random() * 20)}%` },
      { label: 'Compensation gap', weight: 15, pct: `${Math.floor(Math.random() * 15)}%` },
    ],
    next_best_actions: [
      'Verify pending documents with District Authority',
      'Escalate compensation backlog to State Authority',
      'Schedule field inspection for possession readiness',
    ],
    evaluated_at: new Date().toISOString(),
  };
}

// ── Bottleneck Detection ─────────────────────────────────────────────

const MOCK_BOTTLENECKS = [
  {
    id: 'BOT-001',
    parcelId: 'parcel-001',
    type: 'SLA_BREACH',
    severity: 'CRITICAL',
    stage: 'Hearing of Objections',
    stageCode: 'SEC_15_OBJECTION',
    project: 'PRJ-2026-UP0417',
    projectName: 'Kanpur-Lucknow Greenfield Expressway',
    ulpin: 'UP26016SIT1001',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    description: 'Objection hearing exceeded 60-day statutory SLA — 3 contested ancestral titles unresolved',
    daysInStage: 78,
    statutoryThreshold: 60,
    daysOverdue: 18,
    riskScore: 87,
    owner: 'Deepak Verma, IAS',
    ownerRole: 'District Collector',
    action: 'Escalate pending hearings to State Revenue Board',
    detectedAt: '2026-08-19T10:00:00Z',
  },
  {
    id: 'BOT-002',
    parcelId: 'parcel-006',
    type: 'STAKEHOLDER',
    severity: 'CRITICAL',
    stage: 'Declaration',
    stageCode: 'SEC_19_DECLARATION',
    project: 'PRJ-2026-UP0417',
    projectName: 'Kanpur-Lucknow Greenfield Expressway',
    ulpin: 'UP26016SIT1006',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    description: 'Gram Sabha consent documentation incomplete — 2 of 3 required attestations missing',
    daysInStage: 14,
    statutoryThreshold: 30,
    daysOverdue: 0,
    riskScore: 91,
    owner: 'Ritu Patel, SDM',
    ownerRole: 'District Collector',
    action: 'Initiate Gram Sabha re-consultation under Sec 4(5)',
    detectedAt: '2026-08-28T09:15:00Z',
  },
  {
    id: 'BOT-003',
    parcelId: 'parcel-002',
    type: 'DOCUMENTATION',
    severity: 'HIGH',
    stage: 'Award & Solatium',
    stageCode: 'SEC_23_AWARD',
    project: 'PRJ-2026-UP0417',
    projectName: 'Kanpur-Lucknow Greenfield Expressway',
    ulpin: 'UP26016SIT1002',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    description: 'Solatium calculation pending for commercial structure valuation',
    daysInStage: 45,
    statutoryThreshold: 90,
    daysOverdue: 0,
    riskScore: 54,
    owner: 'Arun Singh',
    ownerRole: 'Tehsildar',
    action: 'Submit valuation report to Land Acquisition Collector',
    detectedAt: '2026-08-30T14:30:00Z',
  },
  {
    id: 'BOT-004',
    parcelId: 'parcel-005',
    type: 'ENCUMBRANCE',
    severity: 'MEDIUM',
    stage: 'Possession',
    stageCode: 'SEC_38_POSSESSION',
    project: 'PRJ-2026-UP0417',
    projectName: 'Kanpur-Lucknow Greenfield Expressway',
    ulpin: 'UP26016SIT1005',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    description: 'Possession memo pending — farmer awaiting final compensation disbursement confirmation',
    daysInStage: 22,
    statutoryThreshold: 30,
    daysOverdue: 0,
    riskScore: 15,
    owner: 'Sunita Devi',
    ownerRole: 'Field Officer',
    action: 'Verify compensation transfer and issue possession certificate',
    detectedAt: '2026-08-31T08:00:00Z',
  },
  {
    id: 'BOT-005',
    parcelId: 'parcel-007',
    type: 'DOCUMENTATION',
    severity: 'MEDIUM',
    stage: 'R&R Progress',
    stageCode: 'RR_PROGRESS',
    project: 'PRJ-2026-UP0417',
    projectName: 'Kanpur-Lucknow Greenfield Expressway',
    ulpin: 'UP26016SIT1007',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    description: 'R&R allotment pending — housing plot allocation awaiting State R&R Authority approval',
    daysInStage: 35,
    statutoryThreshold: 180,
    daysOverdue: 0,
    riskScore: 22,
    owner: 'Arun Singh',
    ownerRole: 'Tehsildar',
    action: 'Follow up with State R&R Authority for plot allocation approval',
    detectedAt: '2026-08-29T11:00:00Z',
  },
];

export async function fetchBottlenecks(projectCode) {
  const path = projectCode
    ? `/bottlenecks?project_code=${projectCode}`
    : '/bottlenecks';
  const data = await apiFetch(path);
  if (data) return data;

  await delay(250);
  if (projectCode) {
    return MOCK_BOTTLENECKS.filter((b) =>
      b.project.toLowerCase().includes(projectCode.toLowerCase())
    );
  }
  return MOCK_BOTTLENECKS;
}

// ── Jurisdiction / Geography ─────────────────────────────────────────

const MOCK_JURISDICTIONS = [
  { code: 'NATIONAL', name: 'National', level: 0 },
  { code: 'UP', name: 'Uttar Pradesh', level: 1, parent: 'NATIONAL' },
  { code: 'PRAYAGRAJ', name: 'Prayagraj', level: 2, parent: 'UP' },
  { code: 'SITAPUR', name: 'Sitapur', level: 2, parent: 'UP' },
];

export async function fetchJurisdictions(parentCode) {
  const data = await apiFetch(
    parentCode ? `/jurisdictions?parent=${parentCode}` : '/jurisdictions'
  );
  if (data) return data;

  await delay(150);
  if (parentCode) {
    return MOCK_JURISDICTIONS.filter((j) => j.parent === parentCode);
  }
  return MOCK_JURISDICTIONS;
}
