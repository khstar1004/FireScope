# Repository Guidelines

## Project Structure & Module Organization
`client/` holds the Vite + React app. Key folders: `src/game` simulation engine, `src/gui` UI and map code, `src/scenarios` sample JSON, `src/testing` shared setup, and `src/**/test` feature tests. `gym/` contains the Python package in `gym/blade` plus demos in `gym/scripts`. `docs/` is the Sphinx site. `server/` is a placeholder.

## Build, Test, and Development Commands
Use Node 20.19.x, npm 10.8.x, and Python 3.12.

- `cd client && npm install`: install frontend dependencies.
- `cd client && npm run standalone`: run the UI without a backend.
- `cd client && npm run start`: run the Vite dev server.
- `cd client && npm run build`: type-check and create the production bundle.
- `cd client && npm run lint` / `npm run format`: run ESLint and Prettier.
- `cd client && npm test`: run Vitest. Use `npm run test:game`, `test:units`, or `test:utils` for focused runs.
- `cd gym && pip install -e .[gym]`: install the Python package in editable mode.
- `cd gym && python scripts/simple_demo/demo.py`: exercise the simulator and export a scenario.
- `cd docs && make html` or `.\make.bat html`: build the Sphinx docs.

## Coding Style & Naming Conventions
Formatting is enforced with Prettier and ESLint. Follow 2-space indentation, semicolons, and the repo’s current double-quote TypeScript style. Use `PascalCase` for React components and classes, `camelCase` for utilities and functions, and `*.spec.ts(x)` for tests. In `gym/blade`, class files use `PascalCase` names such as `Game.py`, while methods and scripts use `snake_case`.

## Testing Guidelines
Client tests run with Vitest and shared setup from `client/src/testing/setup.ts`. Add tests near the feature you change, for example `client/src/game/units/test/Aircraft.spec.ts`. No coverage threshold is configured, so behavior changes should ship with targeted tests. Python changes in `gym/` should be exercised through the relevant demo or training script.

## Commit & Pull Request Guidelines
Follow `CONTRIBUTING.md`: keep PRs small, focused, and limited to one bug fix or feature. Recent commits use short imperative subjects and occasional `STABLE` or `UNSTABLE` prefixes; prefer the documented `[TAG] Short summary` format, keep the subject under 50 characters, and add a blank-line body when needed. PRs should explain why, link issues when available, include screenshots for UI work, and note test or docs updates.

## Security & Configuration Tips
Keep secrets in `client/.env` only. Vite expects variables such as `VITE_GEMINI_API_KEY`, Auth0 settings, `VITE_API_SERVER_URL`, and `VITE_MAPTILER_DEFAULT_KEY`. Do not commit API keys, auth values, or sensitive scenario data.
