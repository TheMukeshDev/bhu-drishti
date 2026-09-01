/**
 * BHU-DRISHTI Mock Parcel GeoJSON Data
 * Georeferenced cadastral parcels for Kanpur-Lucknow Expressway (Phase 2)
 * SRID: 4326 (WGS 84) — compatible with PostGIS geometry output
 *
 * The backend (FastAPI + PostGIS) will serve real GeoJSON via:
 *   GET /api/v1/parcels/geojson?project_code=PRJ-2026-UP0417
 *
 * This file provides dev/demo data with the same FeatureCollection shape.
 */

export const MOCK_PARCEL_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'parcel-001',
        ulpin: 'UP26016SIT1001',
        khasra_no: 'KH-104/A',
        village: 'Maholi',
        taluka: 'Maholi Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 12450,
        status: 'HIGH_RISK',
        compensation_progress_pct: 35,
        possession_status: 'Pending',
        rr_status: 'Not Started',
        risk_level: 'High',
        risk_score: 87,
        main_bottleneck: 'Ancestral title dispute — 3 claimants',
        pending_with_role: 'DISTRICT',
        stage: 'Stage 3 of 8 — Objections',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.8940, 27.5620],
            [80.8965, 27.5620],
            [80.8965, 27.5638],
            [80.8940, 27.5638],
            [80.8940, 27.5620],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'parcel-002',
        ulpin: 'UP26016SIT1002',
        khasra_no: 'KH-105/B',
        village: 'Maholi',
        taluka: 'Maholi Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 8920,
        status: 'COMP_PENDING',
        compensation_progress_pct: 62,
        possession_status: 'Pending',
        rr_status: 'Not Started',
        risk_level: 'Medium',
        risk_score: 54,
        main_bottleneck: 'Solatium calculation pending',
        pending_with_role: 'FIELD_OFFICER',
        stage: 'Stage 5 of 8 — Award & Solatium',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.8970, 27.5625],
            [80.8992, 27.5625],
            [80.8992, 27.5642],
            [80.8970, 27.5642],
            [80.8970, 27.5625],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'parcel-003',
        ulpin: 'UP26016SIT1003',
        khasra_no: 'KH-201',
        village: 'Biswan',
        taluka: 'Biswan Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 15200,
        status: 'ACQUIRED',
        compensation_progress_pct: 100,
        possession_status: 'Completed',
        rr_status: 'Completed',
        risk_level: 'Low',
        risk_score: 8,
        main_bottleneck: 'None',
        pending_with_role: null,
        stage: 'Stage 8 of 8 — Completed',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.9010, 27.5580],
            [80.9040, 27.5580],
            [80.9040, 27.5605],
            [80.9010, 27.5605],
            [80.9010, 27.5580],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'parcel-004',
        ulpin: 'UP26016SIT1004',
        khasra_no: 'KH-307/C',
        village: 'Laharpur',
        taluka: 'Laharpur Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 6780,
        status: 'UNDER_PROCESS',
        compensation_progress_pct: 0,
        possession_status: 'Pending',
        rr_status: 'Not Started',
        risk_level: 'Medium',
        risk_score: 41,
        main_bottleneck: 'SIA study pending',
        pending_with_role: 'FIELD_OFFICER',
        stage: 'Stage 1 of 8 — SIA Study',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.8880, 27.5650],
            [80.8905, 27.5650],
            [80.8905, 27.5672],
            [80.8880, 27.5672],
            [80.8880, 27.5650],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'parcel-005',
        ulpin: 'UP26016SIT1005',
        khasra_no: 'KH-412',
        village: 'Maholi',
        taluka: 'Maholi Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 9840,
        status: 'POSSESSION_PENDING',
        compensation_progress_pct: 88,
        possession_status: 'Pending',
        rr_status: 'In Progress',
        risk_level: 'Low',
        risk_score: 15,
        main_bottleneck: 'Possession memo pending',
        pending_with_role: 'DISTRICT',
        stage: 'Stage 6 of 8 — Possession',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.8950, 27.5600],
            [80.8975, 27.5600],
            [80.8975, 27.5618],
            [80.8950, 27.5618],
            [80.8950, 27.5600],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'parcel-006',
        ulpin: 'UP26016SIT1006',
        khasra_no: 'KH-518/D',
        village: 'Biswan',
        taluka: 'Biswan Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 11200,
        status: 'HIGH_RISK',
        compensation_progress_pct: 20,
        possession_status: 'Pending',
        rr_status: 'Not Started',
        risk_level: 'High',
        risk_score: 91,
        main_bottleneck: 'Gram Sabha consent documentation incomplete',
        pending_with_role: 'CENTRAL',
        stage: 'Stage 4 of 8 — Declaration',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.9050, 27.5590],
            [80.9080, 27.5590],
            [80.9080, 27.5615],
            [80.9050, 27.5615],
            [80.9050, 27.5590],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'parcel-007',
        ulpin: 'UP26016SIT1007',
        khasra_no: 'KH-603',
        village: 'Laharpur',
        taluka: 'Laharpur Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 7350,
        status: 'RR_PENDING',
        compensation_progress_pct: 75,
        possession_status: 'Completed',
        rr_status: 'Pending',
        risk_level: 'Low',
        risk_score: 22,
        main_bottleneck: 'R&R allotment pending',
        pending_with_role: 'FIELD_OFFICER',
        stage: 'Stage 7 of 8 — R&R Progress',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.8890, 27.5630],
            [80.8915, 27.5630],
            [80.8915, 27.5655],
            [80.8890, 27.5655],
            [80.8890, 27.5630],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'parcel-008',
        ulpin: 'UP26016SIT1008',
        khasra_no: 'KH-722/A',
        village: 'Maholi',
        taluka: 'Maholi Tehsil',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        area_sq_meters: 5600,
        status: 'ACQUIRED',
        compensation_progress_pct: 100,
        possession_status: 'Completed',
        rr_status: 'Completed',
        risk_level: 'Low',
        risk_score: 3,
        main_bottleneck: 'None',
        pending_with_role: null,
        stage: 'Stage 8 of 8 — Completed',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.8930, 27.5640],
            [80.8955, 27.5640],
            [80.8955, 27.5658],
            [80.8930, 27.5658],
            [80.8930, 27.5640],
          ],
        ],
      },
    },
  ],
};

/** Status color mapping for map rendering */
export const PARCEL_STATUS_COLORS = {
  ACQUIRED: '#0D9488',           // Teal — completed
  UNDER_PROCESS: '#2563EB',     // Blue — in progress
  COMP_PENDING: '#D97706',      // Amber — compensation pending
  POSSESSION_PENDING: '#9333EA', // Purple — possession pending
  RR_PENDING: '#2563EB',        // Blue — R&R in progress
  HIGH_RISK: '#DC2626',         // Red — high risk / bottleneck
};

/** Map center for Sitapur, UP region */
export const DEFAULT_MAP_CENTER = [27.5630, 80.8960];
export const DEFAULT_MAP_ZOOM = 14;
