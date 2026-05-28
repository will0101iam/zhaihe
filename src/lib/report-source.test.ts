import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getReportSourceLabel, getReportFallbackLabel } from './report-source.js';

test('getReportSourceLabel maps deepseek to DeepSeek', () => {
  assert.equal(getReportSourceLabel('deepseek'), 'DeepSeek');
});

test('getReportSourceLabel maps dashscope to Qwen', () => {
  assert.equal(getReportSourceLabel('dashscope'), 'Qwen');
});

test('getReportSourceLabel maps demo to 示例报告', () => {
  assert.equal(getReportSourceLabel('demo'), '示例报告');
});

test('getReportSourceLabel falls back to 未知渠道 when source is missing', () => {
  assert.equal(getReportSourceLabel(undefined), '未知渠道');
});

test('getReportFallbackLabel hides deepseek fallback reason from the report page', () => {
  assert.equal(
    getReportFallbackLabel({
      source: 'dashscope',
      fallbackFrom: 'deepseek',
      fallbackReason: 'DeepSeek 当前不可用，已自动切换到 Qwen。',
    }),
    undefined,
  );
});
