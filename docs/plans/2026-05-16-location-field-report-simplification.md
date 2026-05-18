# Location Field And Report Simplification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a required house location field, remove the report dimension cards from the UI, and strengthen the prompt so every input field is analyzed through feng shui, five-elements,八字/person-house,拆字,象意,地域水土, or real living comfort.

**Architecture:** Keep the response schema unchanged so backend normalization and report scoring stay compatible. Add `house.location` to the request path from form state to shared API payload, hide `report.dimensions` only in the React report view, and update prompt tests to guard all-field usage.

**Tech Stack:** React, TypeScript, node:test, Express, DashScope OpenAI-compatible messages.

---

### Task 1: Add Failing Tests

**Files:**
- Modify: `src/lib/fengshui-form.test.ts`
- Modify: `api/fengshui/report.test.ts`

**Steps:**
1. Add `location: "广东省深圳市南山区"` to the sample form and assert it appears in `payload.house.location`.
2. Add `location` to the sample prompt request.
3. Assert prompt text mentions地方、地域水土、房子所在地与出生地/person matching, and all input fields must be used.
4. Run targeted tests and confirm failure before implementation.

### Task 2: Implement Location Field

**Files:**
- Modify: `shared/fengshui.ts`
- Modify: `src/lib/fengshui-form.ts`
- Modify: `src/pages/Home.tsx`

**Steps:**
1. Add `location` to `FengshuiAnalyzeRequest.house` and `FengshuiFormState`.
2. Initialize `location` as an empty string and include trimmed value in `toAnalyzeRequest`.
3. Add a required mobile input labeled `小区所在省市区`.
4. Include the new field in completion count and submit disabled logic.
5. Run targeted tests until green.

### Task 3: Simplify Report UI And Prompt

**Files:**
- Modify: `src/components/ReportView.tsx`
- Modify: `api/fengshui/prompt.ts`

**Steps:**
1. Remove the visible `dimension-grid` section from `ReportView`.
2. Keep `dimensions` in the backend schema and model output requirements.
3. Update prompt wording so every input field must be explicitly considered.
4. Add地方/地域水土/person birthplace vs house location analysis requirements.

### Task 4: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`
