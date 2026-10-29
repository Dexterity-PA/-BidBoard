# Independent review: deadline display follow-up

Reviewed October 29, 2026 by design/QA worker after observing YoungArts in the live default hide-passed browse view.

Changed files reviewed: catalog.ts, deadline-status.ts, CatalogBrowser.tsx, topics/[topic]/page.tsx, deadline-status.test.ts.

The semicolon-clause filter removes the observed future YoungArts programme event from upcoming application-stage consideration. It preserves explicit later Army ROTC application rounds and Regions quarterly application dates. Earlier primary milestones sort after future primary deadlines; topic copy and row explanation warn that a later stage may require a prior application. No catalog dates were mechanically advanced.

Focused validation: `npx vitest run tests/deadline-status.test.ts`, five tests passed. Coverage includes the conservative date boundary, preserving explicit later rounds, excluding a programme and winner announcement, earlier-stage ordering, and concise listing metadata.

This remains a heuristic over provider text, not a structured application-status guarantee. A mixed event/application clause could still require editorial correction. Public production rendering of this follow-up has not yet been checked; the coordinating agent owns release and that subsequent check. Suggested small copy refinement: use an earlier-date label on retained later-stage rows rather than the generic Date passed badge.
