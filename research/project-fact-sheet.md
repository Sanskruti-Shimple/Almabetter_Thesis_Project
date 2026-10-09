# MarketNest – Project Fact Sheet (for the paper writer)

Facts below come from the actual code and deployment. Items marked **[MEASURE]** or **[YOU DECIDE]** are not known yet; do not invent them.

## 1. Basics
- Project: MarketNest, a small e-commerce / retail web app (research prototype).
- Domain: E-commerce & Retail (allowed; Healthcare and Finance are paused).
- Author / institution / date: **[YOU DECIDE]**
- Repo: https://github.com/Sanskruti-Shimple/Almabetter_Thesis_Project
- Live frontend: https://jolly-water-01c715d00.6.azurestaticapps.net
- Live API: https://marketnest-api-hi83d2.azurewebsites.net/api (try /api/health, /api/products)
- Research question (from brief): How can modern full stack architectures ensure scalability, modularity, and maintainability?

## 2. Tech stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6 (@vitejs/plugin-react), plain CSS |
| Backend | Node.js 22, Express 4 |
| Database | MongoDB 7 via Mongoose 8 |
| Auth | JWT (jsonwebtoken, 2 h expiry), bcryptjs (cost 12) |
| Security | helmet, CORS allow-list (CLIENT_ORIGIN), express-rate-limit (30 requests / 15 min on auth routes) |
| Testing | node:test + supertest (5 API tests) |
| DevOps | Docker (server/Dockerfile, docker-compose.yml), GitHub Actions CI (npm ci, test, build on every push/PR) |
| Cloud | Azure (see section 5) |

## 3. Architecture and data flow
User -> React UI (Azure Static Web Apps) -> HTTPS REST call -> Express API (Azure App Service) -> Mongoose -> MongoDB -> JSON response -> UI update.
- Monorepo with npm workspaces: `client/` and `server/`.
- Server is modular: `routes/` (auth, products, orders), `models/` (User, Product, Order), `middleware/auth.js`, `config.js`, `db.js`, `app.js` (app factory, so tests need no live DB server start), `index.js` (entry), `seed.js`.
- Frontend: single-page app; API base URL comes from build-time `VITE_API_URL`.

## 4. Features and business logic
1. **Catalog**: GET /api/products with category filter and text search (regex input is escaped, query length capped at 80, results capped at 100, featured first).
2. **Auth**: POST /api/auth/register and /login; passwords hashed; JWT returned; protected routes use `requireAuth` middleware.
3. **Cart** (client side) and **order placement**: POST /api/orders (auth required).
   - Validates 1–50 items, integer quantity 1–99, valid ObjectId, merges duplicate items.
   - **Price is taken from the database, not the client** (prevents price tampering). Total is computed on the server, rounded to cents.
   - Order stores a snapshot of name and price at purchase time.
4. **Order history**: GET /api/orders/mine (latest 50, newest first, only the logged-in user's).
5. Seed script loads 8 sample products (Accessories, Apparel, Home).
- Not built (say so in Limitations): payments, admin panel, stock/inventory tracking, order status beyond "placed", email, refresh tokens.

## 5. Deployment (Azure only; resource group `rg-marketnest`, region Central India)
- Frontend: Azure Static Web Apps, deployed with the SWA CLI; `staticwebapp.config.json` gives single-page-app fallback routing.
- API: Azure App Service, Linux plan B1, Node 22, deployed as a zip through Kudu. App settings hold MONGODB_URI, CLIENT_ORIGIN, JWT_SECRET (secrets are not in the code).
- Database: MongoDB 7 container on Azure Container Instances (demo only, data not persistent).
- Attempted first: Azure Cosmos DB for MongoDB. It reported server version 3.6, which the current Node driver rejects, so it was abandoned. This is a genuine finding for the paper (Challenges / Limitations).
- Earlier plan (Vercel + Render + Atlas) is documented in README / `render.yaml` / `vercel.json`; the user switched to Azure because of credits.
- CI: GitHub Actions runs tests and build. CD to Azure was done manually (CLI), **not** automated; say this honestly or add a workflow later.

## 6. Problems met (good material for "Challenges")
- Cosmos DB version incompatibility -> replaced with a MongoDB container.
- `az webapp deploy` hung -> deployed via Kudu zipdeploy REST endpoint.
- Live site showed a blank page: Vite had no config, so JSX compiled with the classic runtime and crashed with "React is not defined". Fixed by adding `vite.config.js` with the React plugin. Local checks had not caught it.
- API root returned `{"error":"Resource not found."}`: expected, only `/api/*` routes exist.
- Wrong saved Git credential gave a 403 on first push.

## 7. Trade-offs / limitations (real ones)
- Single B1 instance and a single non-persistent database container: no horizontal scaling, no backups, no high availability.
- MongoDB container is publicly reachable on port 27017 protected only by a password (acceptable for a demo, not production).
- Rate limit is per-instance and in-memory; it would not be shared across several instances.
- Static Web Apps (free/CDN) vs App Service (always-on server) vs serverless vs containers: cost, cold starts and control differ **[add real pricing from the Azure pricing page, with the date you checked]**.

## 8. Results still to be collected **[MEASURE]**
No performance numbers exist yet. Do not cite any until measured.
- Screenshots: home/catalog, search/filter, register/login, cart, order confirmation, order history, Azure portal resources, GitHub Actions run.
- Load test (k6 or Artillery) against GET /api/products and POST /api/auth/login: requests/s, p50/p95 latency, error rate at several concurrency levels.
- Baseline vs optimized table: e.g. with and without an index/caching, or B1 vs a larger plan. Only report what is actually run.
- Test results: 5 passing API tests (`npm test`); build time; bundle size (last build: JS ~158 kB, ~51 kB gzip).
- Cost: actual spend from Azure Cost Management.

## 9. Candidate references (verify each one and cite in the required style)
React docs (react.dev), Node.js docs, Express docs, MongoDB docs, Mongoose docs, Vite docs, Azure App Service / Static Web Apps / Container Instances / Cosmos DB docs, OWASP (Top 10, JWT and password storage cheat sheets), RFC 7519 (JWT), Docker docs, GitHub Actions docs. Add academic papers on microservices vs monolith, DevOps/CI-CD and cloud scalability that you actually read.

## 10. Mapping to the evaluation criteria and video
- Methodology (15%): SDLC approach, section 2-5, code snippets from `routes/orders.js` and `routes/auth.js`, folder structure.
- Results (10%): section 8 once measured.
- Code Work (5%): appendices = folder tree, Dockerfile, `ci.yml`, Azure settings (with secrets removed).
- Video (about 15 min of content across 8 parts): intro, industry problem, architecture (section 3), features (section 4), backend and API (section 4), deployment and DevOps (section 5), performance and trade-offs (sections 7-8), challenges and future work (section 6 plus: persistent managed database, payments, admin role, automated CD, monitoring).
- Writing rule: the university requires original human-written text and runs an AI detector, so the paper wording must be written by the author from these facts.
