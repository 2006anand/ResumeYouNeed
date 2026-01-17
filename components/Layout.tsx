import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, FileText, BarChart2, PenTool, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const isBuilder = location.pathname === '/build';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-white bg-indigo-700 dark:bg-indigo-900' 
      : 'text-indigo-100 hover:text-white hover:bg-indigo-600 dark:hover:bg-slate-700';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <nav className="bg-indigo-600 dark:bg-slate-800 shadow-md sticky top-0 z-50 print:hidden transition-colors duration-300">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isBuilder ? 'w-full max-w-[1920px]' : 'max-w-7xl'}`}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <span className="font-bold text-xl text-white tracking-tight drop-shadow-sm">ResumeYouNeed</span>
              </Link>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-2">
                  <Link to="/" className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 ${isActive('/')}`}>
                    Home
                  </Link>
                  <Link to="/build" className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${isActive('/build')}`}>
                    <PenTool size={16} /> Builder
                  </Link>
                  <Link to="/match" className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${isActive('/match')}`}>
                    <FileText size={16} /> Match
                  </Link>
                  <Link to="/compare" className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${isActive('/compare')}`}>
                    <BarChart2 size={16} /> Compare
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-500 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <div className="md:hidden flex justify-around bg-indigo-800 dark:bg-slate-900 py-3 border-t border-indigo-700 dark:border-slate-800">
           <Link to="/" className={`p-2 rounded-md ${isActive('/')}`}><Briefcase size={24}/></Link>
           <Link to="/build" className={`p-2 rounded-md ${isActive('/build')}`}><PenTool size={24}/></Link>
           <Link to="/match" className={`p-2 rounded-md ${isActive('/match')}`}><FileText size={24}/></Link>
           <Link to="/compare" className={`p-2 rounded-md ${isActive('/compare')}`}><BarChart2 size={24}/></Link>
        </div>
      </nav>

      <main className={`flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 print:p-0 print:w-full print:max-w-none ${isBuilder ? 'max-w-[1920px]' : 'max-w-7xl'}`}>
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 print:hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm font-medium space-y-2">
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-widest uppercase opacity-80">
            We Built ATS Friendly Resume
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
