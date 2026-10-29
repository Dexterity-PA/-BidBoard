# Production validation after the second article release

Checked October 29, 2026, 14:39:17 to 14:41:45 UTC.

**Result: 119/119 new blog URLs returned HTTP 200 with exactly one self-canonical matching the requested URL. 119/119 were present in the production blog sitemap.**

## Scope

- Baseline before this task: 50 existing articles.
- First release: 30 net-new articles.
- Second release: 89 additional net-new articles.
- This verification covers all 119 new article paths in `docs/seo-growth/new-article-manifest.json`, not only the 89 second-release additions.
- Production blog sitemap contained 169 article URLs, including the 50 existing articles.
- Coordinating agent signaled production readiness after Vercel success for merged main `c052abe82ee6d5f0fabbea4c4ec267679b5bcb12`. This report independently verifies page responses and markup; it does not infer deployment status from source alone.
- Local reviewed source: `8b2e9f399639de8f32572111ba474e82b4e809b6`. Expected PR head recorded at preparation: `004fbe7f64b6b8d9dd9fc079ec1632edfed48b39`.
- Manifest SHA-256 at verification, before live-status annotations and subsequent title punctuation polish: `834ed3de6bd5c0326d2205900994370918f025e49aabb27ef3f6539f93b05c3f`.

## Method and limitations

- Read-only unauthenticated curl GET requests, redirects enabled, maximum four concurrent article requests, 10-second connection timeout and 35-second total timeout. No mail endpoints, personal data or signed-in accounts were used.
- Fetched and parsed `https://meritously.com/blog/sitemap.xml` before requesting article pages; every expected path was present.
- Parsed actual returned HTML canonical link elements and titles. A passing row requires HTTP 200, the expected final URL, exactly one canonical equal to that URL, and a nonempty title.
- 4 article requests initially timed out while establishing the proxy connection (curl error 28, no HTTP response); each passed after one transport retry. HTTP errors were not automatically retried. Retried pages are labeled in the table below.
- Source review before deployment found 169 imported unique slugs, 119 distinct new manifest paths and titles, and centralized canonical generation from `/blog/{slug}`.
- This confirms public page availability, sitemap inclusion and canonical markup at the checked time. It does not prove Google indexing, ranking, impressions, search CTR, visual quality or future availability. No traffic gains are claimed.

## Per-page results

| Production article | HTTP | Canonical | Sitemap | Result |
| --- | --- | --- | --- | --- |
| [alabama-out-of-state-merit-scholarships-2027](https://meritously.com/blog/alabama-out-of-state-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [annual-scholarship-fall-spring-payments](https://meritously.com/blog/annual-scholarship-fall-spring-payments) | 200 | Exact self-canonical | Yes | Pass |
| [apia-scholarship-2027-2028-application](https://meritously.com/blog/apia-scholarship-2027-2028-application) | 200 | Exact self-canonical | Yes | Pass |
| [arizona-engineering-scholar-brown-scholarships](https://meritously.com/blog/arizona-engineering-scholar-brown-scholarships) | 200 | Exact self-canonical | Yes | Pass |
| [arizona-english-creative-writing-scholarships-2027](https://meritously.com/blog/arizona-english-creative-writing-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [arkansas-academic-challenge-three-eligibility-routes](https://meritously.com/blog/arkansas-academic-challenge-three-eligibility-routes) | 200 | Exact self-canonical | Yes | Pass |
| [arkansas-scholarships-vs-honors-fellowships](https://meritously.com/blog/arkansas-scholarships-vs-honors-fellowships) | 200 | Exact self-canonical | Yes | Pass (transport retry) |
| [asu-new-american-university-scholarship-estimate](https://meritously.com/blog/asu-new-american-university-scholarship-estimate) | 200 | Exact self-canonical | Yes | Pass |
| [auburn-merit-scholarships-2027-early-action](https://meritously.com/blog/auburn-merit-scholarships-2027-early-action) | 200 | Exact self-canonical | Yes | Pass |
| [baylor-merit-scholarships-early-action-2027](https://meritously.com/blog/baylor-merit-scholarships-early-action-2027) | 200 | Exact self-canonical | Yes | Pass |
| [bennington-young-writers-awards-2026-guide](https://meritously.com/blog/bennington-young-writers-awards-2026-guide) | 200 | Exact self-canonical | Yes | Pass |
| [best-arizona-merit-scholarships-college-fit](https://meritously.com/blog/best-arizona-merit-scholarships-college-fit) | 200 | Exact self-canonical | Yes | Pass |
| [best-portable-scholarships-undecided-major](https://meritously.com/blog/best-portable-scholarships-undecided-major) | 200 | Exact self-canonical | Yes | Pass |
| [best-scholarships-high-school-seniors-part-time-jobs](https://meritously.com/blog/best-scholarships-high-school-seniors-part-time-jobs) | 200 | Exact self-canonical | Yes | Pass |
| [best-writing-scholarships-high-school-authors-2027](https://meritously.com/blog/best-writing-scholarships-high-school-authors-2027) | 200 | Exact self-canonical | Yes | Pass |
| [bgsu-bg-success-nonresident-scholarship-2027](https://meritously.com/blog/bgsu-bg-success-nonresident-scholarship-2027) | 200 | Exact self-canonical | Yes | Pass |
| [boston-college-gabelli-presidential-scholarship](https://meritously.com/blog/boston-college-gabelli-presidential-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [boston-university-presidential-scholarship-half-tuition](https://meritously.com/blog/boston-university-presidential-scholarship-half-tuition) | 200 | Exact self-canonical | Yes | Pass |
| [burger-king-scholarship-2027-non-employees](https://meritously.com/blog/burger-king-scholarship-2027-non-employees) | 200 | Exact self-canonical | Yes | Pass |
| [can-merit-scholarships-pay-for-summer-classes](https://meritously.com/blog/can-merit-scholarships-pay-for-summer-classes) | 200 | Exact self-canonical | Yes | Pass |
| [changing-campus-online-scholarship](https://meritously.com/blog/changing-campus-online-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [changing-major-scholarship-application](https://meritously.com/blog/changing-major-scholarship-application) | 200 | Exact self-canonical | Yes | Pass |
| [charlotte-levine-scholarship-nomination-deadlines-2027](https://meritously.com/blog/charlotte-levine-scholarship-nomination-deadlines-2027) | 200 | Exact self-canonical | Yes | Pass |
| [cincinnatus-scholarship-cincinnati](https://meritously.com/blog/cincinnatus-scholarship-cincinnati) | 200 | Exact self-canonical | Yes | Pass |
| [clemson-national-scholars-vs-national-merit](https://meritously.com/blog/clemson-national-scholars-vs-national-merit) | 200 | Exact self-canonical | Yes | Pass (transport retry) |
| [colorado-state-green-gold-scholarships-2027](https://meritously.com/blog/colorado-state-green-gold-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [coolidge-scholarship-2026-juniors-2028-entry](https://meritously.com/blog/coolidge-scholarship-2026-juniors-2028-entry) | 200 | Exact self-canonical | Yes | Pass |
| [daniels-scholarship-partner-college-funding](https://meritously.com/blog/daniels-scholarship-partner-college-funding) | 200 | Exact self-canonical | Yes | Pass |
| [davidson-belk-scholarship-nomination](https://meritously.com/blog/davidson-belk-scholarship-nomination) | 200 | Exact self-canonical | Yes | Pass |
| [davidson-fellows-2027-project-readiness](https://meritously.com/blog/davidson-fellows-2027-project-readiness) | 200 | Exact self-canonical | Yes | Pass |
| [december-2026-scholarship-deadlines](https://meritously.com/blog/december-2026-scholarship-deadlines) | 200 | Exact self-canonical | Yes | Pass |
| [dell-scholars-2027-texas-eligibility](https://meritously.com/blog/dell-scholars-2027-texas-eligibility) | 200 | Exact self-canonical | Yes | Pass |
| [dorrance-scholarship-closed-arizona-alternatives](https://meritously.com/blog/dorrance-scholarship-closed-arizona-alternatives) | 200 | Exact self-canonical | Yes | Pass |
| [dual-enrollment-freshman-transfer-scholarships](https://meritously.com/blog/dual-enrollment-freshman-transfer-scholarships) | 200 | Exact self-canonical | Yes | Pass |
| [emory-scholar-programs-application-opt-in](https://meritously.com/blog/emory-scholar-programs-application-opt-in) | 200 | Exact self-canonical | Yes | Pass |
| [equitable-excellence-scholarship-2027](https://meritously.com/blog/equitable-excellence-scholarship-2027) | 200 | Exact self-canonical | Yes | Pass |
| [final-semester-part-time-merit-scholarship](https://meritously.com/blog/final-semester-part-time-merit-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [flinn-scholarship-2027-after-applying](https://meritously.com/blog/flinn-scholarship-2027-after-applying) | 200 | Exact self-canonical | Yes | Pass |
| [florida-bright-futures-ffaa-class-2027](https://meritously.com/blog/florida-bright-futures-ffaa-class-2027) | 200 | Exact self-canonical | Yes | Pass |
| [gap-year-scholarship-deferral-approval](https://meritously.com/blog/gap-year-scholarship-deferral-approval) | 200 | Exact self-canonical | Yes | Pass |
| [ge-reagan-scholarship-2027-application](https://meritously.com/blog/ge-reagan-scholarship-2027-application) | 200 | Exact self-canonical | Yes | Pass |
| [georgia-hope-zell-miller-gpa-test-rules](https://meritously.com/blog/georgia-hope-zell-miller-gpa-test-rules) | 200 | Exact self-canonical | Yes | Pass |
| [goldwater-scholarship-2027-campus-nomination](https://meritously.com/blog/goldwater-scholarship-2027-campus-nomination) | 200 | Exact self-canonical | Yes | Pass |
| [hagan-scholarship-2027-work-requirement](https://meritously.com/blog/hagan-scholarship-2027-work-requirement) | 200 | Exact self-canonical | Yes | Pass |
| [hispanic-heritage-youth-awards-2026-application](https://meritously.com/blog/hispanic-heritage-youth-awards-2026-application) | 200 | Exact self-canonical | Yes | Pass |
| [houston-tier-one-scholarship-2027-application](https://meritously.com/blog/houston-tier-one-scholarship-2027-application) | 200 | Exact self-canonical | Yes | Pass |
| [hsf-scholar-status-scholarship-funding](https://meritously.com/blog/hsf-scholar-status-scholarship-funding) | 200 | Exact self-canonical | Yes | Pass |
| [iowa-state-oneapp-freshman-scholarships-2027](https://meritously.com/blog/iowa-state-oneapp-freshman-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [jack-kent-cooke-scholarship-2027-application](https://meritously.com/blog/jack-kent-cooke-scholarship-2027-application) | 200 | Exact self-canonical | Yes | Pass |
| [jackie-robinson-scholarship-2027-css-profile](https://meritously.com/blog/jackie-robinson-scholarship-2027-css-profile) | 200 | Exact self-canonical | Yes | Pass |
| [jfk-profile-courage-essay-contest-2027](https://meritously.com/blog/jfk-profile-courage-essay-contest-2027) | 200 | Exact self-canonical | Yes | Pass |
| [k-state-wildcat-nonresident-scholarship-2027](https://meritously.com/blog/k-state-wildcat-nonresident-scholarship-2027) | 200 | Exact self-canonical | Yes | Pass |
| [kansas-merit-scholarships-gpa-rules](https://meritously.com/blog/kansas-merit-scholarships-gpa-rules) | 200 | Exact self-canonical | Yes | Pass |
| [kentucky-bluegrass-merit-scholarships-2027](https://meritously.com/blog/kentucky-bluegrass-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [live-mas-scholarship-2027-video-or-essay](https://meritously.com/blog/live-mas-scholarship-2027-video-or-essay) | 200 | Exact self-canonical | Yes | Pass |
| [louisiana-tops-performance-honors-class-2027](https://meritously.com/blog/louisiana-tops-performance-honors-class-2027) | 200 | Exact self-canonical | Yes | Pass |
| [lsu-merit-scholarships-test-optional-2027](https://meritously.com/blog/lsu-merit-scholarships-test-optional-2027) | 200 | Exact self-canonical | Yes | Pass |
| [merit-scholarship-service-requirements](https://meritously.com/blog/merit-scholarship-service-requirements) | 200 | Exact self-canonical | Yes | Pass |
| [merit-scholarship-study-abroad-program-types](https://meritously.com/blog/merit-scholarship-study-abroad-program-types) | 200 | Exact self-canonical | Yes | Pass |
| [merit-scholarship-test-score-upgrade-deadlines-2027](https://meritously.com/blog/merit-scholarship-test-score-upgrade-deadlines-2027) | 200 | Exact self-canonical | Yes | Pass |
| [merit-scholarships-co-op-semesters](https://meritously.com/blog/merit-scholarships-co-op-semesters) | 200 | Exact self-canonical | Yes | Pass |
| [miami-ohio-merit-scholarships-2027](https://meritously.com/blog/miami-ohio-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [mississippi-mesg-mtag-scholarships-comparison](https://meritously.com/blog/mississippi-mesg-mtag-scholarships-comparison) | 200 | Exact self-canonical | Yes | Pass |
| [mississippi-state-nonresident-merit-2027](https://meritously.com/blog/mississippi-state-nonresident-merit-2027) | 200 | Exact self-canonical | Yes | Pass |
| [mizzou-merit-scholarships-core-gpa-2027](https://meritously.com/blog/mizzou-merit-scholarships-core-gpa-2027) | 200 | Exact self-canonical | Yes | Pass (transport retry) |
| [morehead-cain-nomination-admissions-referral-2027](https://meritously.com/blog/morehead-cain-nomination-admissions-referral-2027) | 200 | Exact self-canonical | Yes | Pass |
| [national-merit-fifth-year-graduate-funding](https://meritously.com/blog/national-merit-fifth-year-graduate-funding) | 200 | Exact self-canonical | Yes | Pass |
| [nau-merit-scholarships-fall-2027](https://meritously.com/blog/nau-merit-scholarships-fall-2027) | 200 | Exact self-canonical | Yes | Pass |
| [nc-state-park-scholarship-recommendations-2027](https://meritously.com/blog/nc-state-park-scholarship-recommendations-2027) | 200 | Exact self-canonical | Yes | Pass |
| [ncwit-aspirations-computing-award-eligibility](https://meritously.com/blog/ncwit-aspirations-computing-award-eligibility) | 200 | Exact self-canonical | Yes | Pass |
| [nevada-reno-merit-scholarships-test-scores-2027](https://meritously.com/blog/nevada-reno-merit-scholarships-test-scores-2027) | 200 | Exact self-canonical | Yes | Pass |
| [new-nebraskan-scholarship-credit-hours-2027](https://meritously.com/blog/new-nebraskan-scholarship-credit-hours-2027) | 200 | Exact self-canonical | Yes | Pass |
| [new-york-stem-incentive-vs-excelsior-scholarship](https://meritously.com/blog/new-york-stem-incentive-vs-excelsior-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [nonresident-tuition-waiver-versus-scholarship](https://meritously.com/blog/nonresident-tuition-waiver-versus-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [november-2026-scholarship-deadlines](https://meritously.com/blog/november-2026-scholarship-deadlines) | 200 | Exact self-canonical | Yes | Pass |
| [ohio-state-national-buckeye-merit-scholarships-2027](https://meritously.com/blog/ohio-state-national-buckeye-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [oklahoma-nonresident-merit-scholarships-2027](https://meritously.com/blog/oklahoma-nonresident-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [oklahoma-promise-senior-deadline-income-checks](https://meritously.com/blog/oklahoma-promise-senior-deadline-income-checks) | 200 | Exact self-canonical | Yes | Pass |
| [ole-miss-automatic-competitive-scholarships-2027](https://meritously.com/blog/ole-miss-automatic-competitive-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [outside-scholarships-financial-aid-reduction](https://meritously.com/blog/outside-scholarships-financial-aid-reduction) | 200 | Exact self-canonical | Yes | Pass |
| [penguin-random-house-writing-awards-2027](https://meritously.com/blog/penguin-random-house-writing-awards-2027) | 200 | Exact self-canonical | Yes | Pass |
| [penn-state-discover-award-2-plus-2-campus-change](https://meritously.com/blog/penn-state-discover-award-2-plus-2-campus-change) | 200 | Exact self-canonical | Yes | Pass |
| [pitt-rolling-admission-merit-scholarship-deadline](https://meritously.com/blog/pitt-rolling-admission-merit-scholarship-deadline) | 200 | Exact self-canonical | Yes | Pass (transport retry) |
| [point-flagship-scholarship-2027-fit](https://meritously.com/blog/point-flagship-scholarship-2027-fit) | 200 | Exact self-canonical | Yes | Pass |
| [residency-change-nonresident-merit-scholarship](https://meritously.com/blog/residency-change-nonresident-merit-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [richmond-scholars-vs-presidential-scholarship](https://meritously.com/blog/richmond-scholars-vs-presidential-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [robertson-scholarship-duke-separate-application](https://meritously.com/blog/robertson-scholarship-duke-separate-application) | 200 | Exact self-canonical | Yes | Pass |
| [ron-brown-scholarship-2027-service-application](https://meritously.com/blog/ron-brown-scholarship-2027-service-application) | 200 | Exact self-canonical | Yes | Pass |
| [same-college-merit-awards-stacking-replacement](https://meritously.com/blog/same-college-merit-awards-stacking-replacement) | 200 | Exact self-canonical | Yes | Pass |
| [scholarship-application-submitted-vs-complete](https://meritously.com/blog/scholarship-application-submitted-vs-complete) | 200 | Exact self-canonical | Yes | Pass |
| [scholarship-plus-nyc-seniors-2027](https://meritously.com/blog/scholarship-plus-nyc-seniors-2027) | 200 | Exact self-canonical | Yes | Pass |
| [scholarship-renewal-earned-credit-calculation](https://meritously.com/blog/scholarship-renewal-earned-credit-calculation) | 200 | Exact self-canonical | Yes | Pass |
| [scholarship-superscore-single-sitting-rules](https://meritously.com/blog/scholarship-superscore-single-sitting-rules) | 200 | Exact self-canonical | Yes | Pass |
| [scholarship-warning-academic-probation-appeal](https://meritously.com/blog/scholarship-warning-academic-probation-appeal) | 200 | Exact self-canonical | Yes | Pass |
| [scholarships-campus-housing-requirements](https://meritously.com/blog/scholarships-campus-housing-requirements) | 200 | Exact self-canonical | Yes | Pass |
| [scholastic-art-writing-awards-2027-portfolio-deadlines](https://meritously.com/blog/scholastic-art-writing-awards-2027-portfolio-deadlines) | 200 | Exact self-canonical | Yes | Pass |
| [science-ambassador-scholarship-2027](https://meritously.com/blog/science-ambassador-scholarship-2027) | 200 | Exact self-canonical | Yes | Pass |
| [smart-scholarship-2027-service-commitment](https://meritously.com/blog/smart-scholarship-2027-service-commitment) | 200 | Exact self-canonical | Yes | Pass |
| [smu-hunt-leadership-scholarship-application-2027](https://meritously.com/blog/smu-hunt-leadership-scholarship-application-2027) | 200 | Exact self-canonical | Yes | Pass |
| [south-carolina-nonresident-merit-scholarships](https://meritously.com/blog/south-carolina-nonresident-merit-scholarships) | 200 | Exact self-canonical | Yes | Pass |
| [south-carolina-palmetto-fellows-counselor-application](https://meritously.com/blog/south-carolina-palmetto-fellows-counselor-application) | 200 | Exact self-canonical | Yes | Pass |
| [spring-entry-merit-scholarships-2027](https://meritously.com/blog/spring-entry-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [tcu-chancellors-scholarship-honors-application-2027](https://meritously.com/blog/tcu-chancellors-scholarship-honors-application-2027) | 200 | Exact self-canonical | Yes | Pass |
| [temple-merit-scholarship-renewal](https://meritously.com/blog/temple-merit-scholarship-renewal) | 200 | Exact self-canonical | Yes | Pass |
| [tennessee-hope-renewal-attempted-hours-course-drops](https://meritously.com/blog/tennessee-hope-renewal-attempted-hours-course-drops) | 200 | Exact self-canonical | Yes | Pass |
| [texas-state-assured-vs-test-optional-merit](https://meritously.com/blog/texas-state-assured-vs-test-optional-merit) | 200 | Exact self-canonical | Yes | Pass |
| [toledo-presidential-vs-merit-scholarships-2027](https://meritously.com/blog/toledo-presidential-vs-merit-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [tpc-mark-of-excellence-scholarship-texas](https://meritously.com/blog/tpc-mark-of-excellence-scholarship-texas) | 200 | Exact self-canonical | Yes | Pass |
| [tulane-full-tuition-scholarship-application-2027](https://meritously.com/blog/tulane-full-tuition-scholarship-application-2027) | 200 | Exact self-canonical | Yes | Pass |
| [uah-out-of-state-scholarships-2027](https://meritously.com/blog/uah-out-of-state-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [uconn-stamps-scholarship-2027-application](https://meritously.com/blog/uconn-stamps-scholarship-2027-application) | 200 | Exact self-canonical | Yes | Pass |
| [university-arizona-merit-scholarships-fall-2027](https://meritously.com/blog/university-arizona-merit-scholarships-fall-2027) | 200 | Exact self-canonical | Yes | Pass |
| [unm-amigo-arizona-reciprocal-scholarship](https://meritously.com/blog/unm-amigo-arizona-reciprocal-scholarship) | 200 | Exact self-canonical | Yes | Pass |
| [usc-merit-scholarship-deadlines-majors-2027](https://meritously.com/blog/usc-merit-scholarship-deadlines-majors-2027) | 200 | Exact self-canonical | Yes | Pass |
| [usf-national-merit-scholarship-package](https://meritously.com/blog/usf-national-merit-scholarship-package) | 200 | Exact self-canonical | Yes | Pass |
| [ut-arlington-freshman-scholarships-2027](https://meritously.com/blog/ut-arlington-freshman-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [ut-austin-forty-acres-scholarship-2027](https://meritously.com/blog/ut-austin-forty-acres-scholarship-2027) | 200 | Exact self-canonical | Yes | Pass |
| [wake-forest-signature-presidential-scholarships-2027](https://meritously.com/blog/wake-forest-signature-presidential-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |
| [wvu-foundation-bucklew-scholarships-2027](https://meritously.com/blog/wvu-foundation-bucklew-scholarships-2027) | 200 | Exact self-canonical | Yes | Pass |

No unresolved page response or canonical failures remained at completion.
