# MarketNest

MarketNest is a small, runnable MERN-stack retail storefront created as a research-project prototype. It demonstrates a React storefront, an Express REST API, MongoDB persistence, bearer-token authentication, order creation, containerized local infrastructure, and a CI workflow.

## Access WebApp Here:

https://jolly-water-01c715d00.6.azurestaticapps.net/#

## Requirements

- Node.js 20 or newer and npm
- Docker Desktop (for the included local MongoDB service), or another MongoDB instance

## Run locally

1. Copy `.env.example` to `server/.env` and replace `JWT_SECRET` with a long random value. Keep the URI at its default when using the included MongoDB service.
2. Start the database with `docker compose up -d mongodb`.
3. Install dependencies from the project root: `npm install`.
4. Seed the catalog: `npm run seed`.
5. Start the API and UI: `npm run dev`.
6. Open `http://localhost:5173`. The API is available at `http://localhost:4000/api`.

The API refuses to start without `MONGODB_URI` and `JWT_SECRET`. Never commit `.env`.

## Features

- Responsive catalog with search, category filters, and product details
- Account registration and sign-in with hashed passwords and signed JWTs
- Cart management and authenticated order checkout
- Authenticated order-history endpoint
- Request validation, security headers, rate limiting on authentication endpoints, and centralized error responses
- Health endpoint at `/api/health`

This prototype intentionally does not handle payment-card data or process payments. Checkout records an order only.

## API overview

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Liveness check |
| GET | `/api/products` | Public | Catalog; optional `q` and `category` query parameters |
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Authenticate and receive a token |
| POST | `/api/orders` | Bearer token | Create an order from product IDs and quantities |
| GET | `/api/orders/mine` | Bearer token | List the signed-in user's orders |

## Development checks

- `npm test` runs API tests using Node's built-in test runner.
- `npm run build` creates the production React bundle.
- `npm run seed` inserts the sample catalog if it is empty.

## Container use

Build and run the API with `docker build -f server/Dockerfile -t marketnest-api .`. The container needs `MONGODB_URI`, `JWT_SECRET`, and (if the UI is hosted elsewhere) `CLIENT_ORIGIN`. For a production deployment, use a managed MongoDB service, set secrets through the host's secret manager, serve the built frontend over HTTPS, restrict CORS to the real frontend origin, and configure backups and monitoring. Do not expose the database port publicly.

## Deploy to Vercel, Render, and MongoDB Atlas

Deployment configuration is included in `vercel.json` and `render.yaml`. These files do not publish anything by themselves; first push this project to a GitHub repository you control, then connect that repository in the hosting dashboards.

1. **MongoDB Atlas:** Create a database and a dedicated database user. Copy the application's connection URI, replacing the username, password, and database name. For a prototype, Atlas may require a network access entry that permits Render's outbound connection; Render's free instances do not provide a fixed outbound IP. Use a strong, unique database password, keep network access limited as much as the hosting plan permits, and never put the URI in source code.
2. **Render API:** Create a Blueprint deployment from the repository root using `render.yaml`. Set `MONGODB_URI` to the Atlas URI and `CLIENT_ORIGIN` to the exact HTTPS Vercel site origin (for example, `https://your-project.vercel.app`, with no path). Render generates `JWT_SECRET` from the blueprint. Copy the deployed API URL, such as `https://marketnest-api.onrender.com`.
3. **Vercel frontend:** Import the same repository. Keep the project root at the repository root; `vercel.json` configures the frontend build and output. Add `VITE_API_URL` with the API URL plus `/api` (for example, `https://marketnest-api.onrender.com/api`), then deploy.
4. **CORS:** If Vercel assigned a different production domain, update Render's `CLIENT_ORIGIN` to that exact origin and redeploy/restart the API. For local development, comma-separated origins can be used when needed.
5. **Seed the demo catalog:** After the API has connected successfully, run `npm run seed --workspace server` once against the Atlas database URI. Do this from a trusted local machine with `server/.env` configured, or from the hosting provider's one-off shell. The seeder inserts sample products only when the catalog is empty.
6. **Verify:** Open the Vercel URL, search the catalog, register a demo-only account, add products to the bag, and place an order. Check Render logs and `/api/health` if the first API request fails. Render's free service may sleep between requests, so the first request can be slow.

The frontend is public. Use demo-only credentials, do not collect real payment details, and review provider pricing/limits before enabling paid resources. The default prototype stores account data and orders; choose appropriate access controls, backups, retention, and privacy notices before using real customer data.

## Research and demo material

- [`research/paper-outline.md`](research/paper-outline.md) is a section-by-section research scaffold with the required two-paragraph structure. Replace prompts with your own analysis and follow the institution's official template before submission.
- [`research/demo-slides.md`](research/demo-slides.md) provides a presentation outline.
- [`research/evaluation.md`](research/evaluation.md) contains reproducible evaluation steps and blank result tables. No load-test or performance result is claimed until you run and record it.

The institution's instructions require human-authored submission text. Treat the research files as prompts and factual notes, not as a finished paper; write the final prose yourself and cite the sources you actually consult.
