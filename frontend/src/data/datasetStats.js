// Precomputed statistical aggregates and distributions from 68,636 patient records
export const DATASET_SUMMARY = {
  "totalPatients": 68636,
  "cardioPositive": 33959,
  "cardioNegative": 34677,
  "prevalenceRate": 49.5,
  "females": 44707,
  "males": 23929,
  "avgAgeYears": 52.8,
  "avgBMI": 27.5,
  "avgSystolic": 126.7,
  "avgDiastolic": 81.3,
  "smokerCount": 6036,
  "alcoCount": 3661,
  "activeCount": 55140
};

export const AGE_DISTRIBUTION = [
  {
    "range": "< 40",
    "total": 1761,
    "cardio": 421,
    "healthy": 1340,
    "rate": 23.9
  },
  {
    "range": "40 - 49",
    "total": 19279,
    "cardio": 7224,
    "healthy": 12055,
    "rate": 37.5
  },
  {
    "range": "50 - 54",
    "total": 16998,
    "cardio": 7795,
    "healthy": 9203,
    "rate": 45.9
  },
  {
    "range": "55 - 59",
    "total": 17823,
    "cardio": 9997,
    "healthy": 7826,
    "rate": 56.1
  },
  {
    "range": "60+",
    "total": 12775,
    "cardio": 8522,
    "healthy": 4253,
    "rate": 66.7
  }
];

export const BLOOD_PRESSURE_DISTRIBUTION = [
  {
    "category": "Normal (<120/<80)",
    "total": 9546,
    "cardio": 2115,
    "healthy": 7431,
    "rate": 22.2
  },
  {
    "category": "Elevated (120-129/<80)",
    "total": 3108,
    "cardio": 1004,
    "healthy": 2104,
    "rate": 32.3
  },
  {
    "category": "Stage 1 HTN (130-139)",
    "total": 39751,
    "cardio": 17831,
    "healthy": 21920,
    "rate": 44.9
  },
  {
    "category": "Stage 2 HTN (140+/90+)",
    "total": 16231,
    "cardio": 13009,
    "healthy": 3222,
    "rate": 80.1
  }
];

export const CHOLESTEROL_DISTRIBUTION = [
  {
    "level": "Normal",
    "total": 51470,
    "cardio": 22414,
    "healthy": 29056,
    "rate": 43.5
  },
  {
    "level": "Above Normal",
    "total": 9299,
    "cardio": 5546,
    "healthy": 3753,
    "rate": 59.6
  },
  {
    "level": "Well Above Normal",
    "total": 7867,
    "cardio": 5999,
    "healthy": 1868,
    "rate": 76.3
  }
];

export const GLUCOSE_DISTRIBUTION = [
  {
    "level": "Normal",
    "total": 58355,
    "cardio": 27755,
    "healthy": 30600,
    "rate": 47.6
  },
  {
    "level": "Above Normal",
    "total": 5066,
    "cardio": 2983,
    "healthy": 2083,
    "rate": 58.9
  },
  {
    "level": "Well Above Normal",
    "total": 5215,
    "cardio": 3221,
    "healthy": 1994,
    "rate": 61.8
  }
];

export const LIFESTYLE_DISTRIBUTION = [
  {
    "factor": "Physical Activity",
    "group": "Active",
    "rate": 48.5,
    "count": 55140
  },
  {
    "factor": "Physical Activity",
    "group": "Inactive",
    "rate": 53.3,
    "count": 13496
  },
  {
    "factor": "Smoking",
    "group": "Smoker",
    "rate": 46.9,
    "count": 6036
  },
  {
    "factor": "Smoking",
    "group": "Non-Smoker",
    "rate": 49.7,
    "count": 62600
  },
  {
    "factor": "Alcohol",
    "group": "Drinker",
    "rate": 47.7,
    "count": 3661
  },
  {
    "factor": "Alcohol",
    "group": "Non-Drinker",
    "rate": 49.6,
    "count": 64975
  }
];

export const BMI_DISTRIBUTION = [
  {
    "category": "Underweight (<18.5)",
    "total": 636,
    "cardio": 173,
    "healthy": 463,
    "rate": 27.2
  },
  {
    "category": "Normal (18.5-24.9)",
    "total": 25422,
    "cardio": 10116,
    "healthy": 15306,
    "rate": 39.8
  },
  {
    "category": "Overweight (25-29.9)",
    "total": 24622,
    "cardio": 12448,
    "healthy": 12174,
    "rate": 50.6
  },
  {
    "category": "Obese (>=30)",
    "total": 17956,
    "cardio": 11222,
    "healthy": 6734,
    "rate": 62.5
  }
];
