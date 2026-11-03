# RA-Capitals (Taurus Magnus) Project Guidelines & CI/CD Rules

## 1. Branching & Deployment Strategy
- **Active Deployment Branch:** `Racapitalsmvp`
- GitHub Actions (`.github/workflows/deploy.yml`) triggers on every push to `Racapitalsmvp`.
- Deployment is **strictly blocked** if any tests fail.

## 2. Testing Constraints (Must Pass Before Push)
- **Backend Tests:** Jest + Supertest (`backend/__tests__/auth.test.js`).
  - Mongoose DB operations are mocked for CI.
  - Covers auth routes (`/login`, `/verify`), and health check (`/api/health`).
- **Frontend Tests:** Vitest (`frontend/src/__tests__/formatters.test.js`).
  - Covers currency, date, and price formatting utilities in `src/utils/format.js`.
- **Rule:** Never introduce code or utility changes that break existing test suites. Run or verify tests before pushing.

## 3. Strict Package & Lockfile Policy
- The server deploy script runs `npm ci`, which strictly enforces sync between `package.json` and `package-lock.json`.
- **Rule:** If ANY npm package is added, updated, or removed in `frontend` or `backend`, **ALWAYS** commit and push the updated `package-lock.json` along with `package.json`. Failure to do so breaks the deployment pipeline.

## 4. Environment Variables & Secrets
- **Rule:** Never commit database credentials, API secrets, or `.env` files with production values to git.
- Server environment variables are maintained manually on the host at `/home/taurus-deploy/RaCapitals/.env`. If a new environment variable is introduced, notify the user to add it directly to the server `.env`.
- `JWT_SECRET` is injected into the GitHub Actions test runner via repository secrets.

## 5. Automated Server Deployment Pipeline
- Once tests pass, GitHub Actions connects via SSH to the server:
  ```bash
  cd /home/taurus-deploy/RaCapitals
  git pull
  cd frontend && npm ci && npm run build
  cd ../backend && npm ci
  pm2 restart racapitals-api
  ```
- Any architectural changes to build scripts or server processes must stay compatible with this flow.
