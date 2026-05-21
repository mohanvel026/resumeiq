import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Lightbulb, 
  Link as LinkIcon, 
  RotateCcw,
  FileText,
  Sparkles,
  ChevronRight,
  Target,
  ArrowRight,
  Check
} from 'lucide-react';

// ============================================================================
// 1. CUSTOM HOOKS (Business Logic & State Management)
// ============================================================================

const useResumeAnalysis = () => {
  const [resumes, setResumes] = useState([]);
  const [isFetchingResumes, setIsFetchingResumes] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const abortController = new AbortController();
    const fetchResumes = async () => {
      try {
        const response = await api.get('/api/resumes', { signal: abortController.signal });
        setResumes(response.data || []);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Failed to fetch resumes:', err);
          setError('Could not load your resumes. Please refresh the page.');
        }
      } finally {
        setIsFetchingResumes(false);
      }
    };
    fetchResumes();
    return () => abortController.abort();
  }, []);

  const analyzeProfile = async (url, resumeId) => {
    setStatus('loading');
    setError('');
    try {
      const response = await api.post('/api/analysis/linkedin', { 
        linkedinUrl: url, 
        resumeId: parseInt(resumeId, 10) 
      });
      setResult(response.data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(
        err?.response?.data?.message || 
        'Analysis failed. Ensure your LinkedIn profile is public and try again.'
      );
    }
  };

  const reset = useCallback(() => {
    setResult(null);
    setStatus('idle');
    setError('');
  }, []);

  return { resumes, isFetchingResumes, status, result, error, analyzeProfile, reset, setError };
};

// ============================================================================
// 2. SUB-COMPONENTS (UI Presentation)
// ============================================================================

const ScoreRing = ({ score }) => {
  const normalizedScore = Math.min(Math.max(score || 0, 0), 100);
  const strokeDasharray = `${normalizedScore} 100`;
  const colorClass = normalizedScore >= 80 ? 'text-blue-600 dark:text-blue-500' : normalizedScore >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center bg-white dark:bg-slate-950 rounded-full border border-slate-200/50 dark:border-slate-800 shadow-sm">
      <svg className="w-full h-full transform -rotate-90 p-1" viewBox="0 0 36 36">
        <path
          className="text-slate-100 dark:text-slate-800"
          strokeWidth="2.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth="2.5"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{normalizedScore}</span>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const ResultList = ({ title, icon: Icon, items, type }) => {
  const isPositive = type === 'success';
  const theme = isPositive 
    ? { border: 'border-emerald-200/50 dark:border-emerald-500/20', bg: 'bg-emerald-50/50 dark:bg-emerald-500/5', icon: 'text-emerald-600 dark:text-emerald-400' }
    : { border: 'border-rose-200/50 dark:border-rose-500/20', bg: 'bg-rose-50/50 dark:bg-rose-500/5', icon: 'text-rose-600 dark:text-rose-400' };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full`}>
      <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-3 ${theme.bg}`}>
        <Icon className={`w-5 h-5 ${theme.icon}`} />
        <h3 className="font-semibold text-[15px] text-slate-900 dark:text-white tracking-tight">{title}</h3>
      </div>
      <div className="p-6 flex-grow">
        {items?.length > 0 ? (
          <ul className="space-y-4">
            {items.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed group">
                <div className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Target className="w-6 h-6 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              {isPositive ? 'No exact matches found.' : 'Excellent! No inconsistencies found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
    <div className="relative w-16 h-16 mb-8">
      <div className="absolute inset-0 border-[3px] border-slate-100 dark:border-slate-800 rounded-full"></div>
      <div className="absolute inset-0 border-[3px] border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Running Deep Analysis</h3>
    <p className="text-slate-500 dark:text-slate-400 text-[14px] font-medium">Cross-referencing resume context with LinkedIn data endpoints...</p>
  </div>
);

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

export default function LinkedInAnalyzer() {
  const { resumes, isFetchingResumes, status, result, error, analyzeProfile, reset, setError } = useResumeAnalysis();
  const [url, setUrl] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const effectiveResumeId = selectedResumeId || (resumes[0] ? String(resumes[0].id) : '');

  const isValidLinkedInUrl = useMemo(() => {
    return /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/*/.test(url);
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidLinkedInUrl) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/johndoe).');
      return;
    }
    analyzeProfile(url, effectiveResumeId);
  };

  const isLoading = status === 'loading';

  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0B0D10] pb-24 transition-colors duration-300 font-sans">
        
        {/* Professional Header */}
        <div className="bg-white dark:bg-[#111318] border-b border-slate-200 dark:border-slate-800/80 pt-16 pb-16 px-4 sm:px-6 transition-colors duration-300">
          <div className="max-w-4xl mx-auto flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs font-semibold tracking-wide uppercase mb-6 border border-slate-200/50 dark:border-slate-700/50">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Identity Verification</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight mb-4 transition-colors">
              LinkedIn Alignment Engine
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-[17px] max-w-2xl leading-relaxed font-medium transition-colors">
              Synchronize your professional narrative. We computationally cross-reference your live LinkedIn presence against your targeted resume to identify critical gaps, misalignments, and optimization opportunities.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          
          {/* Form View */}
          {(status === 'idle' || status === 'error') && !isLoading && (
            <div className="bg-white dark:bg-[#111318] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 sm:p-10 mb-8 transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Resume Selection */}
                  <div className="space-y-3">
                    <label htmlFor="resume-select" className="block text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight transition-colors">
                      Target Resume Document
                    </label>
                    <div className="relative">
                      <select
                        id="resume-select"
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3.5 pl-4 pr-10 bg-white dark:bg-[#0B0D10] text-[14px] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-slate-900 dark:text-white transition-all shadow-sm"
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        disabled={isFetchingResumes || resumes.length === 0}
                        required
                      >
                        <option value="" disabled className="dark:bg-[#0B0D10]">
                          {isFetchingResumes ? 'Loading workspace resumes...' : '-- Select a document --'}
                        </option>
                        {resumes.map(resume => (
                          <option key={resume.id} value={resume.id} className="dark:bg-[#0B0D10]">
                            {resume.title} {resume.updatedAt && `• ${new Date(resume.updatedAt).toLocaleDateString()}`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                    {resumes.length === 0 && !isFetchingResumes && (
                      <p className="text-[13px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-2 transition-colors">
                        <AlertCircle className="w-3.5 h-3.5" /> No resumes found in workspace.
                      </p>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="space-y-3">
                    <label htmlFor="linkedin-url" className="block text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight transition-colors">
                      LinkedIn Profile URI
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="linkedin-url"
                        type="url"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3.5 pl-11 pr-4 bg-white dark:bg-[#0B0D10] disabled:opacity-60 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-[14px] text-slate-900 dark:text-white shadow-sm"
                        placeholder="https://linkedin.com/in/username"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (error) setError('');
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Error State */}
                {error && (
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-start gap-3 text-[14px] animate-in fade-in duration-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    type="submit"
                    disabled={!url || !effectiveResumeId || isFetchingResumes}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[14px] font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10"
                  >
                    Run Diagnostics
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white dark:bg-[#111318] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 mt-8 transition-colors duration-300">
              <LoadingSkeleton />
            </div>
          )}

          {/* Results View */}
          {status === 'success' && result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 mt-8" role="region" aria-label="Analysis Results">
              
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-6">
                  {typeof result.profileScore === 'number' && (
                    <ScoreRing score={result.profileScore} />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight transition-colors">Diagnostic Report</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[14px] font-medium text-slate-500 dark:text-slate-400 transition-colors">
                        Analysis successfully completed
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1A1D24] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none w-full sm:w-auto border border-slate-200/50 dark:border-slate-700/50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Analysis
                </button>
              </div>

              {/* Grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResultList 
                  title="Verified Consistencies" 
                  icon={CheckCircle2} 
                  items={result.consistent} 
                  type="success" 
                />
                <ResultList 
                  title="Identified Discrepancies" 
                  icon={XCircle} 
                  items={result.inconsistencies} 
                  type="error" 
                />

                {/* Executive Recommendations */}
                {(result?.suggestions?.length > 0 || typeof result?.suggestions === 'string') && (
                  <div className="lg:col-span-2 bg-white dark:bg-[#111318] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                    <div className="border-b border-slate-100 dark:border-slate-800/60 px-6 sm:px-8 py-5 flex items-center gap-3">
                      <Lightbulb className="text-blue-600 dark:text-blue-500 w-5 h-5" />
                      <h3 className="font-semibold text-[15px] text-slate-900 dark:text-white tracking-tight transition-colors">Optimization Directives</h3>
                    </div>
                    <div className="p-6 sm:p-8">
                      {Array.isArray(result.suggestions) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.suggestions.map((suggestion, idx) => (
                             <div key={idx} className="bg-slate-50 dark:bg-[#0B0D10] p-5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex items-start gap-3 transition-colors duration-300">
                               <Check className="w-4 h-4 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                               <span className="text-[14px] leading-relaxed">{suggestion}</span>
                             </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-[#0B0D10] p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/80 transition-colors duration-300">
                          <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {result.suggestions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Tips */}
                {result?.tips?.length > 0 && (
                  <div className="lg:col-span-2 bg-slate-900 dark:bg-[#0B0D10] rounded-2xl shadow-sm border border-slate-800 dark:border-slate-800/50 overflow-hidden transition-colors duration-300">
                    <div className="border-b border-slate-800 px-6 sm:px-8 py-5 flex items-center gap-3">
                      <Sparkles className="text-amber-400 w-5 h-5" />
                      <h3 className="font-semibold text-[15px] text-white tracking-tight">Platform Intelligence</h3>
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-wrap gap-3">
                        {result.tips.map((tip, idx) => (
                          <div key={idx} className="bg-slate-800/50 text-slate-300 border border-slate-700/50 px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}