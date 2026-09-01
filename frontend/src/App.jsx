import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/layout/TopBar';
import { LevelNav } from './components/navigation/LevelNav';
import { WorkflowEngine } from './components/workflow/WorkflowEngine';
import { LoginModal } from './components/auth/LoginModal';
import ParcelMap from './components/map/ParcelMap';
import BottleneckAlerts from './components/alerts/BottleneckAlerts';
import ParcelSummary from './components/common/ParcelSummary';
import { DEMO_PROJECTS, OFFICER_REGISTRY } from './data/mockData';
import { fetchParcelsGeoJSON } from './lib/api';
import { ShieldCheck, MapPin, FolderOpen, Activity, Map } from 'lucide-react';

/**
 * BHU-DRISHTI — Application Shell
 *
 * Layout:
 *   Desktop:  TopBar → LevelNav → Header → Map (full) → Alerts+Summary → Workflow
 *   Mobile:   TopBar → LevelNav → Header → Map → Summary → Alerts → Workflow
 */
export function App() {
  // ── Auth & Navigation ──
  const [currentUser, setCurrentUser] = useState(OFFICER_REGISTRY[1]);
  const [currentJurisdiction, setCurrentJurisdiction] = useState({
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    district: 'Sitapur',
  });
  const [activeLevel, setActiveLevel] = useState('national');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ── Project & Workflow ──
  const [selectedProject, setSelectedProject] = useState(DEMO_PROJECTS[0]);
  const [activeStageId, setActiveStageId] = useState(DEMO_PROJECTS[0].currentStageId);

  // ── Parcel State (shared across Map, Alerts, Summary) ──
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [parcels, setParcels] = useState(null);
  const [parcelsLoading, setParcelsLoading] = useState(true);
  const [parcelsError, setParcelsError] = useState(null);

  const handleStageSelect = useCallback((stageId) => {
    setActiveStageId(stageId);
  }, []);

  // ── Fetch parcels when project or jurisdiction changes ──
  const loadParcels = useCallback(async () => {
    setParcelsLoading(true);
    setParcelsError(null);
    setSelectedParcel(null);
    try {
      const geojson = await fetchParcelsGeoJSON({
        projectCode: selectedProject?.code,
        district: currentJurisdiction?.district,
      });
      if (geojson && Array.isArray(geojson.features)) {
        setParcels(geojson);
      } else {
        setParcels({ type: 'FeatureCollection', features: [] });
      }
    } catch {
      console.warn('[App] Failed to load parcels');
      setParcelsError('Unable to load parcel data. Showing demo data.');
      try {
        const fallback = await fetchParcelsGeoJSON();
        setParcels(fallback);
      } catch {
        setParcels({ type: 'FeatureCollection', features: [] });
      }
    } finally {
      setParcelsLoading(false);
    }
  }, [selectedProject?.code, currentJurisdiction?.district]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gov-text overflow-x-hidden">

      {/* ═══════ TOP BAR ═══════ */}
      <TopBar
        currentUser={currentUser}
        currentJurisdiction={currentJurisdiction}
        onJurisdictionChange={setCurrentJurisdiction}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* ═══════ LEVEL NAV ═══════ */}
      <LevelNav
        activeLevel={activeLevel}
        onLevelChange={setActiveLevel}
        breadcrumbs={[
          currentJurisdiction.stateCode !== 'ALL' && {
            label: currentJurisdiction.stateName,
          },
          currentJurisdiction.stateCode !== 'ALL' && {
            label: currentJurisdiction.district,
          },
          selectedProject && { label: selectedProject.code },
          selectedProject && { label: 'ULPIN-2026-UP0417-001' },
        ].filter(Boolean)}
      />

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header ── */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
            Land Acquisition Control Tower
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Monitor statutory workflow, identify emerging delays, and coordinate
            timely intervention.
          </p>
        </div>

        {/* ── Project Context (compact banner) ── */}
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded shrink-0">
              {selectedProject.code}
            </span>
            <span className="text-slate-500 truncate hidden sm:inline">{selectedProject.title}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>{currentJurisdiction.stateName}</span>
            <span>›</span>
            <span>{currentJurisdiction.district}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded ml-auto">
            <Activity className="w-3 h-3" />
            Active
          </span>
        </div>

        {/* ═══════ GIS PARCEL MAP ═══════ */}
        <section aria-label="Parcel map">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
              <Map className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                GIS Parcel Map
              </span>
            </div>
            <div className="p-0">
              <ParcelMap
                parcels={parcels}
                selectedParcel={selectedParcel}
                onParcelSelect={setSelectedParcel}
                loading={parcelsLoading}
                error={parcelsError}
              />
            </div>
          </div>
        </section>

        {/* ═══════ ALERTS + PARCEL SUMMARY ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bottleneck Alerts */}
          <section aria-label="Bottleneck alerts">
            <BottleneckAlerts
              projectCode={selectedProject?.code}
              onParcelSelect={setSelectedParcel}
            />
          </section>

          {/* Selected Parcel Summary */}
          <section aria-label="Selected parcel summary">
            <ParcelSummary selectedParcel={selectedParcel} />
          </section>
        </div>

        {/* ═══════ WORKFLOW ENGINE ═══════ */}
        <section aria-label="Statutory workflow engine">
          <WorkflowEngine
            selectedProject={selectedProject}
            currentStage={activeStageId}
            onStageSelect={handleStageSelect}
            currentUser={currentUser}
          />
        </section>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-5 sm:py-6 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <div className="space-y-1 min-w-0">
            <div className="font-bold text-white uppercase tracking-wider font-mono text-[11px] sm:text-xs truncate">
              BHU-DRISHTI — SIH 2026 PS 26016
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">
              Dept. of Land Resources (DoLR), Ministry of Rural Development,
              Govt. of India.
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-mono flex-wrap">
            <span className="flex items-center gap-1 text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              RFCTLARR Compliant
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* ═══════ LOGIN MODAL ═══════ */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(officer) => {
          setCurrentUser(officer);
          if (officer.state !== 'ALL') {
            setCurrentJurisdiction({
              stateCode:
                officer.state === 'Uttar Pradesh'
                  ? 'UP'
                  : officer.state === 'Maharashtra'
                    ? 'MH'
                    : 'ALL',
              stateName: officer.state,
              district: officer.district,
            });
          }
        }}
      />
    </div>
  );
}

export default App;
