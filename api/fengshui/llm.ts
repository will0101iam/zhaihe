import type { FengshuiAnalyzeRequest, FengshuiAnalyzeResponse } from '../../shared/fengshui.js';
import { buildLlmMessages } from './prompt.js';
import { normalizeReport } from './report.js';

type LlmConfig = {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  modelFallbacks?: string[];
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
export const DEFAULT_LLM_MODEL_CANDIDATES = [
  'qwen3.6-flash-2026-04-16',
  'qwen3.7-max-2026-05-17',
  'qwen3.6-plus-2026-04-02',
  'qwen3.7-max-preview',
  'qwen3.6-plus',
  'qwen3.5-plus-2026-04-20',
  'qwen3.6-max-preview',
  'qwen3.7-max',
  'qwen3.7-max-2026-05-20',
  'qwen3.6-flash',
  'qwen3.6-27b',
] as const;
export const DEFAULT_LLM_MODEL = DEFAULT_LLM_MODEL_CANDIDATES[0];
const FREE_TIER_EXHAUSTED_PATTERN = /free tier of the model has been exhausted/i;

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

function isFreeTierExhaustedError(message: string): boolean {
  return FREE_TIER_EXHAUSTED_PATTERN.test(message);
}

function getModelCandidates(config: LlmConfig): string[] {
  const configured = [config.model, ...(config.modelFallbacks ?? [])]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  if (configured.length === 0) {
    return [...DEFAULT_LLM_MODEL_CANDIDATES];
  }

  return [...new Set(configured)];
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
  const models = getModelCandidates(config);
  const messages = buildLlmMessages(input);
  let lastError: Error | undefined;

  for (const model of models) {
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
      const error = new Error(`LLM 调用失败：${response.status} ${detail.slice(0, 160)}`);

      if (response.status === 403 && isFreeTierExhaustedError(detail) && model !== models.at(-1)) {
        lastError = error;
        continue;
      }

      throw error;
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

  throw lastError ?? new Error('LLM 调用失败：所有候选模型都不可用');
}
