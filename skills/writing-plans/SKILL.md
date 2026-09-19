---
name: writing-plans
description: Use when the user asks for a plan or outline, or provides requirements for a multi-step task that needs planning before implementation
---

# Writing Plans

Write a concise outline of **what to deliver, in what order, and how to verify it**. Resolve implementation details while implementing each task.

## Process

1. Read the request and any existing spec. Inspect only enough of the codebase to identify affected areas and dependencies.
2. State the goal, scope, and known constraints. Ask about missing information only when it changes the goal or approach; label non-blocking assumptions.
3. Group work by deliverable. Each task names the change, affected area, and observable acceptance criteria. Include dependencies only where order matters.
4. Check once that the outline covers the request, stays in scope, and gives each task a way to verify completion.

## Level of Detail

- A small change can be one task; most plans need only a few tasks. Keep each task to a few lines rather than dividing it into timed actions.
- Use existing module or file paths when known. Describe new responsibilities without locking in filenames, line numbers, or internal signatures.
- State required behavior and important failure cases. Leave implementation code, test bodies, and command-by-command procedures to execution.
- Record an interface contract only when it is already required by the request or an existing dependency.
- Reference an existing spec instead of copying it. A separate spec is optional; the user's requirements can be the source.

## Outline Format

Use the user's language for the content. Keep `### Task N:` headings in saved plans so the existing task extraction tool can read them. Omit optional sections that add no information.

```markdown
# [Feature] Plan

**Goal:** [Observable result]
**Scope:** [Affected areas and relevant boundaries]
**Spec:** [Existing reference, if any]

## Global Constraints
[Only known constraints that apply across tasks; omit if none]

### Task 1: [Deliverable]
- [ ] Change: [Behavior to add or change; affected module/file if known]
- Verify: [Specific expected outcome and an appropriate check]
- Depends on: [Earlier task, only if needed]

### Task 2: [Deliverable]
- [ ] Change: [...]
- Verify: [...]

## Open Questions
[Only unresolved decisions that affect implementation; omit if none]
```

For example, a search task can say: “Add case-insensitive title filtering to the existing list. Verify that mixed-case queries match, clearing the query restores all items, and no matches shows the empty state.” Choose the filter implementation during execution.

## Delivery

For a multi-step plan, save to `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` unless the user specifies another location or an inline-only answer. A one-task outline can stay in the response.

Link the saved plan. If the user requested planning only, finish with the outline. If they already authorized implementation, continue with their chosen execution method, or implement in the current session when none was specified. Invoke another workflow skill only when the user selected it; planning does not require a review agent or an execution-method selection step. If the user explicitly requested approval before implementation, wait for that approval.
