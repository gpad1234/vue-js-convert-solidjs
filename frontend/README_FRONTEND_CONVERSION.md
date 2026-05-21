Frontend - SolidJS (Vite)
==========================

Summary
-------
This `frontend/` folder is now a SolidJS + Vite application used with the existing Node backend in `../backend-node`.
The backend API contract was intentionally kept unchanged.

Frontend structure
------------------
```
frontend/
├── src/
│   ├── main.jsx                       # Solid app bootstrap
│   ├── App.jsx                        # Router setup
│   ├── lib/api.js                     # Axios client, URL builders, helpers
│   ├── styles/globals.css             # Tailwind base + app utility classes
│   ├── pages/
│   │   ├── Dashboard.jsx              # /
│   │   ├── Settings.jsx               # /settings
│   │   ├── __tests__/
│   │   │   └── Dashboard.integration.spec.jsx
│   │   └── patients/
│   │       ├── Index.jsx              # /patients
│   │       ├── PatientDetail.jsx      # /patients/:id
│   │       └── __tests__/
│   │           └── PatientDetail.integration.spec.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── NavBar.jsx
│   │   ├── StatCard.jsx
│   │   ├── PatientCard.jsx
│   │   ├── PatientDetailSkeleton.jsx
│   │   ├── GlucoseChart.jsx
│   │   ├── HbA1cBadge.jsx
│   │   ├── MedicationList.jsx
│   │   ├── AppointmentList.jsx
│   │   ├── LoadMoreButton.jsx
│   │   └── __tests__/
│   │       └── NavBar.spec.jsx
│   ├── test/
│   │   └── setup.js
│   └── lib/__tests__/
│       └── api.spec.js
├── index.html
├── vite.config.js
├── vitest.config.js
└── package.json
```

Dependencies
------------
- solid-js
- @solidjs/router
- axios
- chart.js + chartjs-plugin-annotation
- vitest + @solidjs/testing-library + jsdom

Development
-----------
1) Start backend (from repo root):

```bash
cd backend-node
npm install
npm start
```

2) Start frontend:

```bash
cd frontend
npm install
npm run dev
```

3) Open `http://localhost:3000`.

Configuration
-------------
- Set `VITE_API_URL` if backend is not on same origin.
- Example `.env` value: `VITE_API_URL=http://localhost:8000`

API endpoints used
------------------
- `GET /api/v1/stats/dashboard`
- `GET /api/v1/patients?...`
- `GET /api/v1/patients/{id}/summary`
- `GET /api/v1/patients/{id}/glucose`

Testing
-------
Run all frontend tests:

```bash
npm run test:unit:ci
```

Current test harness includes:
- Component behavior test for navigation event dispatch
- API helper unit tests
- Integration-style tests for Dashboard and PatientDetail with mocked API responses

Debugging guide (Solid + Vitest)
--------------------------------
Use this sequence when learning debugging and async UI behavior.

1) Reproduce with focused test run

```bash
npx vitest run src/pages/__tests__/Dashboard.integration.spec.jsx
npx vitest run src/pages/patients/__tests__/PatientDetail.integration.spec.jsx
```

2) Run watch mode while editing

```bash
npx vitest src/pages/__tests__/Dashboard.integration.spec.jsx
```

3) Add temporary API call tracing in tests
- Check exact endpoint calls with `toHaveBeenNthCalledWith` on mocked client methods.
- Verify response shaping by asserting rendered text after `findByText` / `waitFor`.

4) Debug frontend runtime in browser
- Start backend + frontend.
- Open browser DevTools Network tab.
- Verify requests for:
	- `/api/v1/stats/dashboard`
	- `/api/v1/patients/:id/summary`
	- `/api/v1/patients/:id/glucose?...`

5) Trace Solid reactivity issues
- In components, inspect state transitions around `createSignal` and `createEffect`.
- For async loaders, verify loading/error/value transitions in order.

Common issues
-------------
- Requests never resolve in tests: ensure module mocks are hoist-safe (`vi.hoisted`) and imports happen after mocks.
- Router primitive errors in tests: render link components inside router context or mock layout/navigation wrappers.
- jsdom scroll warnings from router: stub `window.scrollTo` in `src/test/setup.js`.

Build for production
--------------------
```bash
npm run build
npm run preview
```

