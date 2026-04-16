# FireScope Server

Minimal backend for local FireScope service workflows.

## Endpoints

- `GET /health`
- `GET /api/v1/map-config`
- `GET /api/v1/scenarios`
- `POST /api/v1/scenarios`
- `DELETE /api/v1/scenarios/:scenarioId`

## Run

```powershell
cd server
node index.mjs
```

or

```powershell
cd server
npm run start
```

## Notes

- Authentication headers are currently accepted but not validated.
- Scenarios are stored in `server/data/scenarios.json`.
- The store keeps the newest 5 scenarios to match the current client UX.
