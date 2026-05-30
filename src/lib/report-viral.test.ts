import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';
import { SHARE_HOOKS, deriveViralReport, getShareTemplateOptions } from './report-viral.js';

const pushyReport: FengshuiAnalyzeResponse = {
  score: 82,
  level: '比较适合',
  summary: '这套房会推着你往外走，事业节奏会更快，但未必能让你真正放松。',
  strengths: ['木火相生，外局更利行动力和曝光度。', '适合事业上升期居住，能把人往外推。'],
  concerns: ['久住容易精神紧绷，回家后也不太容易松下来。'],
  suggestions: [{ title: '留白降压', reason: '动能太强', action: '软装和作息都要刻意给自己留白。' }],
  confidence: { level: '中', missingInfo: ['实地噪音'] },
  disclaimer: '仅供参考',
};

const drainingReport: FengshuiAnalyzeResponse = {
  ...pushyReport,
  score: 54,
  level: '需要谨慎',
  summary: '这套房短住可以，久住会让人越来越累。',
  strengths: ['短期过渡还算能住。'],
  concerns: ['水火相激，气场容易让人反复焦躁。', '久住容易内耗，不适合长期慢住。'],
};

test('deriveViralReport builds a screenshot-worthy result for a pushy report', () => {
  const viral = deriveViralReport(pushyReport);

  assert.equal(viral.relationshipTag, '推你型');
  assert.equal(viral.relationshipType, '互补养成型');
  assert.equal(viral.elementRelation, '木火相生');
  assert.match(viral.livingAdvice, /事业上升期/);
  assert.match(viral.riskHint, /精神紧绷/);
  assert.match(viral.oneLineVerdict, /推着你往外走/);
  assert.equal(viral.shareHook, SHARE_HOOKS.comparison);
});

test('deriveViralReport prefers cautionary tags when the report warns about long-term drain', () => {
  const viral = deriveViralReport(drainingReport);

  assert.equal(viral.relationshipTag, '内耗型');
  assert.equal(viral.relationshipType, '高压紧绷型');
  assert.equal(viral.elementRelation, '水火相激');
  assert.match(viral.riskHint, /久住/);
});

test('getShareTemplateOptions exposes all supported sharing templates', () => {
  const templates = getShareTemplateOptions();

  assert.deepEqual(
    templates.map((item) => item.id),
    ['wechat', 'rednote', 'story'],
  );
  assert.equal(templates[1]?.title, '小红书结果卡');
});
