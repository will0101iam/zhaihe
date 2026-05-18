# Fengshui Master Prompt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the conservative assistant prompt with a more authoritative Chinese feng shui master prompt while preserving the existing request and response schema.

**Architecture:** Keep `buildLlmMessages()` and the OpenAI-compatible multimodal message format unchanged. Update prompt text only, add tests for the new role, floor-plan orientation rule, name/community/company拆字五行 analysis, and stronger evidence-based judgment.

**Tech Stack:** TypeScript, node:test, Express, DashScope OpenAI-compatible chat completions.

---

### Task 1: Update Prompt Tests

**Files:**
- Modify: `api/fengshui/report.test.ts`

**Steps:**
1. Replace the old conservative prompt assertion with assertions for feng shui master role.
2. Assert floor-plan image orientation rule: bottom is south, top is north, left is west, right is east.
3. Assert community name, person name, industry, and company names are analyzed through拆字、五行、象意.
4. Run `pnpm test api/fengshui/report.test.ts` and confirm the test fails before prompt implementation.

### Task 2: Update Prompt Text

**Files:**
- Modify: `api/fengshui/prompt.ts`

**Steps:**
1. Rewrite the system prompt to define a Chinese feng shui master with knowledge of堪舆、八宅、玄空、五行、姓名拆字、典籍象意.
2. Rewrite the user prompt to require bold, direct, evidence-based judgments.
3. Add floor-plan image coordinate convention: image bottom is south, top is north, left is west, right is east.
4. Preserve response fields and JSON-only output constraints.
5. Run targeted tests until green.

### Task 3: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm build`
