import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

export type ShareTemplateId = 'wechat' | 'rednote' | 'story';

export type ShareTemplateOption = {
  id: ShareTemplateId;
  title: string;
  description: string;
};

export type ViralReport = {
  relationshipTag: string;
  relationshipType: string;
  relationshipSubtitle: string;
  elementRelation: string;
  livingAdvice: string;
  riskHint: string;
  oneLineVerdict: string;
  shareHook: string;
  retestCta: string;
  familyPrompt: string;
};

export const SHARE_HOOKS = {
  comparison: '同一套房，不同人住，结果可能完全不一样',
  retest: '换一个人再测，看看这套房到底更养谁',
  family: '把结果发给家人朋友，看看谁更适合这套房',
} as const;

const TAG_PRESETS: Record<
  string,
  {
    type: string;
    subtitle: string;
    livingAdvice: string;
    riskHint: string;
    verdict: string;
    elementRelation: string;
  }
> = {
  推你型: {
    type: '互补养成型',
    subtitle: '这套房更像一个把你往外推的放大器',
    livingAdvice: '适合事业上升期、主动扩张期或想冲结果的时候住',
    riskHint: '久住容易精神紧绷，需要刻意留白才能住得更稳',
    verdict: '这个房子会推着你往外走，但不一定让你真正放松。',
    elementRelation: '木火相生',
  },
  养你型: {
    type: '稳态滋养型',
    subtitle: '这套房偏向慢慢养状态，而不是猛推结果',
    livingAdvice: '适合想长期住稳、希望作息慢慢沉下来的阶段',
    riskHint: '容易求稳过头，住久了可能会少一点冲劲',
    verdict: '这个房子更会养状态和情绪，适合慢慢住出底气。',
    elementRelation: '土金相安',
  },
  修复型: {
    type: '缓释修复型',
    subtitle: '这套房适合用来把节奏拉回身体能承受的范围',
    livingAdvice: '适合换城、恢复期或想把生活慢慢拽回正轨的时候住',
    riskHint: '推进感不算强，想快速冲刺的人可能会嫌它太慢',
    verdict: '这个房子更像给你回血，不像给你冲锋。',
    elementRelation: '土木互补',
  },
  放大型: {
    type: '气场放大型',
    subtitle: '优点和缺点都会被这套房一起放大',
    livingAdvice: '适合本来状态就不错、想把行动力和曝光度再放大的人',
    riskHint: '一旦你本身状态不好，这套房也会把疲惫一起放大',
    verdict: '它会把你现阶段的状态放大，不会温柔替你兜底。',
    elementRelation: '木土成局',
  },
  内耗型: {
    type: '高压紧绷型',
    subtitle: '这套房住起来容易让人持续消耗而不自知',
    livingAdvice: '更适合短期过渡或阶段性冲刺，不适合长期慢住',
    riskHint: '久住容易心累、焦躁或精神一直松不下来',
    verdict: '这个房子短期能扛，长期会一点点把你耗掉。',
    elementRelation: '水火相激',
  },
  不宜久居型: {
    type: '短停观察型',
    subtitle: '它不一定马上出问题，但不适合当长期大本营',
    livingAdvice: '更适合阶段性承接，不建议直接当长期主住处',
    riskHint: '住久后容易暴露节奏、情绪或家庭协同上的问题',
    verdict: '这套房可以暂住观察，但不建议你轻易久居。',
    elementRelation: '气场失衡',
  },
};

const DEFAULT_TEMPLATE_OPTIONS: ShareTemplateOption[] = [
  { id: 'wechat', title: '朋友圈结果卡', description: '大标题强、适合直接保存发朋友圈。' },
  { id: 'rednote', title: '小红书结果卡', description: '更强调标签、五行关系和一句话判断。' },
  { id: 'story', title: '长图故事版', description: '适合发给家人朋友，一眼看懂加分和风险。' },
];

export function getShareTemplateOptions(): ShareTemplateOption[] {
  return DEFAULT_TEMPLATE_OPTIONS;
}

export function deriveViralReport(report: FengshuiAnalyzeResponse): ViralReport {
  const combinedText = [report.summary, ...report.strengths, ...report.concerns].join('\n');
  const relationshipTag = detectRelationshipTag(report, combinedText);
  const preset = TAG_PRESETS[relationshipTag] ?? TAG_PRESETS.养你型;
  const elementRelation = extractElementRelation(combinedText) ?? preset.elementRelation;
  const livingAdvice =
    pickFirstMatch(report.strengths, /(适合|上升期|阶段)/) ??
    pickFirstMatch(report.strengths, /(宜|利)/) ??
    preset.livingAdvice;
  const riskHint =
    pickFirstMatch(report.concerns, /(久住|长期|不宜久居|不适合长期)/) ??
    pickFirstMatch(report.concerns, /(紧绷|焦躁|内耗|不宜|风险|压)/) ??
    report.concerns[0] ??
    preset.riskHint;

  return {
    relationshipTag,
    relationshipType: preset.type,
    relationshipSubtitle: preset.subtitle,
    elementRelation,
    livingAdvice: truncateText(livingAdvice, 30),
    riskHint: truncateText(riskHint, 30),
    oneLineVerdict: extractFirstSentence(report.summary, 65) || preset.verdict,
    shareHook: SHARE_HOOKS.comparison,
    retestCta: SHARE_HOOKS.retest,
    familyPrompt: SHARE_HOOKS.family,
  };
}

function detectRelationshipTag(report: FengshuiAnalyzeResponse, text: string) {
  if (report.score >= 78 && /(往外走|上升期|行动力|曝光度|冲结果|把人往外推)/.test(text)) {
    return '推你型';
  }

  if (/(内耗|焦躁|精神紧绷|压抑|心累|久住容易)/.test(text)) {
    return '内耗型';
  }

  if (/(不宜久居|不适合长期|短住|过渡)/.test(text)) {
    return '不宜久居型';
  }

  if (/(修复|恢复|疗愈|慢下来|回血)/.test(text)) {
    return '修复型';
  }

  if (/(贵人|人脉|资源)/.test(text)) {
    return '贵人型';
  }

  if (/(财|进账|偏财|机会)/.test(text)) {
    return '偏财型';
  }

  if (report.score >= 80) {
    return '推你型';
  }

  if (report.score >= 72) {
    return '养你型';
  }

  if (report.score >= 62) {
    return '放大型';
  }

  return '不宜久居型';
}

function extractElementRelation(text: string) {
  const match = text.match(/[金木水火土]{1,2}[金木水火土]{1,2}(?:相生|相克|相冲|相合|相激|互补)/);
  return match?.[0];
}

function pickFirstMatch(items: string[], pattern: RegExp) {
  return items.find((item) => pattern.test(item));
}

function truncateText(text: string, maxLength: number) {
  const chars = Array.from(text.trim());
  return chars.length > maxLength ? `${chars.slice(0, maxLength - 1).join('')}…` : chars.join('');
}

function extractFirstSentence(text: string, maxLength: number): string {
  const match = text.trim().match(/^(.+?[。！？])/);
  if (match && Array.from(match[1]).length <= maxLength) {
    return match[1];
  }
  return '';
}
