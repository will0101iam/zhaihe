# DashScope Qwen Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Minimax default integration with Alibaba Cloud DashScope Qwen 3.6 Flash while preserving required image understanding behavior.

**Architecture:** Keep the existing OpenAI-compatible chat-completions payload shape. Rename provider-specific code toward a generic LLM client, default configuration to DashScope, and keep the hard failure when uploaded floor plan images are not actually understood.

**Tech Stack:** TypeScript, Express, React, node:test, OpenAI-compatible `/chat/completions` HTTP API.

---

### Task 1: Add Qwen/DashScope Client Tests

**Files:**
- Modify: `api/fengshui/report.test.ts`
- Modify: `api/fengshui/llm.test.ts`

**Steps:**
1. Write failing tests asserting default model is `qwen3.6-flash` and default API URL is `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`.
2. Write/keep a test asserting uploaded `floorPlanImage` becomes an `image_url` content block.
3. Run `pnpm test api/fengshui/report.test.ts api/fengshui/llm.test.ts` and verify failure before implementation.

### Task 2: Refactor Provider Client

**Files:**
- Modify or create: `api/fengshui/llm.ts`
- Modify: `api/routes/fengshui.ts`
- Modify: `api/fengshui/prompt.ts`

**Steps:**
1. Rename Minimax-specific defaults/functions to provider-neutral names.
2. Use `DASHSCOPE_API_KEY`, `DASHSCOPE_API_URL`, and `DASHSCOPE_MODEL`.
3. Preserve JSON extraction, response normalization, and vision-failure guard.
4. Run targeted tests and make them pass.

### Task 3: Update Configuration and Docs

**Files:**
- Modify: `.env.example`
- Modify: `.env`
- Modify: `README.md`

**Steps:**
1. Update `.env.example` to DashScope variables without secrets.
2. Write the provided DashScope API key only into local `.env`.
3. Update README to mention Qwen 3.6 Flash and image input requirements.
4. Verify `.env` remains ignored.

### Task 4: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`

**Manual smoke:**
- Use a tiny image request against DashScope to verify the model receives an image before claiming image understanding works.
