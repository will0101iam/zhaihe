import type { FengshuiAnalyzeRequest, FengshuiAnalyzeResponse } from '../../shared/fengshui.js';
import { buildLlmMessages } from './prompt.js';
import { normalizeReport } from './report.js';

type LlmConfig = {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
};

type LlmRawResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  reply?: string;
  data?: {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };
  output_text?: string;
};

export const DEFAULT_LLM_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
export const DEFAULT_LLM_MODEL = 'qwen3.5-flash';

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith('{') ? trimmed : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error('模型没有返回 JSON');
  }

  return JSON.parse(jsonText);
}

function readModelText(payload: LlmRawResponse): string {
  return (
    payload?.choices?.[0]?.message?.content ??
    payload?.reply ??
    payload?.data?.choices?.[0]?.message?.content ??
    payload?.output_text ??
    ''
  );
}

function assertVisionContentWasUsed(input: FengshuiAnalyzeRequest, report: FengshuiAnalyzeResponse) {
  if (!input.house.floorPlanImage) {
    return;
  }

  const reportText = [
    report.summary,
    ...report.concerns,
    ...report.confidence.missingInfo,
    ...report.strengths,
    ...report.suggestions.flatMap((suggestion) => [suggestion.title, suggestion.reason, suggestion.action]),
  ].join('\n');

  if (/没有收到图片|未收到图片|未上传户型图|缺失户型图|无法.*户型图|无法.*室内格局/.test(reportText)) {
    throw new Error(
      '当前 LLM 接口没有接收到户型图视觉内容。已上传图片，但该模型/接口组合没有完成图片理解，请配置支持视觉输入的模型后再生成报告。',
    );
  }
}

export async function analyzeWithLlm(
  input: FengshuiAnalyzeRequest,
  config: LlmConfig,
): Promise<FengshuiAnalyzeResponse> {
  if (!config.apiKey) {
    throw new Error('DASHSCOPE_API_KEY 未配置');
  }

  const apiUrl = config.apiUrl ?? DEFAULT_LLM_API_URL;
  const model = config.model ?? DEFAULT_LLM_MODEL;
  const messages = buildLlmMessages(input);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LLM 调用失败：${response.status} ${detail.slice(0, 160)}`);
  }

  const payload = await response.json();
  const text = readModelText(payload);

  if (!text) {
    throw new Error('LLM 响应为空');
  }

  const report = normalizeReport({
    ...(extractJson(text) as Partial<FengshuiAnalyzeResponse>),
    meta: {
      source: 'dashscope',
    },
  });

  assertVisionContentWasUsed(input, report);

  return report;
}
