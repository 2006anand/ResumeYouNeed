import React, { useState } from 'react';
import { AnalysisStatus, FileData, ComparisonResult } from '../types';
import { compareResumes, checkDailyLimit, incrementDailyLimit } from '../services/geminiService';
import FileUploader from '../components/FileUploader';
import { Loader2, Trophy, ArrowRight, Minus } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const ResumeComparator: React.FC = () => {
  const [resumeA, setResumeA] = useState<FileData | null>(null);
  const [resumeB, setResumeB] = useState<FileData | null>(null);
  const [context, setContext] = useState<string>('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCompare = async () => {
    if (!resumeA || !resumeB) {
      setErrorMsg("Please upload both resumes.");
      return;
    }

    // Check Daily Limit
    const limitCheck = checkDailyLimit();
    if (!limitCheck.allowed) {
      setErrorMsg(limitCheck.error || "Usage limit reached.");
      return;
    }

    setErrorMsg('');
    setStatus(AnalysisStatus.LOADING);
    try {
      incrementDailyLimit();
      const data = await compareResumes(resumeA, resumeB, context);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "An error occurred during comparison.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight animate-fade-in-up">Resume Comparator</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Side-by-side professional comparison. Upload two resumes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <FileUploader label="Resume A" onFileSelect={setResumeA} />
        </div>
        <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
           <FileUploader label="Resume B" onFileSelect={setResumeB} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Role / Context</label>
          <input
            type="text"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none bg-white dark:bg-slate-900 dark:text-white shadow-sm transition-all"
            placeholder="e.g. Senior Frontend Engineer"
            value={context}
            onChange={e => setContext(e.target.value)}
          />
      </div>

      <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
         <button
            onClick={handleCompare}
            disabled={status === AnalysisStatus.LOADING || !resumeA || !resumeB}
            className={`py-4 px-8 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white transition-all shadow-md active:scale-95
              ${status === AnalysisStatus.LOADING || !resumeA || !resumeB
                ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed text-slate-500 dark:text-slate-400 shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200 dark:shadow-none'
              }`}
          >
            {status === AnalysisStatus.LOADING ? (
              <>
                <Loader2 className="animate-spin" /> Comparing...
              </>
            ) : (
              <>
                Compare Resumes
              </>
            )}
          </button>
      </div>
      {errorMsg && <p className="text-center text-red-600 dark:text-red-400 text-sm font-medium animate-fade-in">{errorMsg}</p>}

      {/* Results Section */}
      {status === AnalysisStatus.SUCCESS && result && (
        <div className="space-y-8 animate-fade-in">

          {/* Winner Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-900 dark:to-blue-900 rounded-2xl p-8 text-white text-center shadow-xl relative overflow-hidden animate-pop-in">
             <div className="relative z-10">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200 mb-4">Analysis Result</h2>
                <div className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-4">
                   {result.overallWinner === 'Tie' ? 'It\'s a Tie' : <span><span className="text-indigo-200 font-light">Winner:</span> {result.overallWinner}</span>}
                </div>
                <p className="mt-6 text-indigo-50 max-w-3xl mx-auto text-lg leading-relaxed font-medium border-t border-indigo-500 pt-6">"{result.summary}"</p>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chart Column */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center animate-slide-in-right" style={{ animationDelay: '200ms' }}>
               <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-wider mb-8">Score Distribution</h3>
               <div className="w-full h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={result.categories}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Resume A" dataKey="resumeAScore" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
                      <Radar name="Resume B" dataKey="resumeBScore" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                      <Legend />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    </RadarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Detailed Categories Column */}
            <div className="lg:col-span-2 space-y-4">
               {result.categories.map((cat, idx) => (
                 <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: `${300 + (idx * 150)}ms` }}>
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                       <div className="flex items-center gap-4 text-sm font-bold">
                          <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div> A: {cat.resumeAScore}</span>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span className="flex items-center gap-2 text-red-500 dark:text-red-400"><div className="w-2 h-2 bg-red-500 rounded-full"></div> B: {cat.resumeBScore}</span>
                       </div>
                    </div>
                    {/* Progress Bars */}
                    <div className="flex flex-col gap-2 mb-6">
                       <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${cat.resumeAScore}%` }}></div>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-red-400 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${cat.resumeBScore}%` }}></div>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900">
                          <strong className="text-indigo-800 dark:text-indigo-300 text-xs uppercase tracking-wide block mb-2">Resume A Analysis</strong>
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{cat.resumeANotes}</p>
                       </div>
                       <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                          <strong className="text-red-800 dark:text-red-300 text-xs uppercase tracking-wide block mb-2">Resume B Analysis</strong>
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{cat.resumeBNotes}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ResumeComparator;
