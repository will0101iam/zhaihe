import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

export function getReportSourceLabel(source: FengshuiAnalyzeResponse['meta'] extends { source: infer T } ? T : never | undefined) {
  switch (source) {
    case 'deepseek':
      return 'DeepSeek';
    case 'dashscope':
      return 'Qwen';
    case 'demo':
      return '示例报告';
    default:
      return '未知渠道';
  }
}

export function getReportFallbackLabel(_meta: FengshuiAnalyzeResponse['meta']) {
  return undefined;
}
