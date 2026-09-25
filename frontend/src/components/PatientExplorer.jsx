import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download,
  Flame,
  User,
  Cigarette,
  Wine
} from 'lucide-react';
import { SAMPLE_PATIENTS } from '../data/samplePatients';
import { getBMICategory, getBPCategory } from '../utils/mlEngine';

export default function PatientExplorer({ onLoadPatient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cardioFilter, setCardioFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [bpFilter, setBpFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return SAMPLE_PATIENTS.filter(patient => {
      // Search term
      if (searchTerm) {
        const idMatch = patient.id.toString().includes(searchTerm);
        const ageMatch = patient.age_years.toString().includes(searchTerm);
        if (!idMatch && !ageMatch) return false;
      }

      // Cardio filter
      if (cardioFilter !== 'ALL' && patient.cardio !== Number(cardioFilter)) {
        return false;
      }

      // Gender filter
      if (genderFilter !== 'ALL' && patient.gender !== Number(genderFilter)) {
        return false;
      }

      // BP Filter
      if (bpFilter !== 'ALL') {
        if (bpFilter === 'NORMAL' && (patient.ap_hi >= 120 || patient.ap_lo >= 80)) return false;
        if (bpFilter === 'STAGE2' && (patient.ap_hi < 140 && patient.ap_lo < 90)) return false;
      }

      return true;
    });
  }, [searchTerm, cardioFilter, genderFilter, bpFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const exportCSV = () => {
    const headers = ['id,age_years,gender,height,weight,ap_hi,ap_lo,cholesterol,gluc,smoke,alco,active,bmi,cardio'];
    const rows = filteredPatients.map(p => 
      `${p.id},${p.age_years},${p.gender},${p.height},${p.weight},${p.ap_hi},${p.ap_lo},${p.cholesterol},${p.gluc},${p.smoke},${p.alco},${p.active},${p.bmi},${p.cardio}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cardiovascular_patient_cohort.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" />
            Patient Cohort Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified clinical records from the 68,636 dataset cohort. Click "Load" on any record to test live risk inference.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          Export Cohort CSV ({filteredPatients.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Patient ID or Age..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-rose-500/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Cardio Filter */}
        <div>
          <select
            value={cardioFilter}
            onChange={(e) => { setCardioFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-rose-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Diagnosis Outcomes</option>
            <option value="1">CVD Positive (Cardio = 1)</option>
            <option value="0">CVD Negative (Healthy = 0)</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-rose-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Biological Sexes</option>
            <option value="0">Female (0)</option>
            <option value="1">Male (1)</option>
          </select>
        </div>

        {/* BP Category Filter */}
        <div>
          <select
            value={bpFilter}
            onChange={(e) => { setBpFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-rose-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Blood Pressure Stages</option>
            <option value="NORMAL">Normal (&lt;120/&lt;80 mmHg)</option>
            <option value="STAGE2">Stage 2 HTN (&ge;140/&ge;90 mmHg)</option>
          </select>
        </div>
      </div>

      {/* Patient Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Biometrics / BMI</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Metabolic Labs</th>
                <th className="py-3 px-4">Lifestyle</th>
                <th className="py-3 px-4">Actual Target</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    No matching patient records found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => {
                  const bmiCat = getBMICategory(patient.bmi);
                  const bpCat = getBPCategory(patient.ap_hi, patient.ap_lo);
                  const isPositive = patient.cardio === 1;

                  return (
                    <tr key={patient.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-slate-400">
                        #{patient.id}
                      </td>

                      {/* Demographics */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            patient.gender === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {patient.gender === 0 ? 'F' : 'M'}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-200 block">{patient.age_years} yrs</span>
                            <span className="text-[10px] text-slate-500">
                              {patient.gender === 0 ? 'Female' : 'Male'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Biometrics */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-mono text-slate-200 block">
                            {patient.height}cm &bull; {patient.weight}kg
                          </span>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] border font-medium ${bmiCat.color} ${bmiCat.bg} ${bmiCat.border}`}>
                            BMI {patient.bmi} ({bmiCat.label.split(' ')[0]})
                          </span>
                        </div>
                      </td>

                      {/* BP */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-mono font-bold text-slate-200 block">
                            {patient.ap_hi}/{patient.ap_lo} mmHg
                          </span>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] border font-medium ${bpCat.color} ${bpCat.bg} ${bpCat.border}`}>
                            {bpCat.stage}
                          </span>
                        </div>
                      </td>

                      {/* Metabolic */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 text-[11px] font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Chol:</span>
                            <span className={`px-1.5 py-0.2 rounded ${
                              patient.cholesterol === 3 ? 'bg-rose-500/20 text-rose-300 font-bold' :
                              patient.cholesterol === 2 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300'
                            }`}>
                              Level {patient.cholesterol}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Gluc:</span>
                            <span className={`px-1.5 py-0.2 rounded ${
                              patient.gluc === 3 ? 'bg-rose-500/20 text-rose-300 font-bold' :
                              patient.gluc === 2 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300'
                            }`}>
                              Level {patient.gluc}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Lifestyle */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span title={patient.smoke ? "Smoker" : "Non-smoker"} className={`p-1 rounded ${patient.smoke ? 'text-rose-400 bg-rose-500/10' : 'text-slate-600'}`}>
                            <Cigarette className="w-3.5 h-3.5" />
                          </span>
                          <span title={patient.alco ? "Alcohol user" : "Non-drinker"} className={`p-1 rounded ${patient.alco ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600'}`}>
                            <Wine className="w-3.5 h-3.5" />
                          </span>
                          <span title={patient.active ? "Physically active" : "Sedentary"} className={`p-1 rounded ${patient.active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600'}`}>
                            <Activity className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </td>

                      {/* Actual Target */}
                      <td className="py-3 px-4">
                        {isPositive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" />
                            CVD Positive (1)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Healthy (0)
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onLoadPatient(patient)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium inline-flex items-center gap-1 transition-all"
                          title="Simulate this patient in Risk Calculator"
                        >
                          <span>Load</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} patient records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2 text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
