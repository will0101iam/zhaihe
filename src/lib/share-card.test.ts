import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildShareCardPayload } from './share-card.js';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

const report: FengshuiAnalyzeResponse = {
  score: 82,
  level: '比较适合',
  summary: '这套房与用户整体比较适合，但外局水势和产业气场仍需细看。',
  strengths: ['南向采光纳阳。', '小区名有水木象。', '楼层处于中高段。', '互联网产业与工作行业同频。'],
  concerns: ['东侧水势需要确认。', '附近公司人流偏旺。', '户型厨卫位置需复核。', '出生地与居住地湿热差异明显。'],
  suggestions: [
    {
      title: '复核水体方位',
      reason: '水体方位影响外局判断。',
      action: '看房时记录河流在小区哪一侧。',
    },
  ],
  confidence: {
    level: '中',
    missingInfo: ['完整出生年月日时'],
  },
  disclaimer: '仅供参考',
};

test('buildShareCardPayload keeps only the most important points for a clean share image', () => {
  const payload = buildShareCardPayload(report, 'https://zhaihe.example');

  assert.deepEqual(payload.strengths, ['南向采光纳阳。', '小区名有水木象。']);
  assert.deepEqual(payload.concerns, ['东侧水势需要确认。', '附近公司人流偏旺。']);
});

test('buildShareCardPayload shortens long summary and preserves the website url', () => {
  const payload = buildShareCardPayload(
    {
      ...report,
      summary: '这是一段很长很长的总结'.repeat(20),
    },
    'https://zhaihe.example/report?id=secret',
  );

  assert.equal(payload.shareUrl, 'https://zhaihe.example/report?id=secret');
  assert.ok(payload.summary.length <= 66);
  assert.match(payload.summary, /…$/);
});
