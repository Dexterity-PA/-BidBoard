# Production UI verification after PR 40

Observed public production on October 29, 2026; tool clock at completion: 14:41 UTC. Coordinating agent reported Vercel success for merged main c052abe82ee6d5f0fabbea4c4ec267679b5bcb12. This document records direct browser observations, not inferred deployment behavior.

## Passed desktop checks

- https://meritously.com/blog displayed 169 guides in both the introduction and library count. The prior baseline was 50; this UI count is consistent with 119 net-new articles, with root separately checking the exact slug inventory.
- Opened November through the index reading path and used the section navigation. https://meritously.com/blog/november-2026-scholarship-deadlines displayed the three-row, four-column comparison with correct spring-entry distinction, official links and October 29 publication date. Table text wrapped without overlap.
- https://meritously.com/blog/december-2026-scholarship-deadlines displayed Vanderbilt December 1, Alabama December 4 and Science Ambassador December 14, with distinct effort/eligibility columns and official links. Section navigation worked; table fit the desktop article width.
- https://meritously.com/scholarships/c102-university-of-connecticut-stamps-scholarship displayed November 1, 2026 in the first-screen deadline card, with November 8 supplement separately explained in the deadline and notes. Browse also displayed November 1.
- https://meritously.com/scholarships/p101-taco-bell-foundation-live-mas-scholarship displayed January 5, 2027 in the card and 5 p.m. PST in the details. Existing merit-and-need filter must be enabled to include this mixed-need award in browse results; this was tested rather than mistaken for missing data.
- Searching YoungArts with default hide-passed checked returned zero results. Disabling that checkbox returned the historical October 6 record labeled Date passed. Re-enabling removed it again. The January programme no longer creates a false future application opportunity.
- Two existing comparison selections survived navigation. View comparison opened the table without an account, displayed award coverage, dates, requirements, eligibility and official-provider links, and Close comparison returned focus to the opener. Desktop layout was readable.

## Screenshot evidence

Public screenshots were saved and confirmed present on the shared scratch filesystem:

- /workspace/scratch/meritously-release2-index-169.jpg
- /workspace/scratch/meritously-release2-november-table.jpg
- /workspace/scratch/meritously-release2-december-table.jpg
- /workspace/scratch/meritously-release2-uconn.jpg
- /workspace/scratch/meritously-release2-livemas.jpg
- /workspace/scratch/meritously-release2-youngarts-filter.jpg
- /workspace/scratch/meritously-release2-comparison.jpg

These contain only public site UI. No private analytics, student data or signed-in account screen was captured.

## Limits and minor follow-up

Mobile visual validation remains unavailable: local Chromium installation failed and the cloud browser exposes no viewport-resize capability. Source-level responsive rules and focus/table semantics were reviewed earlier, but this is not a mobile screenshot test. Signup, authenticated saves, email delivery and external scholarship submission were not exercised. No production mail or cron endpoint was invoked.

One nonblocking editorial issue was visible in the older Arizona institution article title on the index: "what November 1 does;and does not;secure". This punctuation can be cleaned up in a later copy pass; no source was changed during this release verification.
