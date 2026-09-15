<!-- specify-context: unfilled -->
# Build Plan

Ordered list of feature units. Each unit becomes one spec
file in this folder (`NN-kebab-name.md`).

Update this file when units are added, reordered, or specced.

| # | Unit | What it builds | Depends on | Spec |
| --- | --- | --- | --- | --- |
| 1 | [Unit name] | [One visible, verifiable result] | None | missing |
| 2 | [Unit name] | [One visible, verifiable result] | 1 | missing |

## Ordering rules

- Dependencies first — never build on something that does not exist yet
- Security and access control before the features they protect
- Backend before frontend wiring
- UI shells with placeholder data before real API calls
- Install a package in the unit that first unlocks real behavior

## Notes

- [Why this order / what was deferred and why]
