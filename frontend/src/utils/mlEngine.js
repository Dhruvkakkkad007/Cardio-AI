// Trained Logistic Regression Inference Engine & Clinical Scoring
// Trained directly on 68,636 records from cardio_cleaned.csv with Accuracy: 72.06%

export const MODEL_PARAMS = {
  bias: -0.008,
  features: {
  "age_years": {
    "mean": 52.8296,
    "std": 6.7688,
    "weight": 0.198
  },
  "gender": {
    "mean": 0.3486,
    "std": 0.4765,
    "weight": 0.00224
  },
  "height": {
    "mean": 164.3952,
    "std": 7.9771,
    "weight": -0.01037
  },
  "weight": {
    "mean": 74.1216,
    "std": 14.3077,
    "weight": 0.09878
  },
  "ap_hi": {
    "mean": 126.6793,
    "std": 16.6888,
    "weight": 0.3486
  },
  "ap_lo": {
    "mean": 81.3109,
    "std": 9.4497,
    "weight": 0.24317
  },
  "cholesterol": {
    "mean": 1.3647,
    "std": 0.6789,
    "weight": 0.17027
  },
  "gluc": {
    "mean": 1.2258,
    "std": 0.5716,
    "weight": 0.04028
  },
  "smoke": {
    "mean": 0.0879,
    "std": 0.2832,
    "weight": -0.01849
  },
  "alco": {
    "mean": 0.0533,
    "std": 0.2247,
    "weight": -0.01642
  },
  "active": {
    "mean": 0.8034,
    "std": 0.3975,
    "weight": -0.03734
  },
  "bmi": {
    "mean": 27.4739,
    "std": 5.3517,
    "weight": 0.10263
  }
}
};

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  if (bmi < 25) return { label: 'Normal Weight', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  if (bmi < 35) return { label: 'Obese (Class I)', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  return { label: 'Severely Obese (Class II+)', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
}

export function getBPCategory(ap_hi, ap_lo) {
  const hi = Number(ap_hi);
  const lo = Number(ap_lo);
  if (hi > 180 || lo > 120) {
    return {
      stage: 'Hypertensive Crisis',
      level: 4,
      desc: 'Immediate emergency medical consultation advised',
      color: 'text-rose-500',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500'
    };
  }
  if (hi >= 140 || lo >= 90) {
    return {
      stage: 'Hypertension Stage 2',
      level: 3,
      desc: 'Consistent with clinical Stage 2 HTN criteria',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    };
  }
  if ((hi >= 130 && hi <= 139) || (lo >= 80 && lo <= 89)) {
    return {
      stage: 'Hypertension Stage 1',
      level: 2,
      desc: 'Moderate vascular strain; lifestyle & clinical attention needed',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    };
  }
  if (hi >= 120 && hi <= 129 && lo < 80) {
    return {
      stage: 'Elevated Blood Pressure',
      level: 1,
      desc: 'Early elevation above optimal baseline',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30'
    };
  }
  return {
    stage: 'Normal Blood Pressure',
    level: 0,
    desc: 'Optimal systolic < 120 and diastolic < 80 mmHg',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30'
  };
}

export function predictCardiovascularRisk(patientData) {
  const bmi = calculateBMI(patientData.weight, patientData.height);
  
  const inputs = {
    age_years: Number(patientData.age_years),
    gender: Number(patientData.gender),
    height: Number(patientData.height),
    weight: Number(patientData.weight),
    ap_hi: Number(patientData.ap_hi),
    ap_lo: Number(patientData.ap_lo),
    cholesterol: Number(patientData.cholesterol),
    gluc: Number(patientData.gluc),
    smoke: Number(patientData.smoke),
    alco: Number(patientData.alco),
    active: Number(patientData.active),
    bmi: bmi
  };

  let z = MODEL_PARAMS.bias;
  const contributions = [];

  for (const [feat, param] of Object.entries(MODEL_PARAMS.features)) {
    const val = inputs[feat] ?? param.mean;
    const normVal = (val - param.mean) / param.std;
    const effect = normVal * param.weight;
    z += effect;

    let friendlyName = feat;
    if (feat === 'ap_hi') friendlyName = 'Systolic Blood Pressure';
    else if (feat === 'ap_lo') friendlyName = 'Diastolic Blood Pressure';
    else if (feat === 'age_years') friendlyName = 'Patient Age';
    else if (feat === 'cholesterol') friendlyName = 'Cholesterol Level';
    else if (feat === 'bmi') friendlyName = 'Body Mass Index (BMI)';
    else if (feat === 'weight') friendlyName = 'Body Weight';
    else if (feat === 'gluc') friendlyName = 'Fasting Glucose';
    else if (feat === 'active') friendlyName = 'Physical Activity';
    else if (feat === 'smoke') friendlyName = 'Smoking Habit';
    else if (feat === 'alco') friendlyName = 'Alcohol Consumption';
    else if (feat === 'height') friendlyName = 'Height';
    else if (feat === 'gender') friendlyName = 'Sex';

    contributions.push({
      feature: feat,
      label: friendlyName,
      effect: Number(effect.toFixed(3)),
      raw: val,
      impact: effect > 0.05 ? 'elevates' : effect < -0.05 ? 'reduces' : 'neutral'
    });
  }

  // Sigmoid
  const probability = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  const probPercent = Math.round(probability * 100);

  let tier = 'Low Risk';
  let tierColor = 'text-emerald-400';
  let tierBg = 'bg-emerald-500/10 border-emerald-500/30';
  let summary = 'Patient profile shows low statistical likelihood of cardiovascular disease based on clinical biomarkers.';

  if (probPercent >= 65) {
    tier = 'High Risk';
    tierColor = 'text-rose-400';
    tierBg = 'bg-rose-500/10 border-rose-500/30';
    summary = 'Clinical markers indicate significantly elevated cardiovascular disease likelihood. Immediate clinical consultation and lifestyle interventions recommended.';
  } else if (probPercent >= 35) {
    tier = 'Moderate Risk';
    tierColor = 'text-amber-400';
    tierBg = 'bg-amber-500/10 border-amber-500/30';
    summary = 'Borderline to moderate cardiovascular disease probability. Key risk drivers like blood pressure, cholesterol, or BMI should be monitored actively.';
  }

  contributions.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

  return {
    probability: Number(probability.toFixed(3)),
    probPercent,
    tier,
    tierColor,
    tierBg,
    summary,
    bmi,
    bmiCategory: getBMICategory(bmi),
    bpCategory: getBPCategory(inputs.ap_hi, inputs.ap_lo),
    contributions
  };
}
