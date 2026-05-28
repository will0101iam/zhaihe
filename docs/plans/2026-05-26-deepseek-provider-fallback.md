# DeepSeek Provider Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a highest-priority DeepSeek direct provider that falls back to the existing DashScope model chain when DeepSeek fails.

**Architecture:** Keep the current DashScope per-model fallback logic intact and add one outer provider fallback layer above it. The route resolves provider config from environment, tries DeepSeek first, and only if DeepSeek fails does it invoke the existing DashScope chain.

**Tech Stack:** TypeScript, Express, native fetch, node:test, tsx

---

### Task 1: Provider Fallback Tests

**Files:**
- Modify: `api/fengshui/llm.test.ts`

**Step 1: Write the failing test**

Add tests that assert:
- DeepSeek success returns immediately without touching DashScope
- DeepSeek failure falls back to DashScope
- DashScope model fallback still only triggers on free-tier exhaustion

**Step 2: Run test to verify it fails**

Run: `pnpm test api/fengshui/llm.test.ts`
Expected: FAIL because provider-level fallback does not exist yet

**Step 3: Write minimal implementation**

Add provider-aware config support and route orchestration with the smallest public surface needed.

**Step 4: Run test to verify it passes**

Run: `pnpm test api/fengshui/llm.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add api/fengshui/llm.test.ts api/fengshui/llm.ts api/routes/fengshui.ts
git commit -m "feat: add deepseek provider fallback"
```

### Task 2: Environment And Messaging

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `api/routes/fengshui.ts`

**Step 1: Write the failing test**

Add or update expectations for default provider wording and environment-driven fallback ordering.

**Step 2: Run test to verify it fails**

Run: `pnpm test api/fengshui/report.test.ts`
Expected: FAIL if defaults or notices still only describe DashScope

**Step 3: Write minimal implementation**

Document:
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_API_URL`
- `DEEPSEEK_MODEL`
- Existing DashScope variables as secondary provider

**Step 4: Run test to verify it passes**

Run: `pnpm test api/fengshui/report.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .env.example README.md api/routes/fengshui.ts api/fengshui/report.test.ts
git commit -m "docs: document deepseek provider fallback"
```

### Task 3: Full Verification

**Files:**
- Verify: `api/fengshui/llm.ts`
- Verify: `api/routes/fengshui.ts`
- Verify: `.env.example`
- Verify: `README.md`

**Step 1: Run targeted tests**

Run: `pnpm test api/fengshui/llm.test.ts`
Expected: PASS

**Step 2: Run type check**

Run: `pnpm check`
Expected: PASS

**Step 3: Run production build**

Run: `pnpm build`
Expected: PASS

**Step 4: Prepare server rollout**

Document:
- update server `.env`
- `git pull origin main`
- `pnpm install`
- `pnpm build`
- `pm2 restart zhaihe-api`

**Step 5: Commit**

```bash
git add docs/plans/2026-05-26-deepseek-provider-fallback.md
git commit -m "docs: add deepseek fallback plan"
```
