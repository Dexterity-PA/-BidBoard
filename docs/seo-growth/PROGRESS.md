# Search and editorial production checkpoint

Updated October 29, 2026. This ledger contains public implementation evidence only. No private site analytics or account details belong here.

## Baseline and release

- Source baseline: main `05f8447945a1b7cb13c6478f561a3d848699894c` with 50 existing blog guides. Existing catalog records do not count as new blogs.
- Working branch: `codex/meritously-search-growth-2026-10-29`; PR https://github.com/Dexterity-PA/-BidBoard/pull/39.
- First foundation snapshot: `9ca97a9c2a894a9e08e1594976d284fc95a1868b`. GitHub quality run 40855243481 passed; Vercel preview build succeeded. Preview requires Vercel authentication in the available browser, so this is not a completed visual review.
- First content batch: 30 net-new blog articles independently source-reviewed and integrated; 3 existing articles materially expanded. Publication/live confirmation is still pending the content release checks. No new Google indexing or traffic result is claimed.

## Reviewed article modules

| Module | New blogs | Independent reviewer evidence |
|---|---:|---|
| blog-college-growth.ts | 8 | independent-college-review.md |
| blog-arizona-guides.ts | 8 | independent-arizona-review.md |
| blog-outside-growth.ts | 8 | outside-claims.md, separate state-author review and requested corrections applied |
| blog-decision-growth.ts | 4 | review-decision-batch-1.md |
| blog-process-growth.ts | 2 | independent-design-process-review.md |

Existing automatic merit, out-of-state merit and National Merit guides received additional current-policy comparison sections. They are revisions, not new articles. Review is recorded in independent-design-process-review.md. Reviewers are separate automated workers, not invented human experts.

## Implemented foundations

- Searchable editorial index, readable article layout, accessible scrolling comparison tables, restrained styling and truthful published/updated dates.
- Selectively integrated PR30 comparison and calendar tools, preserving current dependencies and newer source work. PR30 itself was not blindly merged.
- Past listed deadlines and earlier milestones are labeled honestly. Topic and related-award ordering favors upcoming listed stages without promising applications are open.
- Listing descriptions reserve space for date and eligibility rather than letting long award descriptions obscure both.
- Removed homepage counts that disagreed with filtered browse results.
- Verified five-program counselor planning sheet, CSV export and classroom activity; shared typed facts keep the page and export consistent. No student information is put in shared URLs.
- Existing privacy-conscious visit collection extended to public blog/counselor categories. Article slugs, sensitive pages and query strings remain excluded; existing opt-outs remain intact.

## Validation and limits

Release types/tests run locally; the first full expanded run passed 408 tests. Catalog audit validates 800 records without database writes outside production. Dependency audit has no high-severity production findings; five low-severity existing transitive findings remain. No security gate or migration guard was weakened.

Local production compilation succeeded, but complete local build validation is limited by absent real database configuration and a separate pre-existing webpack route-props type error in the admin analytics page. The existing Vercel build is the deployment verification path. Local Chromium download was unavailable; preview authentication blocked cloud visual inspection. Production visual checks remain required after deployment. No production cron endpoint was called.

## Continuing queue

`editorial-queue.csv` contains 260 candidate intents, not completed or verified articles. `demand-map.md` separates qualitative SERP evidence from unmeasured search volume; Google Trends data was unavailable. Match commissioned slugs to the existing canonical intent before writing. New candidates must not create competing copies of the existing 50 guides.

Second author batches are in progress in separate modules. Keep every unpublished/unreviewed module out of the central GUIDES export until independent claim/table review passes. The 200+ new-blog target is a stretch goal, not a completed count. Update the exact written/reviewed/live counts and release SHAs after each batch.

Non-email growth research and unsent reusable copy are in `non-email-growth.md`. No outreach, posts, purchases or external submissions were made.
