import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  Users, 
  Activity, 
  Heart, 
  TrendingUp, 
  ShieldAlert, 
  Scale, 
  Flame, 
  Sparkles,
  Info,
  Server
} from 'lucide-react';
import { 
  DATASET_SUMMARY, 
  AGE_DISTRIBUTION, 
  BLOOD_PRESSURE_DISTRIBUTION, 
  CHOLESTEROL_DISTRIBUTION, 
  GLUCOSE_DISTRIBUTION, 
  LIFESTYLE_DISTRIBUTION,
  BMI_DISTRIBUTION 
} from '../data/datasetStats';
import { fetchDatasetStats } from '../utils/api';

export default function AnalyticsDashboard() {
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    fetchDatasetStats().then(stats => {
      if (stats) setLiveStats(stats);
    });
  }, []);

  const totalPatients = liveStats ? liveStats.total_records : DATASET_SUMMARY.totalPatients;
  const positivePct = liveStats ? liveStats.cardio_positive_percentage : DATASET_SUMMARY.prevalenceRate;

  const genderPie = [
    { name: 'Female', value: DATASET_SUMMARY.females, color: '#f43f5e' },
    { name: 'Male', value: DATASET_SUMMARY.males, color: '#38bdf8' }
  ];

  const prevalencePie = [
    { name: 'CVD Positive', value: liveStats ? liveStats.cardio_positive_count : DATASET_SUMMARY.cardioPositive, color: '#f43f5e' },
    { name: 'CVD Negative', value: liveStats ? liveStats.cardio_negative_count : DATASET_SUMMARY.cardioNegative, color: '#10b981' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />
              Population Health Intelligence
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Cardiovascular Cohort Analytics ({totalPatients.toLocaleString()} Patients)
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Comprehensive statistical distribution and epidemiological correlation analysis from the cleaned clinical dataset.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {liveStats && (
              <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                Live FastAPI Sync
              </span>
            )}
            <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-medium">
              {positivePct}% Cohort Prevalence
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
              GradientBoosting ML
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Patients */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Patients</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-mono">
              {DATASET_SUMMARY.totalPatients.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Verified clinical records</span>
          </div>
        </div>

        {/* Prevalence */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">CVD Cases</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-rose-400 font-mono">
              {DATASET_SUMMARY.prevalenceRate}%
            </div>
            <span className="text-[10px] text-slate-500">{DATASET_SUMMARY.cardioPositive.toLocaleString()} positive</span>
          </div>
        </div>

        {/* Median Age */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Age</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-mono">
              {DATASET_SUMMARY.avgAgeYears} yrs
            </div>
            <span className="text-[10px] text-slate-500">Range: 29 - 64 yrs</span>
          </div>
        </div>

        {/* Mean BP */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg BP</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-mono">
              {DATASET_SUMMARY.avgSystolic}/{DATASET_SUMMARY.avgDiastolic}
            </div>
            <span className="text-[10px] text-slate-500">mmHg (Systolic/Diastolic)</span>
          </div>
        </div>

        {/* Mean BMI */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg BMI</span>
            <Scale className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-mono">
              {DATASET_SUMMARY.avgBMI}
            </div>
            <span className="text-[10px] text-slate-500">kg/m² (Overweight threshold)</span>
          </div>
        </div>

        {/* Physical Activity */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Cohort</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {((DATASET_SUMMARY.activeCount / DATASET_SUMMARY.totalPatients) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500">{DATASET_SUMMARY.activeCount.toLocaleString()} patients</span>
          </div>
        </div>
      </div>

      {/* Row 1: Age Decade Impact & Blood Pressure Staging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Decade vs CVD Incidence */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                Age Progression vs. CVD Prevalence
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                CVD rates climb steeply from 23.9% under age 40 to 66.7% for seniors 60+
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={AGE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(val, name) => [val.toLocaleString(), name === 'cardio' ? 'CVD Positive' : name === 'healthy' ? 'Healthy' : name]}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                  formatter={(value) => value === 'cardio' ? 'CVD Positive' : 'Healthy'}
                />
                <Bar dataKey="healthy" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cardio" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Pressure Staging vs Risk */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                AHA Blood Pressure Stages vs. CVD Rate
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prevalence jumps from 22.2% (Normal BP) to 80.1% (Stage 2 Hypertension)
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BLOOD_PRESSURE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'CVD Prevalence Rate']}
                />
                <Bar dataKey="rate" fill="#f43f5e" radius={[6, 6, 0, 0]}>
                  {BLOOD_PRESSURE_DISTRIBUTION.map((entry, index) => {
                    const colors = ['#10b981', '#eab308', '#f97316', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Metabolic Comorbidity (Cholesterol & Glucose) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cholesterol Risk Escalation */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Serum Cholesterol Level vs. Disease Incidence
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Normal (Level 1: 43.5%) vs Above Normal (Level 2: 59.6%) vs High (Level 3: 76.3%)
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHOLESTEROL_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="level" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'CVD Positive Rate']}
                />
                <Bar dataKey="rate" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Glucose Level Comorbidity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Fasting Blood Glucose vs. Disease Incidence
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Normal (Level 1: 47.9%) vs Above Normal (Level 2: 59.3%) vs Diabetic Range (Level 3: 61.6%)
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GLUCOSE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="level" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'CVD Positive Rate']}
                />
                <Bar dataKey="rate" fill="#38bdf8" radius={[6, 6, 0, 0]}>
                  <Cell fill="#38bdf8" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: BMI vs Risk & Cohort Demographics Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BMI Categories */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-yellow-400" />
              Body Mass Index (BMI) Cohort Stratification
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Normal weight patients experience 43.1% CVD incidence vs 56.4% for Obese patients
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BMI_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'CVD Rate']}
                />
                <Area type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#bmiGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Composition Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Cohort Demographics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Biological sex representation across 68.6K patients
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderPie}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [val.toLocaleString(), 'Patients']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] text-rose-300 font-mono block">Female (65.1%)</span>
              <span className="text-xs font-bold text-slate-200">{DATASET_SUMMARY.females.toLocaleString()}</span>
            </div>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-[10px] text-cyan-300 font-mono block">Male (34.9%)</span>
              <span className="text-xs font-bold text-slate-200">{DATASET_SUMMARY.males.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
