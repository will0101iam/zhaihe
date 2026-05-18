# Remove Dimensions Response Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove `dimensions` from the feng shui report response and make visible report fields carry all key analysis.

**Architecture:** Delete `dimensions` from the shared response type, normalization, demo report, tests, and prompt requirements. Keep the existing visible report sections: `summary`, `strengths`, `concerns`, `suggestions`, `confidence`, and `disclaimer`.

**Tech Stack:** TypeScript, React, Express, node:test, DashScope OpenAI-compatible chat completions.

---

### Task 1: Write Failing Tests

**Files:**
- Modify: `api/fengshui/report.test.ts`
- Modify: `api/fengshui/llm.test.ts`
- Modify: `src/lib/analyze-api.test.ts`

**Steps:**
1. Remove `dimensions` from test fixtures.
2. Assert normalized reports do not expose `dimensions`.
3. Assert prompt no longer mentions `dimensions`.
4. Run targeted tests and confirm failure before implementation.

### Task 2: Remove Dimensions From Response

**Files:**
- Modify: `shared/fengshui.ts`
- Modify: `api/fengshui/report.ts`
- Modify: `api/fengshui/llm.ts`

**Steps:**
1. Delete `dimensions` from `FengshuiAnalyzeResponse`.
2. Delete dimension normalization and demo report data.
3. Update image-vision failure guard to inspect visible fields only.

### Task 3: Update Prompt

**Files:**
- Modify: `api/fengshui/prompt.ts`

**Steps:**
1. Remove `dimensions` from required output fields.
2. Replace field coverage instructions with `summary`, `strengths`, `concerns`, and `suggestions`.
3. Keep no fixed item count requirement.

### Task 4: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`
