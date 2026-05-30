# Viral Sharing Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the report first screen, share-card templates, and sharing hooks so every result feels screenshot-worthy and naturally drives new tests.

**Architecture:** Keep the existing request and report flow, but add a derived "viral result" view-model layer that converts the long report into modern relationship tags, share copy, and card metadata. Render the new first screen and sharing area from that view-model, and teach the share-card generator to output multiple templates while preserving the fixed QR destination.

**Tech Stack:** React, TypeScript, Vite, Canvas share-card rendering, Node test runner, existing fengshui API contract

---

### Task 1: Lock the viral result model with failing tests

**Files:**
- Modify: `src/lib/report-viral.test.ts`
- Modify: `shared/fengshui.ts`
- Modify: `src/lib/report-viral.ts`

**Step 1: Write the failing test**

```ts
test('deriveViralReport builds modern labels and hooks from a report', () => {
  const result = deriveViralReport(report);

  assert.equal(result.relationshipTag, '推你型');
  assert.match(result.oneLineVerdict, /推着你往外走/);
  assert.equal(result.shareHook, '同一套房，不同人住，结果可能完全不一样');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/report-viral.test.ts`
Expected: FAIL because the helper or fields do not exist yet.

**Step 3: Write minimal implementation**

```ts
export function deriveViralReport(report: FengshuiAnalyzeResponse) {
  return {
    relationshipTag: '推你型',
    relationshipSubtitle: report.level,
    elementRelation: '待进一步判断',
    livingAdvice: report.strengths[0] ?? report.summary,
    riskHint: report.concerns[0] ?? '建议结合实地复核',
    oneLineVerdict: report.summary,
    shareHook: '同一套房，不同人住，结果可能完全不一样',
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/report-viral.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add shared/fengshui.ts src/lib/report-viral.ts src/lib/report-viral.test.ts
git commit -m "feat: add viral result view model"
```

### Task 2: Rebuild the report first screen around the viral result

**Files:**
- Modify: `src/components/ReportView.tsx`
- Modify: `src/index.css`
- Test: `src/components/ReportView.test.tsx` or a focused logic test if component tests are unavailable

**Step 1: Write the failing test**

```ts
test('ReportView prioritizes relationship tag, verdict, and share hooks in the first screen', () => {
  const ui = renderReportView(report);
  assert.match(ui, /推你型/);
  assert.match(ui, /一句话判断/);
  assert.match(ui, /换个人再测/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/ReportView.test.tsx`
Expected: FAIL because the current first screen still renders only score, level, and summary.

**Step 3: Write minimal implementation**

```tsx
const viral = deriveViralReport(report);

<section className="result-hero">
  <span>{viral.relationshipTag}</span>
  <h2>{viral.relationshipSubtitle}</h2>
  <p>{viral.oneLineVerdict}</p>
  <div>{viral.elementRelation}</div>
  <div>{viral.livingAdvice}</div>
  <div>{viral.riskHint}</div>
</section>
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/components/ReportView.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ReportView.tsx src/index.css src/components/ReportView.test.tsx
git commit -m "feat: redesign viral result first screen"
```

### Task 3: Add multiple share-card templates and template selection

**Files:**
- Modify: `src/lib/share-card.ts`
- Modify: `src/lib/share-card.test.ts`
- Modify: `src/components/ReportView.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing test**

```ts
test('buildShareCardPayload returns the viral headline fields and template-specific payload', () => {
  const payload = buildShareCardPayload(report, OFFICIAL_SHARE_URL, 'rednote');

  assert.equal(payload.relationshipTag, '推你型');
  assert.equal(payload.template, 'rednote');
  assert.equal(payload.shareUrl, OFFICIAL_SHARE_URL);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/share-card.test.ts`
Expected: FAIL because payload does not yet include template or viral fields.

**Step 3: Write minimal implementation**

```ts
export type ShareCardTemplate = 'wechat' | 'rednote' | 'story';

export function buildShareCardPayload(report, shareUrl, template) {
  const viral = deriveViralReport(report);
  return { template, shareUrl, ...viral, score: report.score };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/share-card.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/share-card.ts src/lib/share-card.test.ts src/components/ReportView.tsx src/index.css
git commit -m "feat: add viral share card templates"
```

### Task 4: Add propagation hooks and retest copy

**Files:**
- Modify: `src/components/ReportView.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing test**

```ts
test('viral share section includes comparison hooks and retest CTA copy', () => {
  const ui = renderReportView(report);
  assert.match(ui, /同房不同命/);
  assert.match(ui, /换一个人再测/);
  assert.match(ui, /发给家人朋友/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/ReportView.test.tsx`
Expected: FAIL because the current share area only includes a download button.

**Step 3: Write minimal implementation**

```tsx
<section className="viral-hooks">
  <p>同一套房，不同人住，结果可能完全不一样。</p>
  <button type="button">换一个人再测</button>
  <p>把结果发给家人朋友，看看谁更适合这套房。</p>
</section>
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/components/ReportView.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ReportView.tsx src/pages/Home.tsx src/index.css
git commit -m "feat: add viral sharing hooks"
```

### Task 5: Run verification and open the local preview

**Files:**
- Verify only

**Step 1: Run focused tests**

Run: `pnpm test src/lib/report-viral.test.ts src/lib/share-card.test.ts api/fengshui/llm.test.ts`
Expected: PASS

**Step 2: Run full checks**

Run: `pnpm check && pnpm build`
Expected: PASS with no type errors

**Step 3: Start local dev server**

Run: `pnpm dev -- --host 0.0.0.0`
Expected: Vite starts and prints a local preview URL

**Step 4: Smoke test in browser**

Open the preview URL, submit sample data, generate each share template, and verify the first screen layout, CTA copy, and download flows.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: ship viral sharing refactor"
```
