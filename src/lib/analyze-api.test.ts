import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeFengshui } from './analyze-api.js';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

const fallbackReport: FengshuiAnalyzeResponse = {
  score: 68,
  level: '一般适合',
  summary: '降级报告',
  strengths: [],
  concerns: [],
  suggestions: [],
  confidence: { level: '低', missingInfo: [] },
  disclaimer: '仅供参考',
};

test('analyzeFengshui does not show fallback report when vision image delivery fails', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: '当前 LLM 接口没有接收到户型图视觉内容。',
        fallbackReport,
      }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );

  await assert.rejects(
    analyzeFengshui({
      house: {
        communityName: '江南里',
        location: '广东省深圳市南山区',
        floorPlanImage: 'data:image/png;base64,iVBORw0KGgo=',
        orientation: '南',
        orientationNote: '',
        floor: 12,
        totalFloors: 28,
        nearbyRiver: '有河流',
        riverNote: '',
        dominantIndustry: '互联网',
        industryNote: '',
        nearbyCompanies: '字节跳动',
      },
      resident: {
        personName: '张三',
        birthPlace: '杭州',
        fiveElementsInfo: '偏缺木',
      },
    }),
    /户型图视觉内容/,
  );

  globalThis.fetch = originalFetch;
});
