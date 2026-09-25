import { predictCardiovascularRisk, getBMICategory, getBPCategory } from './mlEngine';

export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Checks FastAPI backend health status
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      connected: data.status === 'healthy' && data.model_loaded,
      modelType: data.model_type || 'GradientBoostingClassifier',
      raw: data
    };
  } catch (err) {
    return {
      connected: false,
      modelType: 'Local Engine (Offline)',
      error: err.message
    };
  }
}

/**
 * Fetches CVD Risk Prediction from FastAPI Backend /predict endpoint.
 * Falls back to local JS inference if backend is unreachable.
 */
export async function fetchCvdPrediction(patientData) {
  try {
    const payload = {
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
      active: Number(patientData.active)
    };

    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`FastAPI server returned HTTP ${res.status}`);
    }

    const data = await res.json();

    // Map backend response into UI structure
    const probPercent = Math.round(data.risk_percentage);
    let tierColor = 'text-emerald-400';
    let tierBg = 'bg-emerald-500/10 border-emerald-500/30';
    let summary = 'Patient profile shows low statistical likelihood of cardiovascular disease based on clinical biomarkers.';

    if (probPercent >= 65) {
      tierColor = 'text-rose-400';
      tierBg = 'bg-rose-500/10 border-rose-500/30';
      summary = 'Clinical markers indicate significantly elevated cardiovascular disease likelihood. Immediate clinical consultation and lifestyle interventions recommended.';
    } else if (probPercent >= 35) {
      tierColor = 'text-amber-400';
      tierBg = 'bg-amber-500/10 border-amber-500/30';
      summary = 'Borderline to moderate cardiovascular disease probability. Key risk drivers like blood pressure, cholesterol, or BMI should be monitored actively.';
    }

    // Format contributions
    const contributions = (data.feature_contributions || []).map(fc => ({
      feature: fc.feature,
      label: fc.label,
      effect: fc.effect,
      raw: fc.value,
      impact: fc.impact
    }));

    return {
      isBackend: true,
      probability: data.risk_probability,
      probPercent: probPercent,
      prediction: data.prediction,
      tier: data.risk_tier,
      tierColor: tierColor,
      tierBg: tierBg,
      summary: summary,
      bmi: data.bmi,
      bmiCategory: getBMICategory(data.bmi),
      bpCategory: {
        stage: data.bp_category.stage,
        level: data.bp_category.level,
        desc: data.bp_category.description,
        color: data.bp_category.level >= 3 ? 'text-rose-400' : (data.bp_category.level >= 1 ? 'text-amber-400' : 'text-emerald-400'),
        bg: data.bp_category.level >= 3 ? 'bg-rose-500/10' : (data.bp_category.level >= 1 ? 'bg-amber-500/10' : 'bg-emerald-500/10'),
        border: data.bp_category.level >= 3 ? 'border-rose-500/30' : (data.bp_category.level >= 1 ? 'border-amber-500/30' : 'border-emerald-500/30')
      },
      contributions: contributions,
      recommendations: data.recommendations
    };
  } catch (err) {
    console.warn('FastAPI backend unreachable, falling back to local JS inference:', err.message);
    const localResult = predictCardiovascularRisk(patientData);
    return {
      ...localResult,
      isBackend: false
    };
  }
}

/**
 * Fetches Dataset Statistics from FastAPI Backend /dataset-stats
 */
export async function fetchDatasetStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/dataset-stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch dataset stats from backend:', err.message);
    return null;
  }
}

/**
 * Fetches Model Architecture Info from FastAPI Backend /model-info
 */
export async function fetchModelInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/model-info`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch model info from backend:', err.message);
    return null;
  }
}
