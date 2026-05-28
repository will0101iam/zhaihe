import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeWithLlm, analyzeWithProviderFallback } from './llm.js';
import type { FengshuiAnalyzeRequest, FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

type MockFetchInput = Parameters<typeof fetch>[0];
type MockFetchInit = Parameters<typeof fetch>[1];

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

function successfulReport(): FengshuiAnalyzeResponse {
  return {
    score: 86,
    level: '比较适合',
    summary: '外局与居住者信息基本相合，适合继续细看。',
    strengths: ['南向采光较稳，利于纳气。'],
    concerns: ['入户动线仍需结合实地再看。'],
    suggestions: [{ title: '现场复核', reason: '核对户型与外局细节', action: '带着户型图去现场复核动线与采光。' }],
    confidence: { level: '中', missingInfo: ['实地噪音情况'] },
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

test('analyzeWithLlm falls back to the next model when the current free tier is exhausted', async () => {
  const originalFetch = globalThis.fetch;
  const calledModels: string[] = [];
  let callCount = 0;

  globalThis.fetch = async (_input: MockFetchInput, init?: MockFetchInit) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
    calledModels.push(String(body.model ?? ''));
    callCount += 1;

    if (callCount === 1) {
      return new Response(
        JSON.stringify({
          error: {
            message:
              'The free tier of the model has been exhausted. If you wish to continue access the model on a paid basis, please disable the "use free tier"',
          },
        }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(successfulReport()),
            },
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const report = await analyzeWithLlm(requestWithImage, {
    apiKey: 'test-key',
    apiUrl: 'https://example.com/v1/chat/completions',
    model: 'qwen3.6-flash-2026-04-16',
    modelFallbacks: ['qwen3.7-max-2026-05-17'],
  });

  assert.equal(report.level, '比较适合');
  assert.deepEqual(calledModels, ['qwen3.6-flash-2026-04-16', 'qwen3.7-max-2026-05-17']);

  globalThis.fetch = originalFetch;
});

test('analyzeWithLlm does not fall back when the error is not free-tier exhaustion', async () => {
  const originalFetch = globalThis.fetch;
  const calledModels: string[] = [];

  globalThis.fetch = async (_input: MockFetchInput, init?: MockFetchInit) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
    calledModels.push(String(body.model ?? ''));

    return new Response(
      JSON.stringify({
        error: {
          message: 'Invalid API key',
        },
      }),
      { status: 403, headers: { 'content-type': 'application/json' } },
    );
  };

  await assert.rejects(
    analyzeWithLlm(requestWithImage, {
      apiKey: 'test-key',
      apiUrl: 'https://example.com/v1/chat/completions',
      model: 'qwen3.6-flash-2026-04-16',
      modelFallbacks: ['qwen3.7-max-2026-05-17'],
    }),
    /LLM 调用失败：403/,
  );

  assert.deepEqual(calledModels, ['qwen3.6-flash-2026-04-16']);

  globalThis.fetch = originalFetch;
});

test('analyzeWithProviderFallback returns DeepSeek result first when the primary provider succeeds', async () => {
  const originalFetch = globalThis.fetch;
  const calledUrls: string[] = [];

  globalThis.fetch = async (input: MockFetchInput) => {
    calledUrls.push(String(input));

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(successfulReport()),
            },
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const report = await analyzeWithProviderFallback(requestWithImage, {
    primary: {
      apiKey: 'deepseek-key',
      apiUrl: 'https://api.deepseek.com/chat/completions',
      model: 'deepseek-v4-flash',
      source: 'deepseek',
    },
    secondary: {
      apiKey: 'dashscope-key',
      apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      model: 'qwen3.6-flash-2026-04-16',
      modelFallbacks: ['qwen3.7-max-2026-05-17'],
      source: 'dashscope',
    },
  });

  assert.equal(report.meta?.source, 'deepseek');
  assert.deepEqual(calledUrls, ['https://api.deepseek.com/chat/completions']);

  globalThis.fetch = originalFetch;
});

test('analyzeWithProviderFallback falls back to DashScope when DeepSeek provider fails', async () => {
  const originalFetch = globalThis.fetch;
  const calledUrls: string[] = [];
  const calledModels: string[] = [];

  globalThis.fetch = async (input: MockFetchInput, init?: MockFetchInit) => {
    const url = String(input);
    calledUrls.push(url);

    if (url.includes('deepseek')) {
      return new Response(JSON.stringify({ error: { message: 'DeepSeek temporary failure' } }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
    calledModels.push(String(body.model ?? ''));

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(successfulReport()),
            },
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const report = await analyzeWithProviderFallback(requestWithImage, {
    primary: {
      apiKey: 'deepseek-key',
      apiUrl: 'https://api.deepseek.com/chat/completions',
      model: 'deepseek-v4-flash',
      source: 'deepseek',
    },
    secondary: {
      apiKey: 'dashscope-key',
      apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      model: 'qwen3.6-flash-2026-04-16',
      modelFallbacks: ['qwen3.7-max-2026-05-17'],
      source: 'dashscope',
    },
  });

  assert.equal(report.meta?.source, 'dashscope');
  assert.equal(report.meta?.fallbackFrom, 'deepseek');
  assert.match(report.meta?.fallbackReason ?? '', /LLM 调用失败：500/);
  assert.deepEqual(calledUrls, [
    'https://api.deepseek.com/chat/completions',
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  ]);
  assert.deepEqual(calledModels, ['qwen3.6-flash-2026-04-16']);

  globalThis.fetch = originalFetch;
});
