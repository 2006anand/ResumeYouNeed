import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, FileText, Users, Zap, CheckCircle2, PenTool, 
  GraduationCap, Briefcase, ChevronLeft, Gauge, Scale, Mail, Loader2 
} from 'lucide-react';

const Home: React.FC = () => {
  // --- State Management ---
  const [role, setRole] = useState<'student' | 'hr' | null>(null);
  
  // Email verification state
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // --- Handlers ---

  const handleRoleSelect = (selectedRole: 'student' | 'hr') => {
    setRole(selectedRole);
    // Reset auth state if they switch roles or are just starting
    setIsAuthenticated(false);
    setEmail('');
    setError('');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@') || email.length < 5) {
      setError('Please enter a valid email address.');
      return;
    }

    // Simulate backend verification process
    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      // Save email for usage limit tracking
      localStorage.setItem('user_email', email);
      setIsVerifying(false);
      setIsAuthenticated(true);
    }, 800); 
  };

  const resetRole = () => {
    setRole(null);
    setIsAuthenticated(false);
    setEmail('');
    setError('');
    // Optional: Clear email on reset if we want to force re-login behavior
    // localStorage.removeItem('user_email'); 
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10">
      
      {/* 1. Role Selection Screen */}
      {!role && (
        <div className="text-center space-y-12 max-w-4xl w-full animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">you are?</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Select your role to access tailored tools.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 px-4">
            <button 
              onClick={() => handleRoleSelect('student')}
              className="group relative bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-6 hover:-translate-y-2 active:scale-95"
            >
              <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <GraduationCap size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Student / Job Seeker</h2>
                <p className="text-slate-500 dark:text-slate-400">I want to build a resume or check my resume score.</p>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('hr')}
              className="group relative bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-6 hover:-translate-y-2 active:scale-95"
            >
              <div className="w-24 h-24 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <Briefcase size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">HR / Recruiter</h2>
                <p className="text-slate-500 dark:text-slate-400">I want to match candidates and compare profiles.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. Email Verification Gate */}
      {role && !isAuthenticated && (
        <div className="w-full max-w-md px-4 animate-pop-in">
           <button 
            onClick={resetRole} 
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium mb-8 transition-colors"
          >
            <ChevronLeft size={20} /> Back
          </button>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 text-center space-y-6">
             <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your Identity</h2>
               <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                 Please enter your email to access the {role === 'student' ? 'Student' : 'HR'} dashboard.
               </p>
             </div>

             <form onSubmit={handleEmailSubmit} className="space-y-4">
               <div className="relative">
                 <input
                   type="email"
                   placeholder="name@example.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className={`w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 transition-all
                     ${error 
                       ? 'border-red-300 focus:border-red-500 focus:ring-red-100 dark:border-red-900' 
                       : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900 dark:text-white'
                     }`}
                   autoFocus
                 />
                 {error && <p className="text-red-500 text-xs text-left mt-2 ml-1">{error}</p>}
               </div>

               <button
                 type="submit"
                 disabled={isVerifying || !email}
                 className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {isVerifying ? (
                   <>
                     <Loader2 className="animate-spin" size={20} /> Verifying...
                   </>
                 ) : (
                   <>
                     Access Dashboard <ArrowRight size={20} />
                   </>
                 )}
               </button>
             </form>
             <p className="text-xs text-slate-400">Secure access powered by CareerMatch AI</p>
          </div>
        </div>
      )}

      {/* 3. Student Dashboard (Level 2) */}
      {role === 'student' && isAuthenticated && (
        <div className="w-full max-w-4xl px-4 animate-slide-in-right">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={resetRole} 
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              <ChevronLeft size={20} /> Switch Role
            </button>
            <div className="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Logged in as: <span className="font-semibold text-slate-600 dark:text-slate-300">{email}</span>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Student Tools</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Everything you need to land your dream job.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/build" className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Resume Builder</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">Draft a professional, single-page resume tailored for specific roles. AI polishes your experience and skills.</p>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                Start Building <ArrowRight size={16}/>
              </span>
            </Link>

            <Link to="/match" className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300 flex flex-col">
               <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gauge size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Resume Score</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">Already have a resume? Check your score, get AI feedback, and receive custom interview questions.</p>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                Check Score <ArrowRight size={16}/>
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. HR Dashboard (Level 2) */}
      {role === 'hr' && isAuthenticated && (
        <div className="w-full max-w-4xl px-4 animate-slide-in-right">
           <div className="flex justify-between items-center mb-8">
            <button 
              onClick={resetRole} 
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              <ChevronLeft size={20} /> Switch Role
            </button>
            <div className="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Logged in as: <span className="font-semibold text-slate-600 dark:text-slate-300">{email}</span>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">HR & Recruiter Tools</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Optimize your hiring workflow with AI.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/match" className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300">
               <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Match Resume</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Analyze candidate suitability against job descriptions with detailed scoring.</p>
              <span className="inline-flex items-center justify-center w-full py-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors">Launch Matcher</span>
            </Link>

            <Link to="/compare" className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300">
               <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scale size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Compare Resumes</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Side-by-side comparison of two candidates to make data-driven hiring decisions.</p>
               <span className="inline-flex items-center justify-center w-full py-3 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">Compare Now</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
