import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';
import ReportView from './ReportView.js';

const report: FengshuiAnalyzeResponse = {
  score: 82,
  level: '比较适合',
  summary: '这套房会推着你往外走，事业节奏会更快，但未必能让你真正放松。',
  strengths: ['木火相生，外局更利行动力和曝光度。', '适合事业上升期居住，能把人往外推。'],
  concerns: ['久住容易精神紧绷，回家后也不太容易松下来。', '通勤和生活节奏都偏快。'],
  suggestions: [{ title: '留白降压', reason: '动能太强', action: '软装和作息都要刻意给自己留白。' }],
  confidence: { level: '中', missingInfo: ['实地噪音'] },
  disclaimer: '仅供参考',
  meta: { source: 'dashscope' },
};

test('ReportView promotes viral result hero, social hooks, and multiple share templates', () => {
  const html = renderToStaticMarkup(<ReportView report={report} />);

  assert.match(html, /推你型/);
  assert.match(html, /一句话判断/);
  assert.match(html, /同一套房，不同人住，结果可能完全不一样/);
  assert.match(html, /下载分享长图/);
  assert.match(html, /换一个人再测/);
  assert.match(html, /发给家人朋友/);
  assert.doesNotMatch(html, /默认下载适合转发给家人朋友的长图版结果卡/);
  assert.doesNotMatch(html, /点击后直接下载长图版，不再区分朋友圈或小红书模板/);
  assert.doesNotMatch(html, /本次模型渠道/);
  assert.doesNotMatch(html, /五行关系/);
  assert.doesNotMatch(html, /居住建议/);
  assert.doesNotMatch(html, /风险提醒/);
  assert.doesNotMatch(html, /适合指数/);
});
