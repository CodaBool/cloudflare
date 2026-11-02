---
name: upgrade
description: Yearly upgrade of every project's npm dependencies and GitHub Actions, then review, retro, and ship.
disable-model-invocation: true
---

An interactive yearly upgrade. The user is at the keyboard: stop and ask with AskUserQuestion wherever a step says to.

Run every command from the repo root unless a step says otherwise. A **project** is any folder with a `package.json`, found by:

```sh
find . -name package.json -not -path '*/node_modules/*' -not -path './vault/*' -printf '%h\n' | sort
```

## Steps

### 1. List the major bumps

For each project, print its available upgrades grouped by semver level:

```sh
(cd <project> && npx npm-check-updates --format group)
```

Collect only the **Major** group of each project. Done when every project has a list of major bumps (an empty list counts).

**Stop early** when no project has any bump at all (every project prints "All dependencies match the latest package versions"): run step 5 next. If step 5 also leaves every `uses:` line unchanged, skip to step 7, then end with the report and no commit.

### 2. Assess the risk of each major bump

Every package gets upgraded to latest; this step maps what the upgrade will break so the migration is planned, not discovered.

For every major bump, find its **breaking changes**: fetch the package's changelog or GitHub release notes for each major version crossed (e.g. 3→5 means reading 4 and 5). Then grep that project's own code (not `node_modules`) and its config files (`wrangler.toml`, `vite.config.js`, ...) for each API, option, or behaviour a breaking change touches.

Rate the bump:

- **none**: no breaking change touches this project's code or config.
- **migrate**: a breaking change touches it; name each file:line and the edit the migration needs.

Done when every major bump in every project has a rating backed by a release note you actually read. Show the user a table per project (package, from → to, rating, evidence, planned edits) and wait for their go-ahead.

### 3. Apply

In each project, upgrade everything, then make the planned migration edits:

```sh
(cd <project> && npx npm-check-updates -u && npm i)
```

Done when every project's `package.json` and lockfile are updated, `npm i` exited 0, and every **migrate** edit from step 2 is in place.

### 4. Test

In each project, do what its `test.md` says. Done when every project's test passes. When a test fails, find which bump caused it from its release notes, migrate the code, and re-run that project's test. Show the user any failure whose fix isn't clear from the release notes.

### 5. Upgrade GitHub Actions

In every file under `.github/workflows/`, each `uses: owner/action@vN` has a URL comment on the line above it. Open that URL with WebFetch and read the latest release's major version. When the page doesn't show it, fall back to `gh release view -R owner/action`. Set the `uses:` line to `@v<latest major>`.

When the major changed, read that action's release notes for breaking changes to the inputs this workflow passes under its `with:`, and fix them. Done when every `uses:` line is on its latest major.

### 6. Review

Call the Skill tool with `code-review`, fixed point `HEAD`, so it reviews the uncommitted upgrade. Show the user the findings and fix the ones they approve.

### 7. Retro

Call the Skill tool with `retro` on this session. Present its candidates to the user, and apply the ones they approve. Improvements to this skill belong in `.claude/skills/upgrade/SKILL.md`.

### 8. Ship

A push to `main` deploys every changed worker (see `AGENTS.md`), so this step ships:

```sh
git add . && git commit -m "auto $(date +%Y)" && git push
```

Finish with a report: the bumps applied, the migration edits, the test results, and the actions upgraded.
