import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_LLM_API_URL, DEFAULT_LLM_MODEL } from './llm.js';
import { buildLlmMessages } from './prompt.js';
import { createDemoReport, normalizeReport } from './report.js';
import type { FengshuiAnalyzeRequest, FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

const request: FengshuiAnalyzeRequest = {
  house: {
    communityName: '江南里',
    location: '广东省深圳市南山区',
    floorPlanImage: 'data:image/png;base64,iVBORw0KGgo=',
    floorPlanNotes: '三室两厅，入户见客厅，南向阳台，卫生间在东侧',
    orientation: '南',
    orientationNote: '朝向按中介标注，未用罗盘复核',
    floor: 12,
    totalFloors: 28,
    nearbyRiver: '有河流',
    riverNote: '小区东侧约300米有河',
    dominantIndustry: '互联网/科技',
    industryNote: '周边以科技园和办公楼为主',
    nearbyCompanies: '字节跳动、阿里云',
  },
  resident: {
    personName: '张三',
    birthPlace: '浙江杭州',
    fiveElementsInfo: '朋友说我五行偏缺木水，但不确定',
    birthYearOrZodiac: '1990',
    workIndustry: '互联网产品经理',
  },
};

test('LLM defaults target the first model in the DashScope fallback chain', () => {
  assert.equal(DEFAULT_LLM_MODEL, 'qwen3.6-flash-2026-04-16');
  assert.equal(DEFAULT_LLM_API_URL, 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
});

test('buildLlmMessages frames the model as a direct feng shui master', () => {
  const messages = buildLlmMessages(request);
  const joined = messages
    .map((message) => (typeof message.content === 'string' ? message.content : JSON.stringify(message.content)))
    .join('\n');

  assert.match(joined, /严格 JSON/);
  assert.match(joined, /中国风水大师/);
  assert.match(joined, /图底为南/);
  assert.match(joined, /图顶为北/);
  assert.match(joined, /拆字/);
  assert.match(joined, /五行/);
  assert.match(joined, /大胆直断/);
  assert.match(joined, /判断依据/);
  assert.match(joined, /地域水土/);
  assert.match(joined, /房子所在地/);
  assert.match(joined, /所有输入字段/);
  assert.match(joined, /报告正文中能看到/);
  assert.match(joined, /产业、公司、工作行业/);
  assert.match(joined, /依据 → 五行/);
  assert.match(joined, /典籍脉络/);
  assert.match(joined, /不要编造逐字原文/);
  assert.match(joined, /strengths 必须是字符串数组 string\[\]/);
  assert.match(joined, /concerns 必须是字符串数组 string\[\]/);
  assert.match(joined, /不要写成对象数组/);
  assert.doesNotMatch(joined, /dimensions/);
  assert.match(joined, /南向阳台/);
  assert.match(joined, /江南里/);
  assert.match(joined, /广东省深圳市南山区/);
  assert.match(joined, /字节跳动、阿里云/);
  assert.match(joined, /浙江杭州/);
  assert.match(joined, /五行偏缺木水/);
  assert.match(joined, /互联网产品经理/);
});

test('buildLlmMessages sends uploaded floor plan as a vision image block', () => {
  const messages = buildLlmMessages(request);
  const userMessage = messages.find((message) => message.role === 'user');

  assert.ok(userMessage);
  assert.ok(Array.isArray(userMessage.content));
  assert.deepEqual(userMessage.content.at(-1), {
    type: 'image_url',
    image_url: {
      url: 'data:image/png;base64,iVBORw0KGgo=',
    },
  });
  assert.doesNotMatch(JSON.stringify(userMessage.content), /floorPlanImage":"data:image/);
});

test('createDemoReport returns a usable report when model configuration is missing', () => {
  const report = createDemoReport(request);

  assert.equal(report.level, '比较适合');
  assert.ok(report.score >= 0 && report.score <= 100);
  assert.ok(report.strengths.length > 0);
  assert.ok(report.suggestions.length > 0);
  assert.equal(report.confidence.level, '中');
});

test('normalizeReport clamps scores and fills safe defaults', () => {
  const report = normalizeReport({
    score: 128,
    level: '未知',
    summary: '',
    strengths: [],
    concerns: [],
    suggestions: [],
    confidence: { level: '超高', missingInfo: [] },
    disclaimer: '',
  } as unknown as Partial<FengshuiAnalyzeResponse>);

  assert.equal(report.score, 100);
  assert.equal(report.level, '一般适合');
  assert.equal('dimensions' in report, false);
  assert.equal(report.confidence.level, '中');
  assert.match(report.disclaimer, /仅供/);
});

test('normalizeReport converts object list items into visible strings instead of falling back', () => {
  const report = normalizeReport({
    score: 78,
    level: '比较适合',
    summary: '对象数组兼容测试',
    strengths: [
      {
        title: '产业相生',
        reason: '周边互联网产业属火，能激发工作行业的表达与创造。',
        action: '观察办公人流是否过旺。',
      },
    ],
    concerns: [
      {
        title: '水势过动',
        reason: '东侧河流距离较近，需看水势是否急促。',
      },
    ],
    suggestions: [],
    confidence: { level: '中', missingInfo: [] },
    disclaimer: '仅供参考',
  } as unknown as Partial<FengshuiAnalyzeResponse>);

  assert.deepEqual(report.strengths, ['产业相生：周边互联网产业属火，能激发工作行业的表达与创造。观察办公人流是否过旺。']);
  assert.deepEqual(report.concerns, ['水势过动：东侧河流距离较近，需看水势是否急促。']);
});

test('normalizeReport keeps all provided list items without truncating', () => {
  const longList = Array.from({ length: 8 }, (_, index) => `第 ${index + 1} 条分析`);
  const suggestions = Array.from({ length: 7 }, (_, index) => ({
    title: `建议 ${index + 1}`,
    reason: `原因 ${index + 1}`,
    action: `行动 ${index + 1}`,
  }));

  const report = normalizeReport({
    score: 78,
    level: '比较适合',
    summary: '不截断测试',
    strengths: longList,
    concerns: longList,
    suggestions,
    confidence: { level: '中', missingInfo: longList },
    disclaimer: '仅供参考',
  });

  assert.equal(report.strengths.length, 8);
  assert.equal(report.concerns.length, 8);
  assert.equal(report.suggestions.length, 7);
  assert.equal(report.confidence.missingInfo.length, 8);
});
