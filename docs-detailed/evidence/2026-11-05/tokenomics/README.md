# Tokenomics interface verification

The screenshots in this folder use **synthetic, intercepted API responses**. They show
the implemented frontend at desktop (1280 px) and mobile (390 px) widths. They are not
new provider benchmarks, real family records or proof of a production billing amount.

- `admin-1280.png`, `admin-390.png`: separate operator login/workspace, policy controls,
  cost references including retrieval, and versioned provider rates.
- `metrics-1280.png`, `metrics-390.png`: sample cost and latency reporting; milliseconds
  from the API are displayed as seconds.
- `coach-1280.png`, `coach-390.png`: family coaching credits, demo-mode label and optional
  numerical generation cost.

Four Chromium checks passed using:

```bash
cd frontend
PLAYWRIGHT_CHANNEL=chrome npx playwright test --config=playwright.tokenomics.config.ts
```

The checks intercept all `/v1` traffic and block external requests. They verify direct
`/admin` navigation without family loading, policy saving, independent admin logout,
family-meter updates, cost visibility after focus, and no horizontal page overflow.
No provider calls or real family writes are made. The frontend-only Playwright config
does not start or migrate the backend.
