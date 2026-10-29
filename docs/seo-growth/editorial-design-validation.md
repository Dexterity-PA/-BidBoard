# Editorial design implementation and validation

## Implemented

- Scoped blog typography and spacing using existing brand colors and system Georgia headlines, with a 740px reading width and no new font service or image payload.
- Replaced heavy repeated card treatment with editorial rows, restrained rules, readable comparison tables and source/context links.
- Added an accessible client-side guide search, preserving server-rendered links for every article. Search terms stay in the page and are not transmitted to an analytics service.
- Added a direct search-library jump link; preserved existing topic, reading-path and resource navigation.
- Labeled article dates according to actual publication versus revision metadata. Kept publication attribution as Meritously rather than invented individuals or human review.
- Kept responsive one-column layouts and keyboard-focus outlines. Tables have a labeled, keyboard-focusable horizontal scrolling region and an explicit small-screen hint.

## Validation boundaries

The initial source checks passed TypeScript and seven targeted blog/search tests. A later integrated-content run caught an invalid topic/category in another new article; the coordinator was notified rather than suppressing the test. Final integrated results belong to the release ledger.

The pre-change public blog index and full-tuition article were inspected in a browser. Localhost is not reachable from the cloud browser. The Vercel preview requires authentication, and protections were not weakened. Post-release public visual checks are recorded below when available.

The available cloud browser has no documented viewport resize method. Local Chromium installation also failed. Responsive CSS is implemented, but a true mobile-width visual check must not be claimed from desktop screenshots or source inspection alone.

## Post-release visual checks

On October 29, 2026 after the first production release, the public index displayed **80 guides**, corresponding to the original 50 plus 30 new articles in that release. This count is not the entire ongoing production batch.

- Desktop index screenshot inspected: restrained serif headline, recognizable green branding, reading paths, accessible search and a clear reading hierarchy. No visible clipping or overlapping elements.
- Guide search: `Alabama` returned four relevant guides; a nonexistent query showed an explicit empty state; Show all guides restored the library. Clicking a guide navigated successfully after the client transition completed.
- Public Alabama 2027 and NAU fall-2027 articles opened successfully. Their published dates, source links, introductory answers, tables and related reading rendered. Table-of-contents links jumped to the matching sections.
- Three-column Alabama and four-column NAU tables were inspected visually. Columns fit the desktop reading area, long eligibility cells wrapped naturally and official-source links remained readable.
- Browse comparison: selected MSU Alumni Distinguished and Maryland Banneker/Key without signing in, opened the two-award table, verified descriptive coverage, eligibility, application routes and official provider links, then closed it. Selections persisted across navigation.
- Daniels detail: the public page showed “Past listed deadline” October 15, 2026, an unconfirmed-next-cycle explanation and a disabled calendar button. Official-provider and no-account fit links were visible; saving prompted signup. Authentication and a completed account save were not exercised.

A production inconsistency was reported to the coordinator: the default browse filter retained some multi-date records while their cards showed the earliest passed date as “Date passed.” YoungArts still appeared that way after entering an explicit search query with the filter checked. Regions Bank and Morehead-Cain also appeared in the initial results; Daniels related awards included past-date labels. The underlying multiple-date policy must be distinguished from the presentation issue; the review did not blindly remove those records.

Desktop public screenshots were captured without account details or private analytics. True mobile viewport validation remains blocked as described above. Subsequent fixes and releases require their own verification; this record describes the first 80-guide production release.
