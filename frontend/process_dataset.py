import csv
import json
import math
import os
import random

os.makedirs('src/data', exist_ok=True)
os.makedirs('src/utils', exist_ok=True)

print("Reading cardio_cleaned.csv...")
with open('cardio_cleaned.csv', 'r') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

total = len(rows)
print(f"Total records loaded: {total}")

features = ['age_years', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'bmi']
X = [[float(r[col]) for col in features] for r in rows]
y = [float(r['cardio']) for r in rows]
n_feat = len(features)

# Normalization stats
means = [sum(X[i][j] for i in range(total))/total for j in range(n_feat)]
stds = [math.sqrt(sum((X[i][j] - means[j])**2 for i in range(total))/total) or 1.0 for j in range(n_feat)]

# Train logistic regression
X_norm = [[(X[i][j] - means[j])/stds[j] for j in range(n_feat)] for i in range(total)]
weights = [0.0] * n_feat
bias = 0.0
lr = 0.08
epochs = 35

for ep in range(epochs):
    grad_w = [0.0] * n_feat
    grad_b = 0.0
    for i in range(total):
        z = bias + sum(weights[j] * X_norm[i][j] for j in range(n_feat))
        z = max(min(z, 20), -20)
        p = 1.0 / (1.0 + math.exp(-z))
        err = p - y[i]
        grad_b += err
        for j in range(n_feat):
            grad_w[j] += err * X_norm[i][j]
    bias -= lr * (grad_b / total)
    for j in range(n_feat):
        weights[j] -= lr * (grad_w[j] / total + 0.00005 * weights[j])

correct = sum(1 for i in range(total) if (1 if (bias + sum(weights[j] * X_norm[i][j] for j in range(n_feat))) >= 0 else 0) == int(y[i]))
acc = round(correct / total * 100, 2)
print(f"Trained Logistic Regression: Accuracy = {acc}%, Bias = {bias:.4f}")

# 1. Write src/utils/mlEngine.js
norm_dict = {f: {'mean': round(m, 4), 'std': round(s, 4), 'weight': round(w, 5)} for f, m, s, w in zip(features, means, stds, weights)}
norm_json = json.dumps(norm_dict, indent=2)

code_header = f"""// Trained Logistic Regression Inference Engine & Clinical Scoring
// Trained directly on 68,636 records from cardio_cleaned.csv with Accuracy: {acc}%

export const MODEL_PARAMS = {{
  bias: {round(bias, 5)},
  features: {norm_json}
}};

export function calculateBMI(weightKg, heightCm) {{
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}}

export function getBMICategory(bmi) {{
  if (bmi < 18.5) return {{ label: 'Underweight', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }};
  if (bmi < 25) return {{ label: 'Normal Weight', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }};
  if (bmi < 30) return {{ label: 'Overweight', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }};
  if (bmi < 35) return {{ label: 'Obese (Class I)', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }};
  return {{ label: 'Severely Obese (Class II+)', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }};
}}

export function getBPCategory(ap_hi, ap_lo) {{
  const hi = Number(ap_hi);
  const lo = Number(ap_lo);
  if (hi > 180 || lo > 120) {{
    return {{
      stage: 'Hypertensive Crisis',
      level: 4,
      desc: 'Immediate emergency medical consultation advised',
      color: 'text-rose-500',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500'
    }};
  }}
  if (hi >= 140 || lo >= 90) {{
    return {{
      stage: 'Hypertension Stage 2',
      level: 3,
      desc: 'Consistent with clinical Stage 2 HTN criteria',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    }};
  }}
  if ((hi >= 130 && hi <= 139) || (lo >= 80 && lo <= 89)) {{
    return {{
      stage: 'Hypertension Stage 1',
      level: 2,
      desc: 'Moderate vascular strain; lifestyle & clinical attention needed',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    }};
  }}
  if (hi >= 120 && hi <= 129 && lo < 80) {{
    return {{
      stage: 'Elevated Blood Pressure',
      level: 1,
      desc: 'Early elevation above optimal baseline',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30'
    }};
  }}
  return {{
    stage: 'Normal Blood Pressure',
    level: 0,
    desc: 'Optimal systolic < 120 and diastolic < 80 mmHg',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30'
  }};
}}

export function predictCardiovascularRisk(patientData) {{
  const bmi = calculateBMI(patientData.weight, patientData.height);
  
  const inputs = {{
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
  }};

  let z = MODEL_PARAMS.bias;
  const contributions = [];

  for (const [feat, param] of Object.entries(MODEL_PARAMS.features)) {{
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

    contributions.push({{
      feature: feat,
      label: friendlyName,
      effect: Number(effect.toFixed(3)),
      raw: val,
      impact: effect > 0.05 ? 'elevates' : effect < -0.05 ? 'reduces' : 'neutral'
    }});
  }}

  // Sigmoid
  const probability = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  const probPercent = Math.round(probability * 100);

  let tier = 'Low Risk';
  let tierColor = 'text-emerald-400';
  let tierBg = 'bg-emerald-500/10 border-emerald-500/30';
  let summary = 'Patient profile shows low statistical likelihood of cardiovascular disease based on clinical biomarkers.';

  if (probPercent >= 65) {{
    tier = 'High Risk';
    tierColor = 'text-rose-400';
    tierBg = 'bg-rose-500/10 border-rose-500/30';
    summary = 'Clinical markers indicate significantly elevated cardiovascular disease likelihood. Immediate clinical consultation and lifestyle interventions recommended.';
  }} else if (probPercent >= 35) {{
    tier = 'Moderate Risk';
    tierColor = 'text-amber-400';
    tierBg = 'bg-amber-500/10 border-amber-500/30';
    summary = 'Borderline to moderate cardiovascular disease probability. Key risk drivers like blood pressure, cholesterol, or BMI should be monitored actively.';
  }}

  contributions.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

  return {{
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
  }};
}}
"""

with open('src/utils/mlEngine.js', 'w', encoding='utf-8') as f:
    f.write(code_header)
print("Saved src/utils/mlEngine.js")

# 2. Compute rich dataset statistics for src/data/datasetStats.js
cardio_pos = sum(1 for r in rows if r['cardio'] == '1')
females = sum(1 for r in rows if r['gender'] == '0')
males = sum(1 for r in rows if r['gender'] == '1')

# Age groups
age_data = [
    {"range": "< 40", "total": 0, "cardio": 0},
    {"range": "40 - 49", "total": 0, "cardio": 0},
    {"range": "50 - 54", "total": 0, "cardio": 0},
    {"range": "55 - 59", "total": 0, "cardio": 0},
    {"range": "60+", "total": 0, "cardio": 0},
]
for r in rows:
    a = float(r['age_years'])
    c = int(r['cardio'])
    idx = 0 if a < 40 else (1 if a < 50 else (2 if a < 55 else (3 if a < 60 else 4)))
    age_data[idx]["total"] += 1
    if c == 1:
        age_data[idx]["cardio"] += 1

for item in age_data:
    item["healthy"] = item["total"] - item["cardio"]
    item["rate"] = round((item["cardio"] / item["total"]) * 100, 1)

# BP categories
bp_data = [
    {"category": "Normal (<120/<80)", "total": 0, "cardio": 0},
    {"category": "Elevated (120-129/<80)", "total": 0, "cardio": 0},
    {"category": "Stage 1 HTN (130-139)", "total": 0, "cardio": 0},
    {"category": "Stage 2 HTN (140+/90+)", "total": 0, "cardio": 0},
]
for r in rows:
    hi = float(r['ap_hi'])
    lo = float(r['ap_lo'])
    c = int(r['cardio'])
    if hi < 120 and lo < 80:
        idx = 0
    elif 120 <= hi <= 129 and lo < 80:
        idx = 1
    elif (130 <= hi <= 139) or (80 <= lo <= 89):
        idx = 2
    else:
        idx = 3
    bp_data[idx]["total"] += 1
    if c == 1:
        bp_data[idx]["cardio"] += 1

for item in bp_data:
    item["healthy"] = item["total"] - item["cardio"]
    item["rate"] = round((item["cardio"] / item["total"]) * 100, 1)

# Cholesterol & Glucose levels
chol_data = [
    {"level": "Normal", "total": 0, "cardio": 0},
    {"level": "Above Normal", "total": 0, "cardio": 0},
    {"level": "Well Above Normal", "total": 0, "cardio": 0},
]
for r in rows:
    ch = int(r['cholesterol']) - 1
    chol_data[ch]["total"] += 1
    if int(r['cardio']) == 1:
        chol_data[ch]["cardio"] += 1
for item in chol_data:
    item["healthy"] = item["total"] - item["cardio"]
    item["rate"] = round((item["cardio"] / item["total"]) * 100, 1)

gluc_data = [
    {"level": "Normal", "total": 0, "cardio": 0},
    {"level": "Above Normal", "total": 0, "cardio": 0},
    {"level": "Well Above Normal", "total": 0, "cardio": 0},
]
for r in rows:
    gl = int(r['gluc']) - 1
    gluc_data[gl]["total"] += 1
    if int(r['cardio']) == 1:
        gluc_data[gl]["cardio"] += 1
for item in gluc_data:
    item["healthy"] = item["total"] - item["cardio"]
    item["rate"] = round((item["cardio"] / item["total"]) * 100, 1)

# Lifestyle factors
lifestyle_data = [
    {"factor": "Physical Activity", "group": "Active", "rate": round(sum(1 for r in rows if r['active'] == '1' and r['cardio'] == '1') / sum(1 for r in rows if r['active'] == '1') * 100, 1), "count": sum(1 for r in rows if r['active'] == '1')},
    {"factor": "Physical Activity", "group": "Inactive", "rate": round(sum(1 for r in rows if r['active'] == '0' and r['cardio'] == '1') / sum(1 for r in rows if r['active'] == '0') * 100, 1), "count": sum(1 for r in rows if r['active'] == '0')},
    {"factor": "Smoking", "group": "Smoker", "rate": round(sum(1 for r in rows if r['smoke'] == '1' and r['cardio'] == '1') / sum(1 for r in rows if r['smoke'] == '1') * 100, 1), "count": sum(1 for r in rows if r['smoke'] == '1')},
    {"factor": "Smoking", "group": "Non-Smoker", "rate": round(sum(1 for r in rows if r['smoke'] == '0' and r['cardio'] == '1') / sum(1 for r in rows if r['smoke'] == '0') * 100, 1), "count": sum(1 for r in rows if r['smoke'] == '0')},
    {"factor": "Alcohol", "group": "Drinker", "rate": round(sum(1 for r in rows if r['alco'] == '1' and r['cardio'] == '1') / sum(1 for r in rows if r['alco'] == '1') * 100, 1), "count": sum(1 for r in rows if r['alco'] == '1')},
    {"factor": "Alcohol", "group": "Non-Drinker", "rate": round(sum(1 for r in rows if r['alco'] == '0' and r['cardio'] == '1') / sum(1 for r in rows if r['alco'] == '0') * 100, 1), "count": sum(1 for r in rows if r['alco'] == '0')},
]

# BMI distribution
bmi_data = [
    {"category": "Underweight (<18.5)", "total": 0, "cardio": 0},
    {"category": "Normal (18.5-24.9)", "total": 0, "cardio": 0},
    {"category": "Overweight (25-29.9)", "total": 0, "cardio": 0},
    {"category": "Obese (>=30)", "total": 0, "cardio": 0},
]
for r in rows:
    b = float(r['bmi'])
    c = int(r['cardio'])
    idx = 0 if b < 18.5 else (1 if b < 25 else (2 if b < 30 else 3))
    bmi_data[idx]["total"] += 1
    if c == 1:
        bmi_data[idx]["cardio"] += 1
for item in bmi_data:
    item["healthy"] = item["total"] - item["cardio"]
    item["rate"] = round((item["cardio"] / item["total"]) * 100, 1)

dataset_stats_dict = {
  "totalPatients": total,
  "cardioPositive": cardio_pos,
  "cardioNegative": total - cardio_pos,
  "prevalenceRate": round(cardio_pos / total * 100, 1),
  "females": females,
  "males": males,
  "avgAgeYears": round(sum(float(r['age_years']) for r in rows) / total, 1),
  "avgBMI": round(sum(float(r['bmi']) for r in rows) / total, 1),
  "avgSystolic": round(sum(float(r['ap_hi']) for r in rows) / total, 1),
  "avgDiastolic": round(sum(float(r['ap_lo']) for r in rows) / total, 1),
  "smokerCount": sum(1 for r in rows if r['smoke'] == '1'),
  "alcoCount": sum(1 for r in rows if r['alco'] == '1'),
  "activeCount": sum(1 for r in rows if r['active'] == '1')
}

summary_json = json.dumps(dataset_stats_dict, indent=2)
age_json = json.dumps(age_data, indent=2)
bp_json = json.dumps(bp_data, indent=2)
chol_json = json.dumps(chol_data, indent=2)
gluc_json = json.dumps(gluc_data, indent=2)
lifestyle_json = json.dumps(lifestyle_data, indent=2)
bmi_json = json.dumps(bmi_data, indent=2)

stats_file = f"""// Precomputed statistical aggregates and distributions from 68,636 patient records
export const DATASET_SUMMARY = {summary_json};

export const AGE_DISTRIBUTION = {age_json};

export const BLOOD_PRESSURE_DISTRIBUTION = {bp_json};

export const CHOLESTEROL_DISTRIBUTION = {chol_json};

export const GLUCOSE_DISTRIBUTION = {gluc_json};

export const LIFESTYLE_DISTRIBUTION = {lifestyle_json};

export const BMI_DISTRIBUTION = {bmi_json};
"""

with open('src/data/datasetStats.js', 'w', encoding='utf-8') as f:
    f.write(stats_file)
print("Saved src/data/datasetStats.js")

# 3. Extract sample patients for src/data/samplePatients.js
random.seed(42)
sample_indices = random.sample(range(total), 120)
samples = []
for i in sample_indices:
    r = rows[i]
    samples.append({
        "id": int(r['id']),
        "age_years": int(float(r['age_years'])),
        "gender": int(r['gender']),
        "height": int(float(r['height'])),
        "weight": round(float(r['weight']), 1),
        "ap_hi": int(float(r['ap_hi'])),
        "ap_lo": int(float(r['ap_lo'])),
        "cholesterol": int(r['cholesterol']),
        "gluc": int(r['gluc']),
        "smoke": int(r['smoke']),
        "alco": int(r['alco']),
        "active": int(r['active']),
        "cardio": int(r['cardio']),
        "bmi": round(float(r['bmi']), 1)
    })

samples_json = json.dumps(samples, indent=2)
samples_file = f"""// 120 Representative sample patients extracted from cardio_cleaned.csv (68,636 total cohort)
export const SAMPLE_PATIENTS = {samples_json};
"""

with open('src/data/samplePatients.js', 'w', encoding='utf-8') as f:
    f.write(samples_file)
print("Saved src/data/samplePatients.js")
print("Dataset extraction completed successfully!")
