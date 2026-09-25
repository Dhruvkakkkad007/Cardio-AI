import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  BookOpen, 
  Scale, 
  Flame, 
  Sparkles,
  Info
} from 'lucide-react';

export default function ClinicalGuidelines() {
  const bpCategories = [
    {
      category: 'Normal Blood Pressure',
      systolic: '< 120 mmHg',
      diastolic: '< 80 mmHg',
      action: 'Maintain healthy lifestyle, annual checkup',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
      category: 'Elevated Blood Pressure',
      systolic: '120 - 129 mmHg',
      diastolic: '< 80 mmHg',
      action: 'Lifestyle modification, sodium restriction, reassess in 3-6 months',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/30'
    },
    {
      category: 'Hypertension Stage 1',
      systolic: '130 - 139 mmHg',
      diastolic: '80 - 89 mmHg',
      action: 'Lifestyle changes + clinical risk calculation for anti-hypertensive therapy',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      category: 'Hypertension Stage 2',
      systolic: '≥ 140 mmHg',
      diastolic: '≥ 90 mmHg',
      action: 'Prompt medication (often dual therapy) + monthly clinical monitoring',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30'
    },
    {
      category: 'Hypertensive Crisis',
      systolic: '> 180 mmHg',
      diastolic: '> 120 mmHg',
      action: 'Immediate emergency evaluation; high risk of acute organ damage',
      color: 'text-rose-500 font-bold',
      bg: 'bg-rose-500/20 border-rose-500'
    }
  ];

  const essentials = [
    {
      title: 'Eat Better (DASH Diet)',
      desc: 'Prioritize whole grains, lean proteins, vegetables, and unsaturated fats while capping sodium under 1,500 - 2,000 mg/day.',
      impact: 'Up to -11 mmHg Systolic BP'
    },
    {
      title: 'Be More Active',
      desc: 'Engage in at least 150 minutes of moderate aerobic exercise or 75 minutes of vigorous exercise weekly.',
      impact: '20-30% Lower CVD Mortality'
    },
    {
      title: 'Quit Tobacco & Vaping',
      desc: 'Tobacco use accelerates endothelial wall stiffness and atheroma formation. Risk drops rapidly post-cessation.',
      impact: '50% Risk Drop in 12 Months'
    },
    {
      title: 'Manage Healthy Weight',
      desc: 'Target a BMI between 18.5 and 24.9 kg/m² to prevent excess vascular workload and left ventricular hypertrophy.',
      impact: '-1 mmHg BP per 1 kg loss'
    },
    {
      title: 'Control Cholesterol',
      desc: 'Track non-HDL cholesterol and Apolipoprotein B to mitigate arterial plaque calcification and coronary thrombosis.',
      impact: 'Statins reduce major events by 25%'
    },
    {
      title: 'Regulate Blood Sugar',
      desc: 'Sustain fasting blood glucose under 100 mg/dL (HbA1c < 5.7%) to safeguard microvascular integrity.',
      impact: 'Prevents diabetic cardiomyopathy'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold tracking-wide uppercase">
          <BookOpen className="w-4 h-4" />
          Clinical Reference & Prevention
        </div>
        <h2 className="text-xl font-bold text-slate-100 mt-1">
          AHA/ACC Cardiovascular Guidelines & Biomarker Reference
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-based standards for blood pressure staging, lipid targets, and proactive risk mitigation.
        </p>
      </div>

      {/* AHA Blood Pressure Staging Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              AHA/ACC Blood Pressure Classification (2017 Guideline)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Blood pressure is the leading modifiable contributor to cardiovascular events in the dataset.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-3 px-4">BP Category</th>
                <th className="py-3 px-4">Systolic (ap_hi)</th>
                <th className="py-3 px-4">Diastolic (ap_lo)</th>
                <th className="py-3 px-4">Recommended Clinical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {bpCategories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 font-semibold">
                    <span className={`px-2.5 py-1 rounded-full border text-[11px] ${cat.bg} ${cat.color}`}>
                      {cat.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200">{cat.systolic}</td>
                  <td className="py-3 px-4 font-mono text-slate-200">{cat.diastolic}</td>
                  <td className="py-3 px-4 text-slate-300">{cat.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Understanding Key Biomarkers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="p-2 w-fit rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Systolic & Diastolic BP</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            In our 68.6K patient analysis, Systolic Blood Pressure (<code className="text-rose-400">ap_hi</code>) was the single strongest positive predictor. Chronic elevated vascular pressure strains coronary arteries and accelerates atherosclerosis.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="p-2 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Serum Cholesterol Levels</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Patients in Level 3 (high cholesterol) exhibited a 76.3% CVD prevalence rate compared to 43.5% in Level 1. Excess LDL particles penetrate the vascular intima, triggering inflammatory plaque buildup.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Adiposity & Physical Activity</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Physical inactivity and high BMI compound arterial stiffness. Regular aerobic exercise reduces systemic peripheral resistance and improves insulin sensitivity, providing statistically significant protective benefits.
          </p>
        </div>
      </div>

      {/* Prevention Strategies (Life's Essential 8) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Core Prevention Strategies (Cardiovascular Health Checklist)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key interventions identified by the American Heart Association to prevent or reverse early-stage coronary risks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {essentials.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">{item.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {item.impact}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
