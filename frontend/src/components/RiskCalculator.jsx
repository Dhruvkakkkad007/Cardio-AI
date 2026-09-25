import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Wine, 
  Cigarette, 
  User, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  RotateCcw,
  Sparkles,
  Info,
  Scale,
  Gauge,
  Server
} from 'lucide-react';
import { predictCardiovascularRisk, calculateBMI, getBMICategory, getBPCategory } from '../utils/mlEngine';
import { fetchCvdPrediction } from '../utils/api';

const PRESETS = [
  {
    name: "Young Active Athlete",
    badge: "Low Risk Profile",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    data: {
      age_years: 28,
      gender: 0,
      height: 168,
      weight: 58,
      ap_hi: 112,
      ap_lo: 72,
      cholesterol: 1,
      gluc: 1,
      smoke: 0,
      alco: 0,
      active: 1
    }
  },
  {
    name: "Middle-Aged Office Worker",
    badge: "Moderate Risk Profile",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    data: {
      age_years: 51,
      gender: 1,
      height: 175,
      weight: 84,
      ap_hi: 136,
      ap_lo: 88,
      cholesterol: 2,
      gluc: 1,
      smoke: 0,
      alco: 1,
      active: 0
    }
  },
  {
    name: "Hypertensive Smoker",
    badge: "High Risk Profile",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    data: {
      age_years: 58,
      gender: 1,
      height: 172,
      weight: 92,
      ap_hi: 158,
      ap_lo: 98,
      cholesterol: 3,
      gluc: 2,
      smoke: 1,
      alco: 1,
      active: 0
    }
  },
  {
    name: "Senior Diabetic Case",
    badge: "Critical Risk Profile",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    data: {
      age_years: 64,
      gender: 0,
      height: 160,
      weight: 88,
      ap_hi: 165,
      ap_lo: 95,
      cholesterol: 3,
      gluc: 3,
      smoke: 0,
      alco: 0,
      active: 0
    }
  }
];

export default function RiskCalculator({ patientData, setPatientData }) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [prediction, setPrediction] = useState(() => predictCardiovascularRisk(patientData));
  const [isComputing, setIsComputing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initial load prediction
  useEffect(() => {
    let isMounted = true;
    fetchCvdPrediction(patientData).then(result => {
      if (isMounted) setPrediction(result);
    }).catch(() => {
      if (isMounted) setPrediction(predictCardiovascularRisk(patientData));
    });
    return () => { isMounted = false; };
  }, []);

  const runPrediction = async (dataToUse = patientData) => {
    setIsComputing(true);
    setHasUnsavedChanges(false);
    try {
      const result = await fetchCvdPrediction(dataToUse);
      setPrediction(result);
    } catch (err) {
      setPrediction(predictCardiovascularRisk(dataToUse));
    } finally {
      setIsComputing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const applyPreset = (preset) => {
    setPatientData(preset.data);
    setHasUnsavedChanges(true);
  };

  const resetToDefault = () => {
    setPatientData({
      age_years: 50,
      gender: 1,
      height: 170,
      weight: 75,
      ap_hi: 125,
      ap_lo: 80,
      cholesterol: 1,
      gluc: 1,
      smoke: 0,
      alco: 0,
      active: 1
    });
    setHasUnsavedChanges(true);
  };

  // Color mappings for risk score
  const gaugeColor = useMemo(() => {
    if (prediction.probPercent >= 65) return '#f43f5e'; // rose
    if (prediction.probPercent >= 35) return '#f59e0b'; // amber
    return '#10b981'; // emerald
  }, [prediction.probPercent]);

  // Stroke dash calculation for circular gauge (radius = 70 -> circumference = 2 * PI * 70 = 439.82)
  const strokeDashoffset = useMemo(() => {
    const circumference = 439.82;
    const progress = Math.min(100, Math.max(0, prediction.probPercent)) / 100;
    return circumference - (circumference * progress);
  }, [prediction.probPercent]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Presets */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              Quick Clinical Presets
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Select a benchmark patient persona to simulate risk or calibrate inputs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="group px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-500 transition-all flex items-center gap-2 text-slate-200 hover:text-white"
              >
                <span>{preset.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${preset.badgeColor}`}>
                  {preset.data.ap_hi}/{preset.data.ap_lo}
                </span>
              </button>
            ))}
            <button
              onClick={resetToDefault}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center gap-1.5"
              title="Reset inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) & Risk Intelligence (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Clinical Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Demographics & Biometrics */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-100 text-base">Demographics & Biometrics</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">STEP 01</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Age */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Age (Years)</label>
                  <span className="text-xs font-bold text-rose-400 font-mono">{patientData.age_years} yrs</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="75"
                  value={patientData.age_years}
                  onChange={(e) => handleInputChange('age_years', Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>25 yrs</span>
                  <span>50 yrs</span>
                  <span>75 yrs</span>
                </div>
              </div>

              {/* Sex / Gender */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Biological Sex</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 0)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      patientData.gender === 0
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>Female (0)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 1)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      patientData.gender === 1
                        ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>Male (1)</span>
                  </button>
                </div>
              </div>

              {/* Height */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Height (cm)</label>
                  <span className="text-xs font-bold text-slate-200 font-mono">{patientData.height} cm</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="120"
                    max="220"
                    value={patientData.height}
                    onChange={(e) => handleInputChange('height', Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-rose-500/50 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none transition font-mono"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">cm</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Weight (kg)</label>
                  <span className="text-xs font-bold text-slate-200 font-mono">{patientData.weight} kg</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="35"
                    max="180"
                    step="0.5"
                    value={patientData.weight}
                    onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-rose-500/50 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none transition font-mono"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">kg</span>
                </div>
              </div>
            </div>

            {/* Calculated BMI Badge Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/40 px-4 py-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Calculated Body Mass Index:</span>
                <span className="text-sm font-bold text-slate-100 font-mono">{prediction.bmi} kg/m²</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${prediction.bmiCategory.color} ${prediction.bmiCategory.bg} ${prediction.bmiCategory.border}`}>
                {prediction.bmiCategory.label}
              </span>
            </div>
          </div>

          {/* Card 2: Blood Pressure & Hemodynamics */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-100 text-base">Blood Pressure Staging</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">STEP 02</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Systolic (ap_hi) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Systolic Pressure (<span className="text-rose-400 font-mono">ap_hi</span>)
                  </label>
                  <span className="text-xs font-bold text-rose-400 font-mono">{patientData.ap_hi} mmHg</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="220"
                  value={patientData.ap_hi}
                  onChange={(e) => handleInputChange('ap_hi', Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>80</span>
                  <span>120 (Optimal)</span>
                  <span>140 (Stage 2)</span>
                  <span>220</span>
                </div>
              </div>

              {/* Diastolic (ap_lo) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Diastolic Pressure (<span className="text-rose-400 font-mono">ap_lo</span>)
                  </label>
                  <span className="text-xs font-bold text-rose-400 font-mono">{patientData.ap_lo} mmHg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="140"
                  value={patientData.ap_lo}
                  onChange={(e) => handleInputChange('ap_lo', Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>50</span>
                  <span>80 (Optimal)</span>
                  <span>90 (Stage 2)</span>
                  <span>140</span>
                </div>
              </div>
            </div>

            {/* AHA Blood Pressure Staging Badge */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${prediction.bpCategory.bg} ${prediction.bpCategory.border}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-ping ${prediction.bpCategory.color}`} />
                <div>
                  <span className={`text-xs font-bold ${prediction.bpCategory.color}`}>
                    {prediction.bpCategory.stage}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {prediction.bpCategory.desc}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-100">
                  {patientData.ap_hi} / {patientData.ap_lo}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">mmHg</span>
              </div>
            </div>
          </div>

          {/* Card 3: Metabolic Labs & Lifestyle */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-100 text-base">Metabolic Biomarkers & Lifestyle</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">STEP 03</span>
            </div>

            {/* Cholesterol & Glucose Radio Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Cholesterol */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Serum Cholesterol (<span className="text-amber-400 font-mono">cholesterol</span>)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: 1, label: 'Normal', sub: 'Level 1' },
                    { val: 2, label: 'Above', sub: 'Level 2' },
                    { val: 3, label: 'High', sub: 'Level 3' }
                  ].map(lvl => (
                    <button
                      key={lvl.val}
                      type="button"
                      onClick={() => handleInputChange('cholesterol', lvl.val)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        patientData.cholesterol === lvl.val
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs block">{lvl.label}</span>
                      <span className="text-[10px] opacity-70 block font-mono">{lvl.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Glucose */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Fasting Blood Glucose (<span className="text-amber-400 font-mono">gluc</span>)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: 1, label: 'Normal', sub: 'Level 1' },
                    { val: 2, label: 'Above', sub: 'Level 2' },
                    { val: 3, label: 'High', sub: 'Level 3' }
                  ].map(lvl => (
                    <button
                      key={lvl.val}
                      type="button"
                      onClick={() => handleInputChange('gluc', lvl.val)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        patientData.gluc === lvl.val
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs block">{lvl.label}</span>
                      <span className="text-[10px] opacity-70 block font-mono">{lvl.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifestyle Toggles: Smoking, Alcohol, Active */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-xs font-medium text-slate-300 block mb-3">
                Behavioral & Lifestyle Factors
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Smoking */}
                <button
                  type="button"
                  onClick={() => handleInputChange('smoke', patientData.smoke === 1 ? 0 : 1)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    patientData.smoke === 1
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cigarette className="w-4 h-4" />
                    <span className="text-xs font-medium">Smoking</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/30">
                    {patientData.smoke === 1 ? 'YES' : 'NO'}
                  </span>
                </button>

                {/* Alcohol */}
                <button
                  type="button"
                  onClick={() => handleInputChange('alco', patientData.alco === 1 ? 0 : 1)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    patientData.alco === 1
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wine className="w-4 h-4" />
                    <span className="text-xs font-medium">Alcohol</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/30">
                    {patientData.alco === 1 ? 'YES' : 'NO'}
                  </span>
                </button>

                {/* Physical Activity */}
                <button
                  type="button"
                  onClick={() => handleInputChange('active', patientData.active === 1 ? 0 : 1)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    patientData.active === 1
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-medium">Active</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/30">
                    {patientData.active === 1 ? 'ACTIVE' : 'SEDENTARY'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Predict Cardiovascular Risk */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => runPrediction()}
              disabled={isComputing}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm md:text-base shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border active:scale-[0.99] ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-500/30 border-rose-400/50 ring-2 ring-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-500/20 border-rose-500/30'
              }`}
            >
              {isComputing ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-white" />
                  <span>Computing CVD Risk via FastAPI...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white animate-heartbeat shrink-0" />
                  <span>Predict Cardiovascular Risk</span>
                  <ArrowUpRight className="w-5 h-5 shrink-0" />
                </>
              )}
            </button>
            {hasUnsavedChanges && (
              <p className="text-[11px] text-amber-400 text-center mt-2 font-medium animate-fadeIn flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Inputs updated — Click "Predict Cardiovascular Risk" to compute updated risk score
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Real-time AI Risk Intelligence Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Risk Output Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            {/* Top Glow Accent */}
            <div 
              className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: gaugeColor }}
            />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-slate-100 text-base">CVD Risk Stratification</h3>
              </div>
              <button
                onClick={() => window.print()}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition"
                title="Print Medical Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            </div>

            {/* Animated Circular Gauge */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Active Animated Gauge */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={gaugeColor}
                    strokeWidth="12"
                    strokeDasharray="439.82"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease' }}
                  />
                </svg>

                {/* Gauge Center Info */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <div className="relative flex items-center justify-center mb-1">
                    <Heart 
                      className={`w-7 h-7 transition-all duration-500 animate-heartbeat`}
                      style={{ color: gaugeColor }}
                    />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                    {prediction.probPercent}%
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    Calculated Risk
                  </div>
                </div>
              </div>

              {/* Risk Tier Badge */}
              <div className={`mt-3 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${prediction.tierBg} ${prediction.tierColor}`}>
                {prediction.tier}
              </div>
              <p className="text-xs text-slate-400 text-center max-w-sm mt-3 leading-relaxed">
                {prediction.summary}
              </p>
            </div>

            {/* Mini Health Metrics Row */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Vascular State</span>
                <span className={`text-xs font-bold block mt-0.5 ${prediction.bpCategory.color}`}>
                  {prediction.bpCategory.stage}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{patientData.ap_hi}/{patientData.ap_lo} mmHg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Body Adiposity</span>
                <span className={`text-xs font-bold block mt-0.5 ${prediction.bmiCategory.color}`}>
                  {prediction.bmiCategory.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{prediction.bmi} kg/m²</span>
              </div>
            </div>
          </div>

          {/* Feature Impact Attribution (SHAP-style) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="font-semibold text-slate-200 text-sm">Biomarker Risk Attribution</h4>
              </div>
              <span className="text-[10px] text-slate-400">Statistical Impact</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Factors increasing risk (red/orange) vs protective lifestyle habits (green).
            </p>

            <div className="space-y-2.5 pt-1">
              {prediction.contributions.slice(0, 6).map((item, idx) => {
                const isElevating = item.effect > 0;
                const absVal = Math.min(100, Math.abs(item.effect) * 120);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        {isElevating ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {item.label}
                      </span>
                      <span className={`font-mono text-xs font-bold ${isElevating ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isElevating ? `+${item.effect}` : `${item.effect}`}
                      </span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isElevating ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        }`}
                        style={{ width: `${Math.max(8, absVal)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Clinical Recommendations */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-slate-200 text-sm">Personalized Action Plan</h4>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {patientData.ap_hi >= 130 && (
                <li className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Blood Pressure Intervention:</strong> Systolic at {patientData.ap_hi} mmHg is the highest risk driver. Clinical evaluation and DASH dietary sodium reduction recommended.
                  </span>
                </li>
              )}
              {patientData.cholesterol > 1 && (
                <li className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                  <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Lipid Panel Management:</strong> Cholesterol level {patientData.cholesterol} increases arterial plaque vulnerability. Consider statin consultation or omega-3 dietary enrichment.
                  </span>
                </li>
              )}
              {patientData.active === 0 && (
                <li className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Cardiovascular Conditioning:</strong> Incorporate at least 150 minutes of moderate aerobic exercise weekly to lower systemic vascular resistance.
                  </span>
                </li>
              )}
              {patientData.smoke === 1 && (
                <li className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                  <Cigarette className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Smoking Cessation:</strong> Tobacco cessation reduces acute coronary hazard by up to 50% within 12 months.
                  </span>
                </li>
              )}
              {patientData.ap_hi < 130 && patientData.cholesterol === 1 && patientData.active === 1 && (
                <li className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Optimal Biomarkers:</strong> Patient exhibits healthy vascular resistance, normal lipid balance, and regular physical activity. Maintain annual checkups.
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
