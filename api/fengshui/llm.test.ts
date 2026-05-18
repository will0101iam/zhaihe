import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeWithLlm } from './llm.js';
import type { FengshuiAnalyzeRequest, FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

const requestWithImage: FengshuiAnalyzeRequest = {
  house: {
    communityName: '江南里',
    location: '广东省深圳市南山区',
    floorPlanImage: 'data:image/png;base64,iVBORw0KGgo=',
    floorPlanNotes: '三室两厅',
    orientation: '南',
    orientationNote: '',
    floor: 12,
    totalFloors: 28,
    nearbyRiver: '有河流',
    riverNote: '',
    dominantIndustry: '互联网/科技',
    industryNote: '',
    nearbyCompanies: '字节跳动',
  },
  resident: {
    personName: '张三',
    birthPlace: '浙江杭州',
    fiveElementsInfo: '偏缺木水',
    birthYearOrZodiac: '1990',
    workIndustry: '互联网',
  },
};

function reportWithSummary(summary: string): FengshuiAnalyzeResponse {
  return {
    score: 68,
    level: '一般适合',
    summary,
    strengths: ['南向'],
    concerns: ['缺失户型图，无法评估室内格局'],
    suggestions: [{ title: '补充户型图', reason: '缺失户型图', action: '上传清晰户型图' }],
    confidence: { level: '低', missingInfo: ['户型图'] },
    disclaimer: '仅供参考',
  };
}

test('analyzeWithLlm rejects reports that indicate uploaded floor plan was not received', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(reportWithSummary('缺失户型图，无法评价室内格局。')),
            },
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );

  await assert.rejects(
    analyzeWithLlm(requestWithImage, {
      apiKey: 'test-key',
      apiUrl: 'https://example.com/v1/chat/completions',
      model: 'qwen3.5-flash',
    }),
    /当前 LLM 接口没有接收到户型图视觉内容/,
  );

  globalThis.fetch = originalFetch;
});
