# Qwen 3.5 Flash Model Switch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change the active DashScope model from Qwen 3.6 Flash to Qwen 3.5 Flash.

**Architecture:** Keep the existing DashScope OpenAI-compatible chat completions integration, API URL, authentication, prompt, and image message format unchanged. Only update the model identifier used by defaults, example configuration, local runtime configuration, documentation, and tests.

**Tech Stack:** TypeScript, Express, DashScope OpenAI-compatible chat completions, node:test.

---

### Task 1: Update Model Test

**Files:**
- Modify: `api/fengshui/report.test.ts`

**Steps:**
1. Change the default model expectation to `qwen3.5-flash`.
2. Run the targeted test and confirm it fails while production code still uses `qwen3.6-flash`.

### Task 2: Update Runtime Configuration

**Files:**
- Modify: `api/fengshui/llm.ts`
- Modify: `.env.example`
- Modify: `.env`
- Modify: `README.md`
- Modify: `api/routes/fengshui.ts`
- Modify: `api/fengshui/llm.test.ts`

**Steps:**
1. Change `DEFAULT_LLM_MODEL` to `qwen3.5-flash`.
2. Change example and local `DASHSCOPE_MODEL` to `qwen3.5-flash`.
3. Update user-facing wording from Qwen 3.6 Flash to Qwen 3.5 Flash.

### Task 3: Verify And Restart

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`

**Steps:**
1. Run verification commands.
2. Restart the backend dev server so `.env` is reloaded.
