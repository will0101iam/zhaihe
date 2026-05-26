import { Router, type Request, type Response } from 'express';
import type { FengshuiAnalyzeRequest } from '../../shared/fengshui.js';
import { analyzeWithLlm, DEFAULT_LLM_MODEL_CANDIDATES } from '../fengshui/llm.js';
import { createDemoReport } from '../fengshui/report.js';

const router = Router();

function isValidRequest(body: Partial<FengshuiAnalyzeRequest>): body is FengshuiAnalyzeRequest {
  return Boolean(
    body?.house?.communityName &&
      body.house.orientation &&
      body.house.nearbyRiver &&
      typeof body.house.dominantIndustry === 'string' &&
      body.house.dominantIndustry.trim().length > 0 &&
      typeof body.house.nearbyCompanies === 'string' &&
      body.house.nearbyCompanies.trim().length > 0 &&
      body?.resident?.personName &&
      body.resident.birthPlace &&
      typeof body.resident.fiveElementsInfo === 'string' &&
      body.resident.fiveElementsInfo.trim().length > 0,
  );
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function resolveModelCandidatesFromEnv(): string[] {
  const configuredFallbacks = optionalEnv('DASHSCOPE_MODEL_FALLBACKS');
  if (configuredFallbacks) {
    return configuredFallbacks
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const configuredSingleModel = optionalEnv('DASHSCOPE_MODEL');
  if (!configuredSingleModel || configuredSingleModel === 'qwen3.5-flash') {
    return [...DEFAULT_LLM_MODEL_CANDIDATES];
  }

  return [configuredSingleModel, ...DEFAULT_LLM_MODEL_CANDIDATES.filter((item) => item !== configuredSingleModel)];
}

router.post('/analyze-fengshui', async (req: Request, res: Response) => {
  const input = req.body as Partial<FengshuiAnalyzeRequest>;

  if (!isValidRequest(input)) {
    res.status(400).json({
      success: false,
      error: '请填写小区名字、河流情况、产业、公司、姓名、出生地和五行信息。',
    });
    return;
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    res.status(200).json({
      success: true,
      report: createDemoReport(input),
      notice: '当前未配置 DASHSCOPE_API_KEY，已返回示例报告。你提供 Key 后即可启用 Qwen 模型兜底链。',
    });
    return;
  }

  try {
    const [model, ...modelFallbacks] = resolveModelCandidatesFromEnv();
    const report = await analyzeWithLlm(input, {
      apiKey,
      apiUrl: optionalEnv('DASHSCOPE_API_URL'),
      model,
      modelFallbacks,
    });

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : 'LLM 调用失败，请稍后重试。',
      fallbackReport: createDemoReport(input),
    });
  }
});

export default router;
