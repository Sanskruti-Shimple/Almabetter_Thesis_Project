# Evaluation worksheet

No performance result is pre-filled. Record actual measurements and retain raw output so the paper can be reproduced.

## Functional verification

Run from the repository root after starting MongoDB and installing dependencies:

```powershell
npm test
npm run build
npm run seed
```

Manually verify registration, sign-in, catalog search, category filters, cart quantity changes, checkout while signed in, and the unauthenticated checkout prompt. Record date, commit/revision, browser, Node version, MongoDB version, test results, and any failures.

| Check | Expected behavior | Observed result |
| --- | --- | --- |
| API tests | All tests pass | [Record output] |
| Production frontend build | Build succeeds | [Record output] |
| Register and sign in | Valid user can authenticate | [Record result] |
| Search and category filter | Catalog results update | [Record result] |
| Checkout | Authenticated order is persisted | [Record result] |

## Performance experiment

Use a repeatable load-testing tool (for example, k6 or autocannon) against the deployed or explicitly described local environment. Begin with a low request rate, test health and catalog endpoints separately, and do not load-test a public service without permission. Warm up first; run multiple trials; report request count, concurrency/rate, error rate, median, p95, and p99 latency. State whether latency includes network and database time.

| Scenario | Environment and load | Requests | Error rate | Median | p95 | p99 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Baseline catalog read | [Fill in] | — | — | — | — | — |
| Catalog after optimization | [Fill in] | — | — | — | — | — |
| Baseline health endpoint | [Fill in] | — | — | — | — | — |

## Evidence notes

- Date and time / region: [Fill in]
- Runtime, database tier, hosting plan, and instance sizes: [Fill in]
- Database seed size and data distribution: [Fill in]
- Test tool and exact command/configuration: [Fill in]
- Cache/index/connection-pool settings changed between trials: [Fill in]
- Limitations, outliers, and raw result file location: [Fill in]

Only compare baseline and optimized runs when the setup and workload are equivalent. Label estimates separately from measured values.
