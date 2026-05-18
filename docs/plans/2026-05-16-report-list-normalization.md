# Report List Normalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent `strengths` and `concerns` from falling back to generic one-line defaults when the model returns richer but differently shaped list items.

**Architecture:** Keep the public response schema unchanged: `strengths` and `concerns` remain visible `string[]` fields, while `suggestions` remains an object array. Make the prompt explicitly state the required JSON types and make backend normalization tolerant of object-array list items by converting useful text fields into strings instead of dropping them.

**Tech Stack:** TypeScript, node:test, Express backend normalization, DashScope OpenAI-compatible chat completions.

---

### Task 1: Add Failing Tests

**Files:**
- Modify: `api/fengshui/report.test.ts`

**Steps:**
1. Add prompt assertions that `strengths` and `concerns` must be `string[]`, not object arrays.
2. Add normalization test showing object-array list items are converted into visible strings.
3. Add normalization test showing long lists are not truncated.
4. Run targeted tests and confirm failures before implementation.

### Task 2: Update Prompt Contract

**Files:**
- Modify: `api/fengshui/prompt.ts`

**Steps:**
1. Explicitly define `strengths` as `string[]`.
2. Explicitly define `concerns` as `string[]`.
3. Explicitly forbid object arrays for those two fields.
4. Keep `suggestions` as `{ title, reason, action }[]`.

### Task 3: Harden Normalization

**Files:**
- Modify: `api/fengshui/report.ts`

**Steps:**
1. Replace strict string-only filtering with a helper that accepts strings and selected object text fields.
2. Remove `slice()` limits from string lists.
3. Remove `slice()` limit from suggestions.
4. Preserve fallback only when no useful text exists.

### Task 4: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`
