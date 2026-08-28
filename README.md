# PackRight

Airline baggage fee calculator and packing planner, published at
[luggageliason.com](https://luggageliason.com).

```
data/reference-data.json   Canonical policy dataset. Single source of truth.
api/                       Cloudflare Worker: fee engine + reference API.
frontend/                  React + Vite site, prerendered to static HTML.
```

## Working on it

```bash
# API
cd api && npm ci
npm run check          # strict typecheck + 40 engine/validation tests
npm run dev            # wrangler dev

# Frontend
cd frontend && npm ci
npm run dev
npm run build          # typecheck -> client -> ssr -> prerender -> budget gate
npm run test           # typecheck + lint
```

`frontend/npm run build` runs five stages and fails on any of them: strict
typecheck, client build, SSR build, prerender of all 19 routes, and a Brotli
performance budget (initial JS <= 120 KB, CSS <= 30 KB). It is currently at
85.5 KB / 5.9 KB.

## Deploying

The frontend and the Worker deploy separately, and **the database migration must
run before the new Worker goes live** or reference queries will fail on the new
columns.

```bash
cd api
npm run db:migrate     # additive ALTER TABLE for the provenance columns (run once)
npm run db:schema      # creates fee_assumptions and data_change_log
npm run db:seed        # backfills every column from data/reference-data.json
npm run deploy         # runs typecheck + tests, then wrangler deploy
```

Then deploy `frontend/dist` to Cloudflare Pages. `public/_headers` and
`public/_redirects` are Pages-specific: **the security headers, the immutable
asset cache and the www redirect only take effect on Cloudflare Pages.** On any
other host they must be reimplemented.

There is deliberately **no SPA fallback** (`/* /index.html 200`). That rule is
what made `robots.txt`, `sitemap.xml`, `/privacy` and `/terms` all return the app
shell with HTTP 200. Every canonical route is a real file; everything else gets
`404.html` with a 404 status.

## Two rules the fee engine will not break

1. **It never invents a price.** No sourced fee and no labelled assumption means
   the bag is reported `unpriced` and excluded from the total, with the UI saying
   so. The previous build hard-coded `$35`, `$40`, `$100` and `$150` inline.
2. **Fit checks are orientation-insensitive.** Bag and allowance are both sorted
   longest-to-shortest before comparison. The previous build compared
   length-to-length, so an ordinary 15x10x5 personal item was judged oversized
   against Frontier's 14x18x8 allowance and drew a phantom $100 penalty.

Details in [`api/README.md`](api/README.md).

## Outstanding before traffic acquisition

The August 2026 audit set a release gate. The engineering work behind it is
done; these items need a person, an account, or a decision, and are **not**
closed:

| # | Item | Why it is still open |
| - | ---- | -------------------- |
| 1 | **Verify the dataset** | Every record in `data/reference-data.json` ships as `status: "unverified"` with `verified_at: null`. The figures were carried over from the initial MVP seed and have not been checked against the airline sources recorded beside them. The app shows "Review pending" everywhere until a steward checks each record and sets `verified_at` / `verified_by`. **Southwest's checked-bag allowance is the highest-priority record**: it is modelled as two free bags, which changed during 2025. |
| 2 | **Create the mailboxes** | The policy pages publish `hello@luggageliason.com` and `privacy@luggageliason.com`. These addresses were chosen to match the domain and **must be created and monitored**, or the privacy rights channel does not exist. |
| 3 | **Legal review** | `/privacy`, `/terms` and `/affiliate-disclosure` describe what the code actually does, verified against this repository. They have not been reviewed by counsel. |
| 4 | **Confirm vendor settings** | The privacy page states Cloudflare Web Analytics is cookieless and does not fingerprint. Confirm the account's actual configuration and retention before publication. |
| 5 | **HSTS preload** | `_headers` sends `preload`. Confirm every subdomain is HTTPS-ready before submitting to the preload list, because it is hard to reverse. |
| 6 | **Watch the CSP** | The policy is strict with no `unsafe-inline`, validated against the built output (two script sources, one stylesheet, no fonts, no third-party images). Watch for breakage after enabling Cloudflare features that inject script, such as Rocket Loader. |
| 7 | **Search Console / Bing** | Verify ownership, submit `sitemap.xml`, and request re-indexing of the home page so the "frontend" title is replaced. Needs account access. |
| 8 | **Rate limiting** | `api/src/http.ts` enforces a per-isolate limit and emits accurate `RateLimit-*` headers, which is best effort because Workers isolates do not share memory. Enable the binding in `wrangler.toml` or a WAF rule for a durable account-wide limit. |
| 9 | **Affiliate programme** | No partner links ship. `/affiliate-disclosure` sets the standard any future link must meet: a real destination, `rel="sponsored noopener noreferrer"`, and disclosure next to the link. |

The audit's P2 items (a broader content library, a published data change log,
and a final decision on whether the public brand is PackRight or Luggageliason)
are not addressed here beyond `/methodology` and the footer line reconciling the
two names.
