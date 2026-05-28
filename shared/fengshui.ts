export type Orientation = '东' | '南' | '西' | '北' | '东南' | '东北' | '西南' | '西北';

export type NearbyRiver = '有河流' | '有湖泊' | '无明显水体';

export type FengshuiAnalyzeRequest = {
  house: {
    communityName: string;
    location: string;
    floorPlanImage?: string;
    floorPlanNotes?: string;
    orientation: Orientation;
    orientationNote: string;
    floor: number | null;
    totalFloors: number | null;
    nearbyRiver: NearbyRiver;
    riverNote: string;
    dominantIndustry: string;
    industryNote: string;
    nearbyCompanies: string;
  };
  resident: {
    personName: string;
    birthPlace: string;
    fiveElementsInfo: string;
    birthYearOrZodiac?: string;
    workIndustry?: string;
  };
};

export type MatchLevel = '很适合' | '比较适合' | '一般适合' | '需要谨慎';

export type ConfidenceLevel = '高' | '中' | '低';

export type FengshuiAnalyzeResponse = {
  score: number;
  level: MatchLevel;
  summary: string;
  strengths: string[];
  concerns: string[];
  suggestions: Array<{
    title: string;
    reason: string;
    action: string;
  }>;
  confidence: {
    level: ConfidenceLevel;
    missingInfo: string[];
  };
  disclaimer: string;
  meta?: {
    source: 'deepseek' | 'dashscope' | 'demo';
    configMissing?: boolean;
  };
};
