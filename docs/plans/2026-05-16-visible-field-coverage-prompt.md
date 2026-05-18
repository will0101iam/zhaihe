# Visible Field Coverage Prompt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strengthen the LLM prompt so every user-provided field is visibly reflected in the generated report with detailed, evidence-based, traditionally grounded reasoning.

**Architecture:** Keep the existing response schema unchanged. Update prompt text only, and extend prompt tests to assert visible field coverage, industry/company/work-industry coverage, and detailed reasoning requirements.

**Tech Stack:** TypeScript, node:test, DashScope OpenAI-compatible chat completions.

---

### Task 1: Add Failing Prompt Assertions

**Files:**
- Modify: `api/fengshui/report.test.ts`

**Steps:**
1. Assert the prompt requires the final report to make every filled field visibly traceable.
2. Assert the prompt requires nearby industry, company names, and user work industry to appear in the report body, not only internal reasoning.
3. Assert the prompt requires a reasoning chain: evidence, five-elements/象意/典籍脉络, impact, and suggestion.
4. Run `pnpm test api/fengshui/report.test.ts` and confirm failure.

### Task 2: Update Prompt

**Files:**
- Modify: `api/fengshui/prompt.ts`

**Steps:**
1. Add instructions that `summary`, `strengths`, `concerns`, `dimensions`, and `suggestions` must collectively show every filled field was used.
2. Add explicit coverage requirements for `dominantIndustry`, `industryNote`, `nearbyCompanies`, and `workIndustry`.
3. Require detailed logical writing with references to traditional feng shui classics or concepts, without fabricating exact quotations.
4. Run targeted tests until green.

### Task 3: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`
