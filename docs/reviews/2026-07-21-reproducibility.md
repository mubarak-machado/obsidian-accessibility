# Code Review: 0.1.1 reproducibility verification

## Summary

The change adds a deterministic SHA-256 verifier for the three approved
release artifacts and records the clean-clone reproduction evidence.

## Critical issues

None.

## Resolved during review

The first draft implied that the new verifier had run in commit `f176807`
before the script existed. The record now distinguishes the original manual
hash comparison from the subsequent automated verification.

## Review dimensions

- **Security:** the script reads only three repository files, performs local
  SHA-256 hashing, and has no network, process-execution, or write path.
- **Correctness:** every expected artifact is keyed by filename; any mismatch
  sets a failing exit code and reports both expected and actual hashes.
- **Performance:** the verifier reads approximately 25 KB in total and runs
  once; resource use is bounded.
- **Maintainability:** baseline verification is an explicit command rather than
  part of the general future-development `check`, so later versioned work is
  not accidentally forced to reproduce `0.1.1`.

## Verdict

Approve.

Validation: clean-clone `npm ci`, `npm run check`, manual SHA-256 comparison,
`npm run verify:baseline`, and `git diff --check`.
