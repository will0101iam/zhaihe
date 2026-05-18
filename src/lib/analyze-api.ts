import type { FengshuiAnalyzeRequest, FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

export type AnalyzeResult = {
  report: FengshuiAnalyzeResponse;
  notice?: string;
};

export async function analyzeFengshui(payload: FengshuiAnalyzeRequest): Promise<AnalyzeResult> {
  const response = await fetch('/api/analyze-fengshui', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    if (typeof data.error === 'string' && data.error.includes('户型图视觉内容')) {
      throw new Error(data.error);
    }

    if (data.fallbackReport) {
      return {
        report: data.fallbackReport,
        notice: data.error,
      };
    }

    throw new Error(data.error ?? '分析失败，请稍后重试。');
  }

  return {
    report: data.report,
    notice: data.notice,
  };
}
