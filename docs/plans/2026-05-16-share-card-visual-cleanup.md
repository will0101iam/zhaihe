# Share Card Visual Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the share entry more obvious and simplify the generated PNG so it looks clean on mobile social feeds.

**Architecture:** Keep the existing client-only Canvas export and QR code dependency. Reduce share-card content density, move to clearer card sections, and upgrade the report-page button into a prominent action panel.

**Tech Stack:** React, TypeScript, Canvas API, CSS, node:test.

---

### Task 1: Tighten Share Payload

**Files:**
- Modify: `src/lib/share-card.test.ts`
- Modify: `src/lib/share-card.ts`

**Steps:**
1. Update tests to expect 2 strengths and 2 concerns.
2. Shorten summary for a stronger hero card.
3. Run the targeted test and confirm it fails before implementation.

### Task 2: Redesign Canvas Layout

**Files:**
- Modify: `src/lib/share-card.ts`

**Steps:**
1. Replace dense fixed sections with larger separated cards.
2. Use only two strengths and two concerns.
3. Use numbered/pill labels instead of many small bullets.
4. Keep QR code and "同房不同命" CTA visible.

### Task 3: Improve Share Entry UI

**Files:**
- Modify: `src/components/ReportView.tsx`
- Modify: `src/index.css`

**Steps:**
1. Replace the small button label with a more explicit action panel.
2. Add primary title, subtitle, and right-side icon.
3. Keep disabled/loading state clear.

### Task 4: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`
