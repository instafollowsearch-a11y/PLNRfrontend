export type AreaAnswers = {
  stay_in_area?: 'Yes' | 'No';
  area_center?: string;
  area_radius_miles?: string;
};

export function parseAreaAnswers(raw: Record<string, string>): AreaAnswers {
  if (raw.stay_in_area !== 'Yes' && raw.stay_in_area !== 'No') {
    return {};
  }

  if (raw.stay_in_area === 'No') {
    return { stay_in_area: 'No' };
  }

  return {
    stay_in_area: 'Yes',
    area_center: raw.area_center,
    area_radius_miles: raw.area_radius_miles,
  };
}

export function areaAnswersAreValid(answers: AreaAnswers): boolean {
  if (answers.stay_in_area !== 'Yes') {
    return true;
  }

  if (!['1', '3', '5'].includes(answers.area_radius_miles ?? '')) {
    return false;
  }

  try {
    const center = JSON.parse(answers.area_center ?? '') as { lat?: unknown; lon?: unknown };

    return typeof center.lat === 'number' && typeof center.lon === 'number';
  } catch {
    return false;
  }
}
