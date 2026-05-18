import type {
  FengshuiAnalyzeRequest,
  NearbyRiver,
  Orientation,
} from '../../shared/fengshui.js';

export type FengshuiFormState = {
  communityName: string;
  location: string;
  floorPlanImage?: string;
  floorPlanNotes: string;
  orientation: Orientation;
  orientationNote: string;
  floor: string;
  totalFloors: string;
  nearbyRiver: NearbyRiver;
  riverNote: string;
  dominantIndustry: string;
  industryNote: string;
  nearbyCompanies: string;
  personName: string;
  birthPlace: string;
  fiveElementsInfo: string;
  birthYearOrZodiac: string;
  workIndustry: string;
};

export function createInitialForm(): FengshuiFormState {
  return {
    communityName: '',
    location: '',
    floorPlanNotes: '',
    orientation: '南',
    orientationNote: '',
    floor: '',
    totalFloors: '',
    nearbyRiver: '无明显水体',
    riverNote: '',
    dominantIndustry: '',
    industryNote: '',
    nearbyCompanies: '',
    personName: '',
    birthPlace: '',
    fiveElementsInfo: '',
    birthYearOrZodiac: '',
    workIndustry: '',
  };
}

export function toggleOption(values: string[], option: string): string[] {
  if (values.includes(option)) {
    return values.filter((value) => value !== option);
  }

  return [...values, option];
}

function toNumberOrNull(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function toAnalyzeRequest(form: FengshuiFormState): FengshuiAnalyzeRequest {
  return {
    house: {
      communityName: form.communityName.trim(),
      location: form.location.trim(),
      floorPlanImage: form.floorPlanImage,
      floorPlanNotes: form.floorPlanNotes.trim(),
      orientation: form.orientation,
      orientationNote: (form.orientationNote ?? '').trim(),
      floor: toNumberOrNull(form.floor),
      totalFloors: toNumberOrNull(form.totalFloors),
      nearbyRiver: form.nearbyRiver,
      riverNote: (form.riverNote ?? '').trim(),
      dominantIndustry: (form.dominantIndustry ?? '').trim(),
      industryNote: (form.industryNote ?? '').trim(),
      nearbyCompanies: form.nearbyCompanies.trim(),
    },
    resident: {
      personName: form.personName.trim(),
      birthPlace: form.birthPlace.trim(),
      fiveElementsInfo: (form.fiveElementsInfo ?? '').trim(),
      birthYearOrZodiac: form.birthYearOrZodiac.trim() || undefined,
      workIndustry: (form.workIndustry ?? '').trim() || undefined,
    },
  };
}
