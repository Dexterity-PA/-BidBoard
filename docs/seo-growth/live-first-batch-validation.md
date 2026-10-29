# First release: production blog validation

Checked October 29, 2026, 10:44:08 to 10:44:59 UTC.

**Result: all 30 first-release net-new blog URLs returned HTTP 200 with exactly one canonical matching the requested production URL. All 30 were present in the production blog sitemap.**

## Scope and method

- Baseline source: `05f8447945a1b7cb13c6478f561a3d848699894c` (50 blog articles).
- First-release source: `78cfedcb31b677a748fdc5fe1af03d4391809d56` (80 blog articles).
- The set difference of article slugs at those Git revisions contains exactly 30 net-new blog articles. This comparison uses committed first-release source, not the larger uncommitted working tree.
- Production sitemap: https://meritously.com/blog/sitemap.xml returned HTTP 200 and contained 80 article URLs at the time of the check.
- Fetched each of the 30 URLs using curl GET with redirects enabled, no cookies or account credentials, at most four concurrent requests, 10-second connection timeout and 35-second total timeout. Parsed canonical link elements from returned HTML.
- Each successful final URL matched the requested URL. All pages also returned a nonempty article-specific HTML title.
- Four first attempts failed at the network proxy connection stage with curl error 28 and no HTTP response. A single bounded retry of those four succeeded for all four. These were transport failures, not observed HTTP error responses.

This verifies live page availability and canonical markup for this first batch only. It does not establish Google indexing, ranking, search impressions, visual correctness, or publication of the second batch. It contains no private analytics.

## Per-page results

| Production URL | HTTP | Canonical | In sitemap | Attempt |
| --- | --- | --- | --- | --- |
| [alabama-out-of-state-merit-scholarships-2027](https://meritously.com/blog/alabama-out-of-state-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | First passed |
| [arizona-engineering-scholar-brown-scholarships](https://meritously.com/blog/arizona-engineering-scholar-brown-scholarships) | 200 | Exact self-canonical | Yes | First passed |
| [arizona-english-creative-writing-scholarships-2027](https://meritously.com/blog/arizona-english-creative-writing-scholarships-2027) | 200 | Exact self-canonical | Yes | First passed |
| [asu-new-american-university-scholarship-estimate](https://meritously.com/blog/asu-new-american-university-scholarship-estimate) | 200 | Exact self-canonical | Yes | First passed |
| [bennington-young-writers-awards-2026-guide](https://meritously.com/blog/bennington-young-writers-awards-2026-guide) | 200 | Exact self-canonical | Yes | First passed |
| [cincinnatus-scholarship-cincinnati](https://meritously.com/blog/cincinnatus-scholarship-cincinnati) | 200 | Exact self-canonical | Yes | First passed |
| [colorado-state-green-gold-scholarships-2027](https://meritously.com/blog/colorado-state-green-gold-scholarships-2027) | 200 | Exact self-canonical | Yes | First passed |
| [equitable-excellence-scholarship-2027](https://meritously.com/blog/equitable-excellence-scholarship-2027) | 200 | Exact self-canonical | Yes | First passed |
| [ge-reagan-scholarship-2027-application](https://meritously.com/blog/ge-reagan-scholarship-2027-application) | 200 | Exact self-canonical | Yes | First passed |
| [jack-kent-cooke-scholarship-2027-application](https://meritously.com/blog/jack-kent-cooke-scholarship-2027-application) | 200 | Exact self-canonical | Yes | First passed |
| [live-mas-scholarship-2027-video-or-essay](https://meritously.com/blog/live-mas-scholarship-2027-video-or-essay) | 200 | Exact self-canonical | Yes | First passed |
| [merit-scholarship-service-requirements](https://meritously.com/blog/merit-scholarship-service-requirements) | 200 | Exact self-canonical | Yes | First passed |
| [miami-ohio-merit-scholarships-2027](https://meritously.com/blog/miami-ohio-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Retry passed |
| [mississippi-state-nonresident-merit-2027](https://meritously.com/blog/mississippi-state-nonresident-merit-2027) | 200 | Exact self-canonical | Yes | Retry passed |
| [national-merit-fifth-year-graduate-funding](https://meritously.com/blog/national-merit-fifth-year-graduate-funding) | 200 | Exact self-canonical | Yes | Retry passed |
| [nau-merit-scholarships-fall-2027](https://meritously.com/blog/nau-merit-scholarships-fall-2027) | 200 | Exact self-canonical | Yes | Retry passed |
| [nevada-reno-merit-scholarships-test-scores-2027](https://meritously.com/blog/nevada-reno-merit-scholarships-test-scores-2027) | 200 | Exact self-canonical | Yes | First passed |
| [oklahoma-nonresident-merit-scholarships-2027](https://meritously.com/blog/oklahoma-nonresident-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | First passed |
| [outside-scholarships-financial-aid-reduction](https://meritously.com/blog/outside-scholarships-financial-aid-reduction) | 200 | Exact self-canonical | Yes | First passed |
| [penguin-random-house-writing-awards-2027](https://meritously.com/blog/penguin-random-house-writing-awards-2027) | 200 | Exact self-canonical | Yes | First passed |
| [scholarship-application-submitted-vs-complete](https://meritously.com/blog/scholarship-application-submitted-vs-complete) | 200 | Exact self-canonical | Yes | First passed |
| [scholarship-superscore-single-sitting-rules](https://meritously.com/blog/scholarship-superscore-single-sitting-rules) | 200 | Exact self-canonical | Yes | First passed |
| [scholarships-campus-housing-requirements](https://meritously.com/blog/scholarships-campus-housing-requirements) | 200 | Exact self-canonical | Yes | First passed |
| [science-ambassador-scholarship-2027](https://meritously.com/blog/science-ambassador-scholarship-2027) | 200 | Exact self-canonical | Yes | First passed |
| [south-carolina-nonresident-merit-scholarships](https://meritously.com/blog/south-carolina-nonresident-merit-scholarships) | 200 | Exact self-canonical | Yes | First passed |
| [tpc-mark-of-excellence-scholarship-texas](https://meritously.com/blog/tpc-mark-of-excellence-scholarship-texas) | 200 | Exact self-canonical | Yes | First passed |
| [uah-out-of-state-scholarships-2027](https://meritously.com/blog/uah-out-of-state-scholarships-2027) | 200 | Exact self-canonical | Yes | First passed |
| [university-arizona-merit-scholarships-fall-2027](https://meritously.com/blog/university-arizona-merit-scholarships-fall-2027) | 200 | Exact self-canonical | Yes | First passed |
| [unm-amigo-arizona-reciprocal-scholarship](https://meritously.com/blog/unm-amigo-arizona-reciprocal-scholarship) | 200 | Exact self-canonical | Yes | First passed |
| [usf-national-merit-scholarship-package](https://meritously.com/blog/usf-national-merit-scholarship-package) | 200 | Exact self-canonical | Yes | First passed |
