import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  BarChart3, 
  Database, 
  BookOpen, 
  Shield, 
  Sparkles,
  Github,
  Stethoscope,
  Server
} from 'lucide-react';
import RiskCalculator from './components/RiskCalculator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PatientExplorer from './components/PatientExplorer';
import ClinicalGuidelines from './components/ClinicalGuidelines';
import { checkHealth } from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [backendInfo, setBackendInfo] = useState({
    connected: false,
    modelType: 'Checking...',
    loading: true
  });
  const [patientData, setPatientData] = useState({
    age_years: 52,
    gender: 1,
    height: 170,
    weight: 78,
    ap_hi: 130,
    ap_lo: 85,
    cholesterol: 2,
    gluc: 1,
    smoke: 0,
    alco: 0,
    active: 1
  });

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = () => {
      checkHealth().then(status => {
        if (isMounted) {
          setBackendInfo({
            connected: status.connected,
            modelType: status.connected ? 'FastAPI Connected' : 'Offline (Local Engine)',
            loading: false
          });
        }
      });
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 10000); // Check every 10s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLoadPatient = (loadedPatient) => {
    setPatientData({
      age_years: loadedPatient.age_years,
      gender: loadedPatient.gender,
      height: loadedPatient.height,
      weight: loadedPatient.weight,
      ap_hi: loadedPatient.ap_hi,
      ap_lo: loadedPatient.ap_lo,
      cholesterol: loadedPatient.cholesterol,
      gluc: loadedPatient.gluc,
      smoke: loadedPatient.smoke,
      alco: loadedPatient.alco,
      active: loadedPatient.active
    });
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'calculator', label: 'AI Risk Predictor', icon: Stethoscope, badge: 'Interactive' },
    { id: 'analytics', label: 'Cohort Analytics', icon: BarChart3, badge: '68.6K Rows' },
    { id: 'explorer', label: 'Patient Explorer', icon: Database, badge: 'Records' },
    { id: 'guidelines', label: 'Clinical Guidelines', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Ambient Glow Gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-rose-500/10 via-rose-950/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#060a12]/85 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-500/25">
                <Heart className="w-5 h-5 fill-white animate-heartbeat" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060a12]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    CardioPulse
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    AI Studio
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block -mt-0.5">
                  Cardiovascular Disease Risk & Analytics
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${
                        isActive ? 'bg-black/30 text-rose-100' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Status / Model Badge */}
            <div className="flex items-center gap-3">
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                backendInfo.connected 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${backendInfo.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <Server className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] font-medium">{backendInfo.modelType}</span>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-400 bg-slate-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' && (
          <RiskCalculator 
            patientData={patientData} 
            setPatientData={setPatientData} 
          />
        )}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'explorer' && (
          <PatientExplorer onLoadPatient={handleLoadPatient} />
        )}
        {activeTab === 'guidelines' && <ClinicalGuidelines />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a12]/90 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>CardioPulse AI &bull; Powered by 68,636 patient records (<code className="text-slate-400">cardio_cleaned.csv</code>)</span>
          </div>
          <div className="text-center md:text-right text-[11px] text-slate-500">
            Clinical decision support prototype &bull; Built with React &amp; Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
