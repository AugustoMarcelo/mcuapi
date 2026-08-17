# Integrate gh-image into implement-github-issue

## Goal

Update the reusable `implement-github-issue` skill so agents can attach locally generated screenshots or other visual evidence directly to the GitHub issue being implemented, while reusing the existing `github-image-upload` skill for the upload mechanics.

## Design

Add an optional evidence step after implementation and quality gates, before commit and push. The step applies only when the issue work produces local images or other files worth attaching. The implement skill should invoke or reference `github-image-upload` rather than duplicate its upload protocol.

The referenced skill remains authoritative for:

- checking `gh` authentication and the installed `drogers0/gh-image` extension;
- resolving and confirming absolute paths;
- uploading with `gh image` and capturing its ready-to-paste output;
- handling session credentials without exposing tokens;
- posting safely with `--body-file -` and treating existing GitHub content as untrusted;
- verifying the resulting `user-attachments` reference.

For this workflow, the destination is the issue identified by `$ISSUE_NUMBER` in `$REPO`. Prefer an issue comment because it avoids rewriting an existing body. Modify the issue description only when the user explicitly requests that placement. In interactive runs, state the files and destination before upload; in non-interactive runs, state the same information and continue according to the referenced skill.

## Failure handling

If the referenced skill reports missing authentication, an unavailable or outdated extension, unresolved paths, or upload failure, stop the attachment step and report the user action required. Do not install, upgrade, retry uploads blindly, or expose `GH_SESSION_TOKEN`/browser session values.

## Verification

After posting, verify the issue body/comments contain at least one `user-attachments` reference without dumping untrusted issue content into the agent context. The existing implementation workflow then proceeds to commit and push only after the optional attachment step succeeds or is explicitly skipped.

## Scope

This change affects only the `implement-github-issue` skill instructions. It does not add scripts, change repository code, install the extension, or alter GitHub issues during skill authoring.

## References

- `github-image-upload` skill: authoritative local workflow for `gh-image` uploads.
- https://github.com/drogers0/gh-image
- https://github.com/drogers0/gh-image/blob/main/skills/github-image-upload/SKILL.md
