# Development Guide (Express + SolidJS)

## Overview

- Backend: Express API in `backend-node` on port `8000`
- Frontend: SolidJS + Vite app in `frontend` on port `3000`

## Prerequisites

- Node.js 18+
- npm

## Install

```bash
cd backend-node && npm install
cd ../frontend && npm install
```

## Run in Dev Mode

### Backend

```bash
cd backend-node
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:3000`

## Build and Preview Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Backend Testing

```bash
cd backend-node
npm test
```

## Frontend Testing

Run all frontend tests:

```bash
cd frontend
npm run test:unit:ci
```

Run only the Solid testing harness suites:

```bash
cd frontend
npm run test:harness
```

## Debugging Tips

- Backend: add temporary `console.log` statements in route handlers and rerun with `npm run dev`.
- Frontend: use browser devtools Network tab to inspect `/api/v1/*` calls.
- For flaky UI behavior, run a single test file with Vitest:

```bash
cd frontend
npx vitest run src/pages/patients/__tests__/Index.integration.spec.jsx
```

## Database Reset

```bash
rm -f backend-node/diabetes_emr.db
```

Then restart backend to recreate schema and seed data.
