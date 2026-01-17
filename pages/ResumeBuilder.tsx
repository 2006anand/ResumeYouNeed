import React, { useState, useEffect, useRef } from 'react';
import { ResumeProfile, AnalysisStatus } from '../types';
import { polishResume, checkDailyLimit, incrementDailyLimit, getDailyUsage } from '../services/geminiService';
import { 
  Loader2, Plus, Trash2, Download, Sparkles, Printer, 
  FolderGit2, Award, BadgeCheck, Link2, ExternalLink, Linkedin, Check, AlertCircle, AlertTriangle, Mail, Phone, LayoutTemplate, PenTool, FileText, Eye, Heart
} from 'lucide-react';

// --- Type Definitions ---
type TemplateType = 'modern' | 'professional' | 'minimalist';

// --- Template Components ---

const ModernTemplate = ({ profile }: { profile: ResumeProfile }) => (
  <div className="p-[15mm] h-full flex flex-col font-sans text-slate-900 leading-normal bg-white">
    {/* 1. Header - Personal Details */}
    <header className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight uppercase">{profile.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 font-medium">
            {profile.email && <div className="flex items-center gap-1"><Mail size={14}/> {profile.email}</div>}
            {profile.phone && <div className="flex items-center gap-1"><Phone size={14}/> {profile.phone}</div>}
        </div>
      </div>
      {profile.linkedin && (
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-700 font-semibold hover:underline text-sm print:text-slate-900 print:no-underline mt-1">
          <Linkedin size={18} className="print:hidden"/>
          <span>LinkedIn</span>
          <ExternalLink size={14} className="print:hidden"/>
        </a>
      )}
    </header>

    <div className="flex flex-col gap-4">
      {/* Summary (Part of Personal) */}
      {profile.summary && (
        <section>
          <p className="text-sm leading-relaxed text-justify text-slate-800">{profile.summary}</p>
        </section>
      )}

      {/* 2. Education */}
      {profile.education.length > 0 && profile.education.some(e => e.school) && (
        <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">Education</h2>
            <div className="space-y-2">
              {profile.education.filter(e => e.school).map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                      <h3 className="font-bold text-sm text-slate-900">{edu.school}</h3>
                      <div className="text-sm text-slate-700">{edu.degree}</div>
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{edu.year}</span>
                </div>
              ))}
            </div>
        </section>
      )}

      {/* 3. Skills */}
      {profile.skills && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">Technical Skills</h2>
          <div className="text-sm leading-relaxed font-medium text-slate-800">
              {profile.skills.split(',').map(s => s.trim()).filter(Boolean).join(' • ')}
          </div>
        </section>
      )}

      {/* 4. Experience */}
      {profile.experience.length > 0 && profile.experience.some(e => e.role) && (
        <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">Experience</h2>
            <div className="space-y-3">
              {profile.experience.filter(e => e.role).map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-sm text-slate-900">{exp.role}</h3>
                      <span className="text-xs text-slate-600 font-medium whitespace-nowrap uppercase tracking-wide">{exp.duration}</span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-700 mb-1">{exp.company}</div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.details}</p>
                </div>
              ))}
            </div>
        </section>
      )}

      {/* 5. Projects */}
      {profile.projects.length > 0 && profile.projects.some(p => p.title) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">Projects</h2>
          <div className="space-y-3">
            {profile.projects.filter(p => p.title).map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-sm text-slate-900">{proj.title}</h3>
                    {proj.link && <span className="text-xs text-indigo-600 underline">{proj.link}</span>}
                </div>
                {proj.technologies && <div className="text-xs font-semibold text-slate-500 mb-1">Stack: {proj.technologies}</div>}
                <p className="text-sm text-slate-700 leading-relaxed">{proj.description}</p>
                {proj.contributions && (
                   <div className="mt-1 text-sm text-slate-600">
                      <span className="font-semibold text-xs uppercase tracking-wide text-slate-500">Impact:</span> {proj.contributions}
                   </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Awards */}
      {profile.awards.length > 0 && profile.awards.some(a => a.title) && (
        <section>
           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">Awards</h2>
           <ul className="space-y-1">
              {profile.awards.filter(a => a.title).map((award, i) => (
                <li key={i} className="text-sm text-slate-700">
                   <span className="font-bold text-slate-900">{award.title}</span> 
                   <span className="text-slate-500 mx-1">—</span>
                   <span>{award.issuer}</span>
                   {award.date && <span className="text-slate-400 text-xs ml-1">({award.date})</span>}
                </li>
              ))}
           </ul>
        </section>
      )}
      
      {/* 7. Certifications */}
      {profile.certifications.length > 0 && profile.certifications.some(c => c.name) && (
        <section>
           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">Certifications</h2>
           <ul className="space-y-1">
              {profile.certifications.filter(c => c.name).map((cert, i) => (
                <li key={i} className="text-sm text-slate-700">
                   <span className="font-bold text-slate-900">{cert.name}</span>
                   <span className="text-slate-500 mx-1">—</span> 
                   <span>{cert.issuer}</span>
                   {cert.year && <span className="text-slate-400 text-xs ml-1">({cert.year})</span>}
                </li>
              ))}
           </ul>
        </section>
      )}

      {/* 8. Interests */}
      {profile.interests && (
        <section>
           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">Interests</h2>
           <p className="text-sm text-slate-700 leading-relaxed">{profile.interests}</p>
        </section>
      )}

      {/* 9. Links */}
      {profile.socialLinks.length > 0 && profile.socialLinks.some(l => l.url) && (
        <section>
           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">Links & Profiles</h2>
           <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
             {profile.socialLinks.filter(l => l.url).map((link, i) => (
                <span key={i} className="font-medium">
                   <span className="text-slate-900">{link.platform || 'Link'}:</span> <a href={link.url} className="text-indigo-600 underline">{link.url.replace(/^https?:\/\/(www\.)?/, '')}</a>
                </span>
             ))}
          </div>
        </section>
      )}
    </div>
  </div>
);

const ProfessionalTemplate = ({ profile }: { profile: ResumeProfile }) => (
  <div className="flex h-full font-sans bg-white text-slate-900">
    {/* Left Sidebar */}
    <div className="w-[32%] bg-slate-100 p-6 border-r border-slate-200 flex flex-col gap-6">
       {/* 1. Header - Personal */}
       <div>
          <h1 className="text-2xl font-bold uppercase text-slate-800 leading-tight mb-2">{profile.fullName || "Your Name"}</h1>
          <div className="text-sm text-slate-600 space-y-1">
             {profile.email && <div className="break-all">{profile.email}</div>}
             {profile.phone && <div>{profile.phone}</div>}
             {profile.linkedin && <div className="break-all text-xs text-indigo-700">{profile.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</div>}
          </div>
       </div>

      {/* 2. Education */}
      {profile.education.length > 0 && profile.education.some(e => e.school) && (
         <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-300 pb-1 mb-2">Education</h3>
            <div className="space-y-3">
              {profile.education.filter(e => e.school).map((edu, i) => (
                <div key={i} className="text-sm">
                   <div className="font-bold text-slate-700">{edu.school}</div>
                   <div className="text-slate-600">{edu.degree}</div>
                   <div className="text-xs text-slate-500 mt-0.5">{edu.year}</div>
                </div>
              ))}
            </div>
         </div>
       )}

       {/* 3. Skills */}
       {profile.skills && (
         <div>
           <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-300 pb-1 mb-2">Skills</h3>
           <div className="flex flex-wrap gap-1">
             {profile.skills.split(',').map((s, i) => (
               <span key={i} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded-sm text-slate-700">{s.trim()}</span>
             ))}
           </div>
         </div>
       )}

       {/* 7. Certifications */}
       {profile.certifications.length > 0 && profile.certifications.some(c => c.name) && (
         <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-300 pb-1 mb-2">Certifications</h3>
            <ul className="space-y-2">
              {profile.certifications.filter(c => c.name).map((cert, i) => (
                <li key={i} className="text-xs text-slate-700">
                   <div className="font-semibold">{cert.name}</div>
                   <div className="text-slate-500">{cert.issuer}, {cert.year}</div>
                </li>
              ))}
            </ul>
         </div>
       )}

       {/* 8. Interests */}
       {profile.interests && (
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-300 pb-1 mb-2">Interests</h3>
            <p className="text-xs text-slate-700">{profile.interests}</p>
          </div>
       )}

       {/* 9. Links */}
       {profile.socialLinks.length > 0 && profile.socialLinks.some(l => l.url) && (
         <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-300 pb-1 mb-2">Links</h3>
            <div className="space-y-1">
              {profile.socialLinks.filter(l => l.url).map((link, i) => (
                <div key={i} className="text-xs truncate">
                   <span className="font-semibold text-slate-700">{link.platform || 'Link'}:</span> <a href={link.url} className="text-indigo-600">{link.url.replace(/^https?:\/\/(www\.)?/, '')}</a>
                </div>
              ))}
            </div>
         </div>
       )}
    </div>

    {/* Right Main Content */}
    <div className="w-[68%] p-8 flex flex-col gap-6">
       {/* Summary */}
       {profile.summary && (
         <div>
           <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm border-b-2 border-slate-800 pb-1 mb-3">Professional Profile</h3>
           <p className="text-sm text-slate-700 leading-relaxed text-justify">{profile.summary}</p>
         </div>
       )}

       {/* 4. Experience */}
       {profile.experience.length > 0 && profile.experience.some(e => e.role) && (
         <div>
           <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm border-b-2 border-slate-800 pb-1 mb-3">Work Experience</h3>
           <div className="space-y-5">
             {profile.experience.filter(e => e.role).map((exp, i) => (
               <div key={i}>
                 <div className="flex justify-between items-baseline mb-1">
                    <div className="font-bold text-slate-800">{exp.role}</div>
                    <div className="text-sm font-semibold text-slate-500">{exp.duration}</div>
                 </div>
                 <div className="text-sm text-indigo-700 font-semibold mb-2">{exp.company}</div>
                 <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.details}</p>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* 5. Projects */}
       {profile.projects.length > 0 && profile.projects.some(p => p.title) && (
         <div>
           <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm border-b-2 border-slate-800 pb-1 mb-3">Key Projects</h3>
           <div className="space-y-4">
             {profile.projects.filter(p => p.title).map((proj, i) => (
               <div key={i}>
                 <div className="flex justify-between items-baseline mb-1">
                    <div className="font-bold text-slate-800 text-sm">{proj.title}</div>
                 </div>
                 <div className="text-xs text-slate-500 mb-1 italic">{proj.technologies}</div>
                 <p className="text-sm text-slate-600 leading-relaxed">{proj.description}</p>
               </div>
             ))}
           </div>
         </div>
       )}
       
       {/* 6. Awards */}
       {profile.awards.length > 0 && profile.awards.some(a => a.title) && (
         <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm border-b-2 border-slate-800 pb-1 mb-3">Awards</h3>
            {profile.awards.filter(a => a.title).map((award, i) => (
              <div key={i} className="mb-2 text-sm text-slate-700">
                <span className="font-bold">{award.title}</span> — {award.issuer} <span className="text-slate-400">({award.date})</span>
              </div>
            ))}
         </div>
       )}
    </div>
  </div>
);

const MinimalistTemplate = ({ profile }: { profile: ResumeProfile }) => (
  <div className="p-[15mm] h-full flex flex-col gap-4 font-serif text-slate-900 leading-normal bg-white">
    {/* 1. Header - Personal */}
    <header className="text-center mb-2">
       <h1 className="text-3xl font-bold uppercase tracking-widest mb-3">{profile.fullName || "Your Name"}</h1>
       <div className="flex justify-center items-center gap-3 text-sm text-slate-600 italic">
          {profile.email && <span>{profile.email}</span>}
          {profile.email && profile.phone && <span>|</span>}
          {profile.phone && <span>{profile.phone}</span>}
       </div>
    </header>

    <div className="flex flex-col gap-5">
       {/* Summary */}
       {profile.summary && (
         <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Profile</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <p className="text-sm leading-relaxed text-justify">{profile.summary}</p>
         </section>
       )}

       {/* 2. Education */}
       {profile.education.length > 0 && profile.education.some(e => e.school) && (
         <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Education</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            {profile.education.filter(e => e.school).map((edu, i) => (
               <div key={i} className="text-sm mb-2">
                  <div className="font-bold">{edu.school}</div>
                  <div>{edu.degree}</div>
                  <div className="text-xs italic">{edu.year}</div>
               </div>
            ))}
         </section>
      )}

      {/* 3. Skills */}
      {profile.skills && (
         <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Skills</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <p className="text-sm leading-relaxed">{profile.skills}</p>
         </section>
      )}

       {/* 4. Experience */}
       {profile.experience.length > 0 && profile.experience.some(e => e.role) && (
         <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Experience</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className="space-y-4">
               {profile.experience.filter(e => e.role).map((exp, i) => (
                 <div key={i}>
                    <div className="flex justify-between font-bold text-sm mb-1">
                       <span>{exp.role}, {exp.company}</span>
                       <span className="italic font-normal">{exp.duration}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{exp.details}</p>
                 </div>
               ))}
            </div>
         </section>
       )}

       {/* 5. Projects */}
       {profile.projects.length > 0 && profile.projects.some(p => p.title) && (
          <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Projects</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className="space-y-3">
               {profile.projects.filter(p => p.title).map((proj, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                       <span className="font-bold">{proj.title}</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-1">{proj.description}</p>
                 </div>
               ))}
            </div>
         </section>
       )}

       {/* 6. Awards */}
       {profile.awards.length > 0 && profile.awards.some(a => a.title) && (
          <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Awards</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            {profile.awards.filter(a => a.title).map((award, i) => (
               <div key={i} className="text-sm mb-1 font-bold">
                  {award.title} — {award.issuer} <span className="font-normal italic">({award.date})</span>
               </div>
            ))}
         </section>
       )}

       {/* 7. Certifications */}
       {profile.certifications.length > 0 && profile.certifications.some(c => c.name) && (
          <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Certifications</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            {profile.certifications.filter(c => c.name).map((cert, i) => (
               <div key={i} className="text-sm mb-1 font-bold">
                  {cert.name} — {cert.issuer} <span className="font-normal italic">({cert.year})</span>
               </div>
            ))}
         </section>
       )}

       {/* 8. Interests */}
       {profile.interests && (
         <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Interests</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <p className="text-sm text-slate-700">{profile.interests}</p>
         </section>
       )}

       {/* 9. Links */}
       {profile.socialLinks.length > 0 && profile.socialLinks.some(l => l.url) && (
         <section>
            <div className="flex items-center gap-4 mb-2">
               <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap">Links</h2>
               <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
               {profile.socialLinks.filter(l => l.url).map((link, i) => (
                  <span key={i}>
                    <span className="font-bold">{link.platform || 'Link'}:</span> <a href={link.url} className="text-slate-600 underline">{link.url.replace(/^https?:\/\/(www\.)?/, '')}</a>
                  </span>
               ))}
            </div>
         </section>
       )}
    </div>
  </div>
);

const ResumeBuilder: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const [profile, setProfile] = useState<ResumeProfile>({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    summary: '',
    education: [{ degree: '', school: '', year: '' }],
    skills: '',
    experience: [{ role: '', company: '', duration: '', details: '' }],
    projects: [{ title: '', link: '', technologies: '', description: '', contributions: '' }],
    awards: [{ title: '', issuer: '', date: '', details: '' }],
    certifications: [{ name: '', issuer: '', year: '' }],
    socialLinks: [{ platform: '', url: '' }],
    interests: ''
  });

  useEffect(() => {
    setUsageCount(getDailyUsage());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        const targetWidth = 794; // A4 px at 96 DPI
        const availableWidth = containerWidth - 32;
        if (availableWidth < targetWidth) {
           setPreviewScale(availableWidth / targetWidth);
        } else {
           setPreviewScale(1);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const handlePolish = async () => {
    const limitCheck = checkDailyLimit();
    if (!limitCheck.allowed) {
        setFeedbackMsg({ type: 'error', text: limitCheck.error || "Limit reached." });
        return;
    }

    setStatus(AnalysisStatus.LOADING);
    setFeedbackMsg(null);
    
    const hasData = profile.fullName || profile.experience.some(e => e.role) || profile.projects.some(p => p.title);

    if (!hasData) {
        setFeedbackMsg({ type: 'info', text: "Please enter your name or at least one job role/project title." });
        setStatus(AnalysisStatus.IDLE);
        return;
    }

    try {
      incrementDailyLimit();
      setUsageCount(getDailyUsage());
      const polished = await polishResume(profile);
      setProfile(polished);
      setFeedbackMsg({ type: 'success', text: "AI Resume generated successfully!" });
      if (window.innerWidth < 1024) setActiveTab('preview');
      setStatus(AnalysisStatus.SUCCESS);
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: "Failed to generate AI content." });
      setStatus(AnalysisStatus.ERROR);
    }
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Helper functions for dynamic fields
  const addField = (key: keyof ResumeProfile, defaultValue: any) => {
    setProfile(prev => ({ ...prev, [key]: [...(prev[key] as any[]), defaultValue] }));
  };
  const removeField = (key: keyof ResumeProfile, index: number) => {
    setProfile(prev => ({ ...prev, [key]: (prev[key] as any[]).filter((_, i) => i !== index) }));
  };
  const updateField = (key: keyof ResumeProfile, index: number, field: string, value: string) => {
    const arr = [...(profile[key] as any[])];
    arr[index] = { ...arr[index], [field]: value };
    setProfile(prev => ({ ...prev, [key]: arr }));
  };

  const handlePrint = () => window.print();
  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    setIsDownloading(true);
    (window as any).html2pdf().set({
      margin: 0,
      filename: `${profile.fullName || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save().then(() => setIsDownloading(false));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1920px] mx-auto">
      {/* Mobile Tab Toggle */}
      <div className="lg:hidden flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-20 z-30">
        <button onClick={() => setActiveTab('editor')} className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${activeTab === 'editor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50' : 'text-slate-500'}`}><PenTool size={16}/> Editor</button>
        <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50' : 'text-slate-500'}`}><Eye size={16}/> Preview</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Editor Column */}
        <div className={`${activeTab === 'editor' ? 'block' : 'hidden'} lg:block space-y-6 pb-24 lg:pb-0`}>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              <Sparkles className="text-indigo-500" /> Resume Editor
            </h2>
            
            <div className="space-y-8">
              {/* 1. Personal Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">1. Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                  <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                  <input type="text" placeholder="Phone" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                  <input type="text" placeholder="LinkedIn URL" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} />
                </div>
                <textarea placeholder="Summary (Brief overview of your career)" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 h-24 dark:text-white" value={profile.summary} onChange={e => setProfile({...profile, summary: e.target.value})} />
              </div>

              {/* 2. Education */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">2. Education</h3>
                  <button onClick={() => addField('education', { degree: '', school: '', year: '' })} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-indigo-500 transition-colors"><Plus size={16}/></button>
                </div>
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="p-4 border dark:border-slate-700 rounded-xl space-y-3 relative group shadow-sm bg-slate-50/30">
                    <button onClick={() => removeField('education', idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <input type="text" placeholder="Degree / Qualification" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={edu.degree} onChange={e => updateField('education', idx, 'degree', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="School / University" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={edu.school} onChange={e => updateField('education', idx, 'school', e.target.value)} />
                      <input type="text" placeholder="Graduation Year" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={edu.year} onChange={e => updateField('education', idx, 'year', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Skills */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">3. Skills</h3>
                <textarea placeholder="Comma separated skills (e.g. React, Node.js, Project Management)" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 h-24 dark:text-white" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} />
              </div>

              {/* 4. Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">4. Experience</h3>
                  <button onClick={() => addField('experience', { role: '', company: '', duration: '', details: '' })} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-indigo-500 transition-colors"><Plus size={16}/></button>
                </div>
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 border dark:border-slate-700 rounded-xl space-y-3 relative shadow-sm bg-slate-50/30">
                    <button onClick={() => removeField('experience', idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <input type="text" placeholder="Job Role" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={exp.role} onChange={e => updateField('experience', idx, 'role', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Company Name" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={exp.company} onChange={e => updateField('experience', idx, 'company', e.target.value)} />
                      <input type="text" placeholder="Duration (e.g. Jan 2020 - Present)" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={exp.duration} onChange={e => updateField('experience', idx, 'duration', e.target.value)} />
                    </div>
                    <textarea placeholder="Bullet points or short description of your role" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 h-24 dark:text-white" value={exp.details} onChange={e => updateField('experience', idx, 'details', e.target.value)} />
                  </div>
                ))}
              </div>

              {/* 5. Projects */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">5. Projects</h3>
                  <button onClick={() => addField('projects', { title: '', technologies: '', description: '' })} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-indigo-500 transition-colors"><Plus size={16}/></button>
                </div>
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 border dark:border-slate-700 rounded-xl space-y-3 relative shadow-sm bg-slate-50/30">
                    <button onClick={() => removeField('projects', idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <input type="text" placeholder="Project Title" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={proj.title} onChange={e => updateField('projects', idx, 'title', e.target.value)} />
                    <input type="text" placeholder="Tech Stack (e.g. Python, SQL)" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={proj.technologies} onChange={e => updateField('projects', idx, 'technologies', e.target.value)} />
                    <textarea placeholder="Describe the project goals and your work" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 h-24 dark:text-white" value={proj.description} onChange={e => updateField('projects', idx, 'description', e.target.value)} />
                  </div>
                ))}
              </div>

              {/* 6. Awards */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">6. Awards</h3>
                  <button onClick={() => addField('awards', { title: '', issuer: '', date: '' })} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-indigo-500 transition-colors"><Plus size={16}/></button>
                </div>
                {profile.awards.map((award, idx) => (
                  <div key={idx} className="p-4 border dark:border-slate-700 rounded-xl space-y-3 relative shadow-sm bg-slate-50/30">
                    <button onClick={() => removeField('awards', idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <input type="text" placeholder="Award Title" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={award.title} onChange={e => updateField('awards', idx, 'title', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Issuer" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={award.issuer} onChange={e => updateField('awards', idx, 'issuer', e.target.value)} />
                      <input type="text" placeholder="Date" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={award.date} onChange={e => updateField('awards', idx, 'date', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 7. Certifications */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">7. Certifications</h3>
                  <button onClick={() => addField('certifications', { name: '', issuer: '', year: '' })} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-indigo-500 transition-colors"><Plus size={16}/></button>
                </div>
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 border dark:border-slate-700 rounded-xl space-y-3 relative shadow-sm bg-slate-50/30">
                    <button onClick={() => removeField('certifications', idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <input type="text" placeholder="Certification Name" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={cert.name} onChange={e => updateField('certifications', idx, 'name', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Issuer" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={cert.issuer} onChange={e => updateField('certifications', idx, 'issuer', e.target.value)} />
                      <input type="text" placeholder="Year" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={cert.year} onChange={e => updateField('certifications', idx, 'year', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 8. Interests */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">8. Interests</h3>
                <textarea placeholder="Hobbies, interests, or extracurricular activities" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700 h-24 dark:text-white" value={profile.interests} onChange={e => setProfile({...profile, interests: e.target.value})} />
              </div>

              {/* 9. Links */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">9. Links</h3>
                  <button onClick={() => addField('socialLinks', { platform: '', url: '' })} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-indigo-500 transition-colors"><Plus size={16}/></button>
                </div>
                {profile.socialLinks.map((link, idx) => (
                  <div key={idx} className="p-4 border dark:border-slate-700 rounded-xl space-y-3 relative shadow-sm bg-slate-50/30">
                    <button onClick={() => removeField('socialLinks', idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Platform (e.g. GitHub)" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={link.platform} onChange={e => updateField('socialLinks', idx, 'platform', e.target.value)} />
                      <input type="text" placeholder="URL" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={link.url} onChange={e => updateField('socialLinks', idx, 'url', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur lg:static lg:bg-transparent lg:p-0 lg:mt-8 z-40 border-t lg:border-0 border-slate-200">
              <button
                onClick={handlePolish}
                disabled={status === AnalysisStatus.LOADING || usageCount >= 5}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95
                  ${status === AnalysisStatus.LOADING || usageCount >= 5
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
              >
                {status === AnalysisStatus.LOADING ? (
                  <><Loader2 className="animate-spin" /> AI Processing...</>
                ) : (
                  <><Sparkles size={20} /> Generate AI Resume</>
                )}
              </button>
              {feedbackMsg && (
                <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in ${feedbackMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {feedbackMsg.type === 'success' ? <Check size={16}/> : <AlertCircle size={16}/>}
                  {feedbackMsg.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} lg:block sticky top-24`}>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <h2 className="text-lg font-bold dark:text-white">Live Preview</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handlePrint} className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg flex items-center justify-center gap-2 text-sm dark:text-white"><Printer size={16}/> Print</button>
                <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm shadow-md">{isDownloading ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>} Export</button>
              </div>
            </div>
            {/* Template Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
              {(['modern', 'professional', 'minimalist'] as TemplateType[]).map(t => (
                <button key={t} onClick={() => setTemplate(t)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${template === t ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div ref={previewContainerRef} className="overflow-hidden flex justify-center bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 min-h-[500px]">
            <div 
              style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', width: '210mm', minHeight: '297mm' }}
              id="resume-preview" 
              className="shadow-2xl print:shadow-none bg-white origin-top"
            >
              {template === 'modern' && <ModernTemplate profile={profile} />}
              {template === 'professional' && <ProfessionalTemplate profile={profile} />}
              {template === 'minimalist' && <MinimalistTemplate profile={profile} />}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center">Templates are optimized for single-page A4 output. Blank sections automatically collapse.</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
