# Share Card MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a first version of viral sharing by exporting a mobile-friendly PNG share card with a QR code linking back to the website.

**Architecture:** Keep reports local and stateless. Build a pure payload helper for share-card content, then use browser Canvas plus a QR code data URL to draw and download the image from the result page.

**Tech Stack:** React, TypeScript, Canvas API, `qrcode`, node:test, Vite.

---

### Task 1: Add QR Dependency

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Steps:**
1. Install `qrcode` and `@types/qrcode`.
2. Keep the implementation client-side only.

### Task 2: Add Share Payload Tests

**Files:**
- Create: `src/lib/share-card.test.ts`
- Create: `src/lib/share-card.ts`

**Steps:**
1. Test that share payload keeps only top 3 strengths and top 3 concerns.
2. Test that the share URL defaults to `window.location.origin` compatible input.
3. Test that long text is shortened for a card.

### Task 3: Implement Canvas Export

**Files:**
- Modify: `src/lib/share-card.ts`

**Steps:**
1. Generate a QR data URL using `qrcode`.
2. Draw a 900x1400 portrait card with title, score, level, summary, top strengths, top concerns, QR code, and "同房不同命" CTA.
3. Export the canvas as a PNG data URL.
4. Add a download helper for browsers.

### Task 4: Add Report Button

**Files:**
- Modify: `src/components/ReportView.tsx`
- Modify: `src/index.css`

**Steps:**
1. Add a "生成分享图" button below the score card.
2. Show loading text while generating.
3. Download `宅合分享图.png` after generation.
4. Style the action as a mobile-first new-Chinese button.

### Task 5: Verify

**Commands:**
- `pnpm test`
- `pnpm check`
- `pnpm lint`
- `pnpm build`
