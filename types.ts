export interface FileData {
  name: string;
  type: string;
  data: string; // Base64
}

export interface MatchResult {
  jobTitle: string;
  matchPercentage: number;
  pros: string[];
  cons: string[];
  improvements: string[];
  interviewQuestions: { question: string; answer: string }[]; // Updated to include answer
  reasoning: string;
}

export interface ComparisonCategory {
  name: string;
  resumeAScore: number;
  resumeBScore: number;
  resumeANotes: string;
  resumeBNotes: string;
  winner: 'Resume A' | 'Resume B' | 'Tie';
}

export interface ComparisonResult {
  overallWinner: 'Resume A' | 'Resume B' | 'Tie';
  summary: string;
  categories: ComparisonCategory[];
}

export interface ResumeProfile {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  skills: string;
  experience: {
    role: string;
    company: string;
    duration: string;
    details: string;
  }[];
  projects: {
    title: string;
    link: string;
    technologies: string;
    description: string;
    contributions: string;
  }[];
  awards: {
    title: string;
    issuer: string;
    date: string;
    details: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  interests: string;
}

export enum AnalysisStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
