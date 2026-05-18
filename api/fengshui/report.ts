import type {
  ConfidenceLevel,
  FengshuiAnalyzeRequest,
  FengshuiAnalyzeResponse,
  MatchLevel,
} from '../../shared/fengshui.js';

const disclaimer = '本结果仅供传统文化、审美与居住决策参考，不替代专业验房、法律、医学或投资建议。';
const matchLevels: MatchLevel[] = ['很适合', '比较适合', '一般适合', '需要谨慎'];
const confidenceLevels: ConfidenceLevel[] = ['高', '中', '低'];

function clampScore(value: unknown, fallback = 70): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function stringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.map(toListText).filter((item): item is string => item.length > 0);
  return items.length > 0 ? items : fallback;
}

function toListText(item: unknown): string {
  if (typeof item === 'string') {
    return item.trim();
  }

  if (!item || typeof item !== 'object') {
    return '';
  }

  const record = item as Record<string, unknown>;
  const title = textValue(record.title);
  const details = [record.reason, record.action, record.description, record.detail, record.text, record.content, record.note]
    .map(textValue)
    .filter(Boolean);

  if (title && details.length > 0) {
    return `${title}：${details.join('')}`;
  }

  return [title, ...details].filter(Boolean).join('');
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeLevel(value: unknown): MatchLevel {
  return typeof value === 'string' && matchLevels.includes(value as MatchLevel) ? (value as MatchLevel) : '一般适合';
}

function normalizeConfidence(value: unknown): ConfidenceLevel {
  return typeof value === 'string' && confidenceLevels.includes(value as ConfidenceLevel) ? (value as ConfidenceLevel) : '中';
}

export function normalizeReport(raw: Partial<FengshuiAnalyzeResponse>): FengshuiAnalyzeResponse {
  return {
    score: clampScore(raw.score),
    level: normalizeLevel(raw.level),
    summary: typeof raw.summary === 'string' && raw.summary.trim() ? raw.summary : '信息仍需补充，当前报告以已填写内容做谨慎判断。',
    strengths: stringList(raw.strengths, ['字段较轻，适合快速形成初步判断。']),
    concerns: stringList(raw.concerns, ['户型细节、出生信息或小区外局信息不足，部分判断置信度有限。']),
    suggestions: Array.isArray(raw.suggestions) && raw.suggestions.length > 0
      ? raw.suggestions
          .filter((item) => item && typeof item.title === 'string' && typeof item.reason === 'string' && typeof item.action === 'string')
      : [
          {
            title: '补充户型关键信息',
            reason: '门、窗、厨卫和卧室位置会显著影响判断。',
            action: '上传带朝向标注的户型图，或用文字说明入户门、阳台、厨房和卫生间位置。',
          },
        ],
    confidence: {
      level: normalizeConfidence(raw.confidence?.level),
      missingInfo: stringList(raw.confidence?.missingInfo, ['带朝向的户型图', '窗外环境', '厨卫与卧室相对位置']),
    },
    disclaimer: typeof raw.disclaimer === 'string' && raw.disclaimer.trim() ? raw.disclaimer : disclaimer,
    meta: raw.meta,
  };
}

export function createDemoReport(input: FengshuiAnalyzeRequest): FengshuiAnalyzeResponse {
  const isSouthFacing = input.house.orientation === '南' || input.house.orientation === '东南';
  const hasWater = input.house.nearbyRiver === '有河流' || input.house.nearbyRiver === '有湖泊';
  const hasIndustry = input.house.dominantIndustry.trim().length > 0;
  const hasPersonInfo = input.resident.birthPlace.trim().length > 0 && input.resident.fiveElementsInfo.trim().length > 0;
  const score = 70 + (isSouthFacing ? 5 : 0) + (hasWater ? 4 : 0) + (hasIndustry ? 2 : 0) + (hasPersonInfo ? 3 : 0);

  return normalizeReport({
    score,
    level: score >= 86 ? '很适合' : '比较适合',
    summary: `${input.house.communityName} 从已填信息看，已具备小区外局与个人命理信息，可初步判断与 ${input.resident.personName} 的人宅匹配关系。`,
    strengths: [
      isSouthFacing ? '朝向偏南，传统上重视纳光，也有利于现实采光。' : '已提供朝向信息，可做基础方位判断。',
      hasWater ? '附近有水体，可纳入传统外局中“水”的判断。' : '已明确附近水体情况，便于判断外局是否偏动或偏静。',
      hasIndustry ? `周边产业以「${input.house.dominantIndustry}」为主，可辅助判断区域气场。` : '已预留周边产业字段，适合后续补充外部环境。',
      input.house.nearbyCompanies ? `附近公司信息已填写：${input.house.nearbyCompanies}。` : '附近公司信息可用于判断人流、车流与产业属性。',
      input.house.orientationNote ? `朝向备注：${input.house.orientationNote}。` : '朝向备注可补充罗盘、楼栋或中介标注的不确定性。',
      input.house.riverNote ? `水体备注：${input.house.riverNote}。` : '水体备注可补充河流距离、方位和水势。',
      input.house.industryNote ? `产业备注：${input.house.industryNote}。` : '产业备注可补充周边园区、人流和车流特征。',
      hasPersonInfo ? `${input.resident.personName} 的出生地与五行信息已填写，可用于人宅匹配。` : '姓名、出生地与五行信息会显著提升人宅匹配判断。',
    ],
    concerns: [
      input.house.floorPlanNotes ? '户型文字描述有限，仍建议补充门窗、厨卫和卧室相对位置。' : '缺少户型细节，传统风水判断只能做粗判。',
      input.house.nearbyCompanies ? '公司名称还需要结合距离、方位和人流强度判断，不能只看名字。' : '未填写附近公司，无法判断周边产业气场的具体来源。',
      input.resident.fiveElementsInfo ? '五行信息为用户填写结果，若要更准确仍需完整出生年月日时。' : '未填写五行信息，个人命理匹配只能做弱判断。',
    ],
    suggestions: [
      {
        title: '看房时补拍三张关键照片',
        reason: '入户、阳台窗外和主卧视野决定很多传统与现实判断，也能验证小区外局。',
        action: '分别拍入户门到客厅、阳台外景、主卧床位可摆放区域。',
      },
      {
        title: '核实水体和产业方位',
        reason: '河流、产业园和公司不仅看有没有，还要看在房子的哪个方位和距离。',
        action: '看房时记录河流、主要公司或产业园相对小区的东南西北方位。',
      },
    ],
    confidence: {
      level: '中',
      missingInfo: input.house.floorPlanNotes ? ['带尺寸和朝向的户型图', '河流/公司相对方位', '完整出生年月日时'] : ['户型图或户型文字描述', '厨卫与卧室位置', '河流/公司相对方位'],
    },
    disclaimer,
    meta: {
      source: 'demo',
      configMissing: true,
    },
  });
}
