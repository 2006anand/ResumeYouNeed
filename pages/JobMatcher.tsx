import React, { useState, useEffect } from 'react';
import { AnalysisStatus, FileData, MatchResult } from '../types';
import { matchResumeToJobs, suggestJobDescription, getJobDescriptionSuggestion, checkDailyLimit, incrementDailyLimit } from '../services/geminiService';
import FileUploader from '../components/FileUploader';
import { Loader2, Check, X, ChevronRight, Briefcase, Wand2, Sparkles, Lightbulb, ClipboardList, Target, ChevronDown } from 'lucide-react';

const COMMON_ROLES = [
  "Frontend Engineer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "DevOps Engineer", "Product Manager",
  "UI/UX Designer", "Mobile Developer", "QA Engineer",
  "Cloud Architect", "Security Engineer", "Engineering Manager",
  "AI/ML Engineer", "Data Engineer", "Systems Architect",
  "Game Developer", "Blockchain Developer", "SRE",
  "Cybersecurity Analyst", "Network Engineer", "Technical Writer",
  "Sales Engineer", "Solutions Architect", "Developer Advocate",
  "Embedded Systems Engineer", "Firmware Engineer", "IT Support Specialist",
  "Business Analyst", "Scrum Master", "Project Manager"
];

// --- Speedometer Visualization Component ---
// Renders an animated gauge to show the match percentage
const Speedometer = ({ score }: { score: number }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Delay animation to ensure smooth entry
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    { min: 0, max: 40, color: "#ef4444" },   // Red - Low match
    { min: 40, max: 60, color: "#f59e0b" },  // Amber - Medium
    { min: 60, max: 90, color: "#3b82f6" },  // Blue - Good
    { min: 90, max: 100, color: "#22c55e" }  // Green - Excellent
  ];

  // SVG Configuration
  const width = 280;
  const height = 150;
  const cx = 140;
  const cy = 140;
  const r = 100;
  const strokeWidth = 22; 

  // Helper to calculate SVG path for an arc segment
  const arcPath = (startPercent: number, endPercent: number, radius: number) => {
    const start = Math.max(0, Math.min(100, startPercent));
    const end = Math.max(0, Math.min(100, endPercent));
    const startAngle = 180 + (start / 100) * 180;
    const endAngle = 180 + (end / 100) * 180;
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Needle animation target: -90deg (0%) to 90deg (100%)
  const needleAngle = (score / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden w-full max-w-[300px] mx-auto transition-colors">
       <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-4 z-10 text-center">RESUME SCORE OVERVIEW</h3>
       
       <div className="relative w-full aspect-[2/1.1] flex items-end justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
             <defs>
               <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur stdDeviation="1.5" result="blur" />
                 <feComposite in="SourceGraphic" in2="blur" operator="over" />
               </filter>
             </defs>

             {/* Render colored segments */}
             {sections.map((section, i) => (
               <path 
                 key={i}
                 d={arcPath(section.min, section.max, r)} 
                 fill="none" 
                 stroke={section.color} 
                 strokeWidth={strokeWidth} 
               />
             ))}

             {/* Animated Needle */}
             <g style={{ 
                transformOrigin: `${cx}px ${cy}px`, 
                transform: `rotate(${mounted ? needleAngle : -90}deg)`,
                transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' 
             }}>
                 <path d={`M ${cx-3} ${cy} L ${cx} ${cy - r + 10} L ${cx+3} ${cy} Z`} fill="currentColor" className="text-slate-800 dark:text-slate-200" />
                 <circle cx={cx} cy={cy} r="6" fill="currentColor" className="text-slate-800 dark:text-slate-200" />
                 <circle cx={cx} cy={cy} r="2" fill="currentColor" className="text-white dark:text-slate-800" />
             </g>
          </svg>
       </div>

       <div className="mt-2 text-center z-10">
          <div className="text-3xl font-black text-slate-900 dark:text-white">
             {Math.round(score)}<span className="text-lg text-slate-500">%</span>
          </div>
       </div>
    </div>
  );
};


const JobMatcher: React.FC = () => {
  const [resume, setResume] = useState<FileData | null>(null);
  const [jobDescriptions, setJobDescriptions] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // Status states
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [suggestionStatus, setSuggestionStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [realtimeSuggestion, setRealtimeSuggestion] = useState<string>('');
  
  const [results, setResults] = useState<MatchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Debounce for realtime suggestion to save API calls
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Logic: Only suggest if user has typed enough but not too much, and system isn't busy
      // Reduced debounce time from 1200ms to 600ms for faster response
      if (jobDescriptions.length > 5 && jobDescriptions.length < 200 && status === AnalysisStatus.IDLE) {
        try {
          const suggestion = await getJobDescriptionSuggestion(jobDescriptions, selectedRoles);
          setRealtimeSuggestion(suggestion);
        } catch (e) {
          // Ignore background errors
        }
      } else {
        setRealtimeSuggestion('');
      }
    }, 600); 

    return () => clearTimeout(timer);
  }, [jobDescriptions, selectedRoles, status]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };

  // Trigger full AI rewrite of the job description
  const handleSuggestion = async () => {
    if (!jobDescriptions.trim()) return;
    
    setSuggestionStatus(AnalysisStatus.LOADING);
    try {
      const suggestion = await suggestJobDescription(jobDescriptions);
      setJobDescriptions(suggestion);
      setSuggestionStatus(AnalysisStatus.SUCCESS);
      setRealtimeSuggestion(''); 
    } catch (e) {
      console.error(e);
      setSuggestionStatus(AnalysisStatus.ERROR);
    }
  };

  const acceptRealtimeSuggestion = () => {
    if (realtimeSuggestion) {
      setJobDescriptions(prev => prev + (prev.endsWith(' ') ? '' : ' ') + realtimeSuggestion);
      setRealtimeSuggestion('');
    }
  };

  // Dynamic max limit for the UI indicator
  const MAX_WORDS = 50;
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    
    // Increased soft limit on word count to 500 words to allow pasting full JDs
    if (wordCount <= MAX_WORDS) {
      setJobDescriptions(text);
      setRealtimeSuggestion('');
    } else {
      // Allow deletion even if over limit
      if (text.length < jobDescriptions.length) {
         setJobDescriptions(text);
      }
    }
  };
  
  const currentWordCount = jobDescriptions.trim().split(/\s+/).filter(Boolean).length;

  const handleMatch = async () => {
    const combinedDescription = [
      selectedRoles.length > 0 ? `Target Roles: ${selectedRoles.join(', ')}` : '',
      jobDescriptions
    ].filter(Boolean).join('\n\n');

    if (!resume || !combinedDescription.trim()) {
      setErrorMsg("Please provide a resume and select a role or enter a description.");
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
      const data = await matchResumeToJobs(resume, combinedDescription);
      setResults(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "An error occurred during matching.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const topScore = results.length > 0 ? Math.max(...results.map(r => r.matchPercentage)) : 0;
  const isReady = topScore >= 90;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight animate-fade-in-up">Resume Matcher</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Upload your resume and select target roles or paste custom descriptions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Input Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <FileUploader
            label="1. Upload Resume"
            onFileSelect={setResume}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-lg font-extrabold text-slate-800 dark:text-slate-200 mb-3 tracking-tight">
                2. Select Tech Roles (Optional)
              </label>
              <span className="text-xs text-slate-400">{selectedRoles.length} selected</span>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {COMMON_ROLES.map((role, idx) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border flex items-center gap-1.5 animate-pop-in
                    ${selectedRoles.includes(role)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600'
                    }`}
                  style={{ animationDelay: `${idx * 15}ms` }}
                >
                  {selectedRoles.includes(role) && <Check size={12} className="animate-fade-in" />}
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-lg font-extrabold text-slate-800 dark:text-slate-200 mb-3 tracking-tight">
                3. Custom Job Description
              </label>
              <div className="flex items-center gap-2">
                 <span className={`text-xs font-bold ${currentWordCount >= MAX_WORDS ? 'text-red-500' : 'text-slate-400'}`}>
                   {currentWordCount}/{MAX_WORDS} words
                 </span>
                {jobDescriptions.length > 5 && (
                  <button 
                    onClick={handleSuggestion}
                    disabled={suggestionStatus === AnalysisStatus.LOADING}
                    className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors animate-fade-in"
                  >
                    {suggestionStatus === AnalysisStatus.LOADING ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12} />}
                    {suggestionStatus === AnalysisStatus.LOADING ? 'Rewriting...' : 'AI Enhance'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative group">
              <textarea
                className={`w-full h-40 p-4 rounded-xl border transition-all resize-none bg-slate-50 dark:bg-slate-900 text-sm placeholder:text-slate-400 dark:text-white group-hover:bg-white dark:group-hover:bg-slate-900
                   ${currentWordCount >= MAX_WORDS ? 'border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:ring-2'}`}
                placeholder="Paste Job Description here or type key requirements (Max 50 words)..."
                value={jobDescriptions}
                onChange={handleDescriptionChange}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && realtimeSuggestion) {
                    e.preventDefault();
                    acceptRealtimeSuggestion();
                  }
                }}
              />
              {realtimeSuggestion && (
                 <div className="absolute bottom-4 left-4 right-4 animate-fade-in-up z-10">
                    <div 
                      onClick={acceptRealtimeSuggestion}
                      className="bg-indigo-50 dark:bg-indigo-900/80 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center justify-between text-xs sm:text-sm group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
                        <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{realtimeSuggestion}</span>
                      </div>
                      <span className="text-indigo-400 dark:text-indigo-400 text-[10px] uppercase font-bold tracking-wider group-hover:text-indigo-600 dark:group-hover:text-indigo-200">
                        Tab to add
                      </span>
                    </div>
                 </div>
              )}
            </div>
             <p className="text-xs text-slate-400">
              Start typing to get real-time AI suggestions. Press <strong>Tab</strong> to accept.
            </p>
          </div>

          <button
            onClick={handleMatch}
            disabled={status === AnalysisStatus.LOADING || !resume || (!jobDescriptions && selectedRoles.length === 0)}
            className={`w-full py-4 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all shadow-md active:scale-95
              ${status === AnalysisStatus.LOADING || !resume || (!jobDescriptions && selectedRoles.length === 0)
                ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200 dark:shadow-none'
              }`}
          >
            {status === AnalysisStatus.LOADING ? (
              <>
                <Loader2 className="animate-spin" /> Analyzing Fit...
              </>
            ) : (
              <>
                Analyze Fit <ChevronRight size={20} />
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900 text-sm font-medium animate-fade-in">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Results Section */}
        <div className="space-y-6">
          {status === AnalysisStatus.IDLE && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 min-h-[400px] animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4 animate-bounce-slow">
                 <Briefcase size={32} className="text-slate-300 dark:text-slate-500" />
              </div>
              <p className="font-medium">Ready to analyze</p>
              <p className="text-sm mt-2 text-slate-400 dark:text-slate-600">Upload a resume to begin</p>
            </div>
          )}

          {status === AnalysisStatus.SUCCESS && results.length > 0 && (
            <>
               {/* Dashboard Widgets */}
               <div className="animate-fade-in-up">
                 <Speedometer score={topScore} />
               </div>
               
               <div className="animate-fade-in-up text-center mb-4">
                 <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm ${isReady ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {isReady ? <Check size={16}/> : <Target size={16}/>}
                    {isReady ? "Interview Ready!" : "Needs Improvement for Interview"}
                 </div>
               </div>

              {/* Detailed Breakdown Cards */}
              <div className="space-y-4">
                {results.map((result, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{result.jobTitle}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border
                          ${result.matchPercentage >= 90 ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' :
                            result.matchPercentage >= 60 ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900' :
                            result.matchPercentage >= 40 ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900' :
                            'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'}`}>
                          {result.matchPercentage}% Match
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">{result.reasoning}</p>

                      {/* Pros / Cons / Improvements Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3">
                            <Check size={14} /> Strengths
                          </h4>
                          <ul className="space-y-2">
                            {result.pros.map((pro, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
                            <X size={14} /> Gaps
                          </h4>
                          <ul className="space-y-2">
                            {result.cons.map((con, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                           <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                            <Lightbulb size={14} /> IMPROVEMENT SUGGESTIONS
                          </h4>
                          <ul className="space-y-2">
                            {result.improvements?.map((imp, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                {imp}
                              </li>
                            )) || <p className="text-sm text-slate-400 italic">No specific improvements generated.</p>}
                          </ul>
                        </div>
                      </div>

                      {/* Interview Prep Section */}
                      {result.interviewQuestions && result.interviewQuestions.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4">
                            <ClipboardList size={14} /> Skill Assessment Questions
                          </h4>
                          <div className="space-y-3">
                             {result.interviewQuestions.map((q, i) => (
                               <div key={i} className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 text-sm text-slate-700 dark:text-slate-300 transition-all">
                                  <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">Q{i+1}: {q.question}</div>
                                  <details className="group">
                                    <summary className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 select-none outline-none">
                                      <span>Show Answer</span>
                                      <ChevronDown size={12} className="group-open:rotate-180 transition-transform"/>
                                    </summary>
                                    <div className="mt-3 pl-3 border-l-2 border-indigo-200 dark:border-indigo-700 text-slate-600 dark:text-slate-400 animate-fade-in text-justify">
                                      <span className="font-semibold text-xs uppercase tracking-wide text-slate-500 block mb-1">Model Answer:</span>
                                      {q.answer}
                                    </div>
                                  </details>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatcher;
