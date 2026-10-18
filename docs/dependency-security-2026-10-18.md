# Dependency security follow-up — 2026-10-18

The targeted dependency patch passed a clean GitHub Actions install, release
checks, and the existing production security gate in
[run 39112392032](https://github.com/Dexterity-PA/-BidBoard/actions/runs/39112392032).
The audit reported **0 production vulnerabilities**. Final CI for the combined
feature branch is still pending; this isolated dependency run does not validate
the feature changes being developed alongside it.

## Runtime security updates

- `next` and `eslint-config-next` are pinned to exactly 16.3.8, with matching
  Next.js environment, SWC, and ESLint plugin packages in the lockfile. The
  official [16.3.8 release](https://github.com/vercel/next.js/releases/tag/v16.3.8)
  contains security fixes, including the image optimization SSRF finding.
- All locked `source-map-js` instances now resolve to 1.2.2 through their
  existing compatible PostCSS dependency ranges. The
  [source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)
  affects versions from 1.0.0 through 1.2.1.

Registry access was unavailable in the local shell. A temporary workflow on the
isolated `codex/security-lock-2026-10-18` branch generated the targeted lockfile
updates with npm on Node 22. The generated manifest/lockfile diff was retrieved
from the CI logs, reviewed, and applied locally. No integrity values were
fabricated. The temporary workflow is excluded from the final feature tree.

The reviewed lockfile changes upgrade only the Next.js package family,
`eslint-config-next`, and `source-map-js` (13 package entries). The package set
is unchanged. npm also recalculated development dependency flags and removed
`libc` metadata from 34 unchanged optional native package entries; their
versions, registry URLs, integrity values, CPU, and OS metadata are unchanged.
The clean Linux CI install passed. Other platform/native package selection has
not been revalidated by this run.

## Build dependency classification

`tailwindcss-animate` is loaded only by `tailwind.config.ts`, through the PostCSS
build pipeline in `postcss.config.mjs`. Application styles are compiled from
`app/globals.css`; the running application does not load this plugin. It now
belongs in `devDependencies`, alongside Tailwind and PostCSS. Build environments
must continue installing development dependencies before compiling the app.

The corrected development dependency flags remove Tailwind 3, micromatch, and
braces from the production dependency graph. The runtime upgrades above remain
visible to the production audit; no audit exclusions or severity thresholds
were changed.

This does not patch braces in build tooling. The current
[braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects
versions through 3.0.3 and lists no patched version. Keep build inputs trusted
and track the upstream fix or a separately reviewed Tailwind migration. The
existing production audit command and its severity threshold remain unchanged.

The full development dependency audit still needs separate review, including
braces and the older PostCSS selector parser. Correct build dependency
classification is not a claim that these packages have been patched.

## Verification and remaining release checks

- Isolated CI: `npm ci` passed; `npm run check:release` passed route type
  generation, TypeScript checks, and all 340 tests across 32 files;
  `npm audit --omit=dev --audit-level=high` reported 0 vulnerabilities.
- Local review confirmed synchronized manifest/lockfile roots, exact 16.3.8
  pins and Next.js internal version alignment, source-map-js 1.2.2, registry
  URLs and SHA-512 integrity entries, and development flags for build tooling.
- Earlier local Tailwind compilation passed and emitted the animation plugin's
  `enter` and `exit` keyframes.
- Local `node_modules` still contains Next.js 16.3.6. Local test results using
  that installation do not validate the upgraded runtime. Final combined branch
  CI must perform a clean install from the committed lockfile, release checks,
  and the unchanged production audit before merge.
- A production build in its configured environment remains to be verified.
  The repository's build command includes database migrations and catalog
  synchronization; the isolated dependency run did not execute those steps.
