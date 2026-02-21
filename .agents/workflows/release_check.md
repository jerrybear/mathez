---
description: Verify implementation against plan, prepare release artifacts, and execute git release commands.
---

1. Read `implementation_plan.md` and `task.md` to understand the current release scope.
2. Cross-check the actual codebase against the `Proposed Changes` in `implementation_plan.md` to guarantee that all intended features and modifications have been correctly and completely implemented in the code.
3. Run automated verification:
   - Run `npm test` to ensure all tests pass.
   - Run `npm run build` to ensure the project builds successfully.
4. If verification fails, stop and report issues.
5. If verification passes, ask the user for the new version number (e.g., "1.0.6").
6. Update `package.json` with the new version.
7. Update `CHANGELOG.md` with a new entry for the version, using the changes from `implementation_plan.md` or recent commits.
8. Run `git add .` to stage changes.
9. Run `git commit -m "chore: release v<VERSION>"` (replace <VERSION> with the actual version).
10. Run `git tag v<VERSION>`.
11. Run `git push origin HEAD` and `git push origin v<VERSION>`.