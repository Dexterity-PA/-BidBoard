# Non-email growth assets and experiments

Research and implementation date: 2026-10-29. No outreach, posts, form submissions, spending or manufactured engagement performed. This document contains public product research only.

## Implemented asset

`/for-counselors#seasonal-planner` adds a small November–January planning shortlist with five distinct application routes, official sources, exact published deadlines or explicit missing-time notes, initial eligibility screens and practical first actions. The same typed records power `/for-counselors/seasonal-planner.csv`, preventing independent HTML/CSV fact copies from drifting. The CSV contains blank personal planning fields; no completed student information is sent to Meritously by this feature. Its date status is evaluated on each download and is not cached. Downloads do not refresh afterward.

`/resources/fall-2026-planning-activity.txt` is a reusable 20-minute classroom/advising activity. The public table supports printing and keyboard-accessible horizontal scrolling on small screens. The page provides a copyable anchor link. This extends the existing counselor kit; it does not claim the existing tracker, comparison worksheet, matching, newsletter, or saved-award features as new.

Selection criteria: one need-restricted outside award (Cooke), one broad citizenship-restricted competition with need considered (Elks), one selective college application route (Vanderbilt), one admission-linked college priority date (Alabama), and one leadership competition closing after winter break (GE-Reagan). This is a teaching sample, not an exhaustive or objective best-scholarship ranking. None of these entries implies guaranteed aid.

## Source register

All checked directly on 2026-10-29. The following facts are the scope of this asset; award amounts are intentionally omitted.

| Program | Current-cycle facts used | Official source | Limitations |
| --- | --- | --- | --- |
| Cooke | Fall 2027 entry; spring 2027 seniors; 3.75 unweighted GPA; need; SAT/ACT/AP/IB score; November 11, 2026; two academic recommendations and counselor recommendation | https://www.jkcf.org/our-scholarships/college-scholarship-program/how-to-apply/ | Shortlist is not a complete eligibility screen; no closing time claimed |
| Elks MVS | Current U.S.-citizen seniors; need considered; no Elks family relation required; November 12, 2026, 11:59 p.m. PST; Submitted vs Complete portal distinction | https://hq.elks.org/scholarWeb/resources/mvsFAQ.cfm | All rules and later-stage obligations remain with provider |
| Vanderbilt | Prospective first-year scholarship deadline December 1, 2026; admission first; MyAppVU access normally 2–3 business days; distinct signature award questions | https://www.vanderbilt.edu/scholarships/application/ | Time not stated; scholarship submission strongly encouraged with preference, not called a universal eligibility condition |
| Alabama | Summer/fall 2027 first-time main-campus freshmen priority December 4; all application materials by priority date | https://afford.ua.edu/timeline/ | Not the spring or transfer deadline; award rules vary; no guarantee claimed |
| GE-Reagan | 2027–28 college year; U.S. citizen; winter 2026/spring 2027 senior; 3.0 GPA; full-time U.S. four-year study; January 7, 2027, 3 p.m. EST; initial leadership/service essay and goals | https://www.reaganfoundation.org/education/ge-reagan-foundation-scholarship | Full rules apply; initial list is not a promise of selection |

Independent review completed 2026-10-29 by the separate outside-articles worker, who opened all five official provider sources and checked the module's dates, initial eligibility screens and first actions. No corrections were required. Implementation validation: six tests passed across the seasonal-planner and existing counselor-resource suites. Deployment and visual verification remain the integrating worker's responsibility.

## Evidence for the distribution direction

- Scholarships.com educator product explicitly offers curated lists, PDF/CSV exports, deadline calendars and student resources: https://www.scholarships.com/educators (checked 2026-10-29). This demonstrates an established counselor use case, not evidence of Meritously conversion or traffic uplift.
- NACAC's public paying-for-college resource page offers downloadable resources for student/parent meetings and professional sharing: https://www.nacacnet.org/how-to-pay-for-college/ (checked 2026-10-29). A concise classroom activity is a plausible useful resource for this audience; inclusion by any organization is not assumed.
- The proposed scholarship-provider submission lead returned HTTP 403 at https://www.scholarshipproviders.org/page/SubmitScholarship. Do not claim that a submission path was inspected or that a listing is available.

## Ready-to-use, unsent materials

### Owner's social channel: deadline-to-action example

Audience: seniors and parents. Suggested format: a short screen recording showing the unfilled planner and one official source, with no student account or personal information visible.

Draft: “A scholarship deadline is only the last step. Work backward: eligibility check, portal access, recommendation request, then your own earlier target date. This free fall planning sheet includes five different 2027-entry application routes, official sources and a downloadable tracker. Start with the rules that could rule you out before drafting an essay: https://meritously.com/for-counselors#seasonal-planner”

### School resource page / advising session

Audience: counselors, advisers and college-access groups. Suggested use: an owner-approved resource-page link or a handout for an existing session, without requesting a reciprocal backlink or implying endorsement.

Draft: “Free scholarship planning activity: compare five application routes, check each provider's requirements and leave with one next action. Includes a dated shortlist, official source links and a CSV working copy. No account is required. https://meritously.com/for-counselors#seasonal-planner”

### Community answer

Audience: a relevant parent or student discussion where self-promotion is permitted. Give the answer in the post itself and disclose affiliation if the owner posts. Do not mass-post identical copy.

Draft: “For a November deadline, check more than whether you clicked Submit. Some awards have a separate counselor report, and an application can show Submitted without being Complete. Open the provider's current instructions and verify every supporting item. I work on Meritously; we made a free planning worksheet that shows this distinction alongside official source links: https://meritously.com/for-counselors#seasonal-planner”

## Measurement plan

Treat these as experiments, not traffic promises. If the owner chooses to distribute, use distinct nonpersonal campaign labels for owned social and resource-page traffic, and keep completed student data out of URLs. Compare qualified referrals to the counselor page, visits continuing to scholarship details, actual official-application click events where the existing setup measures them, and return visits over 2–4 weeks. Review Search Console impressions/clicks/query mix for the counselor URL separately from on-site conversion. Do not infer downloads or application submissions from pageviews. A later instrumentation change should only add events within the existing consent/privacy model.

Measurement change implemented in this batch: main's `analyticsPath` allowlist previously omitted the blog and counselor resources. It now accepts the exact `/blog` and `/for-counselors` routes and groups article paths as `/blog/[guide]`, retaining no article slug or query string. Existing Do Not Track, Global Privacy Control, opt-out, same-origin checks, rate limits and retention behavior are preserved. Privacy copy names these public page categories. Downloads and official application clicks are not newly instrumented by this change. Historical blog/counselor visits cannot be reconstructed from the collector; comparisons start after deployment. Search Console remains a separate source of Google landing-page performance when authorized access is available.

## PR 30 reuse audit

`lib/merit/calendar.ts` validates real dates, confirmed/upcoming status, safe source URLs, ICS escaping, 75-octet folding and exclusive next-day all-day end dates. `DeadlineExport.tsx` checks at initial hydration, on focus/visibility, every minute and again at click. It clearly describes the file as a static date marker rather than exact closing time. Same-day dates remain exportable, so exact provider-time guidance remains necessary. Root integration must retain current main dependencies, authentication and later guide work; PR checks on its older base do not prove integration quality.

`lib/merit/comparison.ts` stores only valid catalog IDs and limits comparison to three. Stale/retired IDs and corrupt storage are filtered. Root should integrate its supported UI/tests selectively, then test source integration and actual mobile flows. This lane did not merge, deploy, or validate the full PR.
