# Codex Instructions (Spec-Driven Development)

## Source of truth
- Treat `docs/spec.md` as the primary contract for behavior, scope, UX, and acceptance criteria.
- If the spec is missing or ambiguous, ask a clarifying question before coding.

## Workflow (always follow)
1) Read the relevant section(s) of `docs/spec.md` for the task at hand.
2) Propose a short plan (2–5 steps) that references the spec section(s).
3) Implement the change with minimal, focused edits.
4) Update `docs/spec.md` when behavior, scope, or acceptance criteria change.
5) Suggest tests or verification steps aligned with the spec.

## Required response content
- Cite the exact spec subsection you used (quote a short phrase).
- List files you changed.
- Note any assumptions made that are not explicitly in the spec.

## Definition of done
- Implementation matches spec behavior and edge cases.
- Spec remains accurate and up to date.
- Tests or verification steps are clearly stated.

## Boundaries
- Do not invent features outside the spec.
- Prefer small, incremental changes over broad refactors.
- Avoid modifying unrelated files.

## Coding Rules
- comment should follow the JSDoc 3 standard.
- Add function comments.
- Add class comments.
- Add comments for any major code chunk that seems too complex.
