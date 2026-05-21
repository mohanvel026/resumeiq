import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Lightbulb, 
  Link as LinkIcon, 
  RotateCcw,
  FileText,
  Sparkles,
  ChevronRight,
  Target
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

  // Fetch resumes with AbortController to prevent memory leaks on unmount
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
    return () => abortController.abort(); // Cleanup
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
  const colorClass = normalizedScore >= 80 ? 'text-emerald-500' : normalizedScore >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center bg-white rounded-full shadow-inner p-2">
      <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
        <path
          className="text-slate-100"
          strokeWidth="3"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className={`${colorClass} transition-all duration-1000 ease-out drop-shadow-md`}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800 tracking-tighter">{normalizedScore}</span>
      </div>
    </div>
  );
};

const ResultList = ({ title, icon: Icon, items, type }) => {
  const isPositive = type === 'success';
  const headerColors = isPositive 
    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100 text-emerald-900' 
    : 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-100 text-rose-900';
  const bulletColor = isPositive ? 'text-emerald-500 bg-emerald-100' : 'text-rose-500 bg-rose-100';

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className={`${headerColors} border-b px-5 py-4 flex items-center gap-3`}>
        <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-[15px]">{title}</h3>
      </div>
      <div className="p-6 flex-grow">
        {items?.length > 0 ? (
          <ul className="space-y-4">
            {items.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed group">
                <div className={`mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${bulletColor} text-[10px] font-bold shadow-sm transition-transform group-hover:scale-110`}>
                  {isPositive ? '✓' : '×'}
                </div>
                <span className="group-hover:text-slate-900 transition-colors">{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center opacity-70">
            <Target className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 font-medium">
              {isPositive ? 'No exact matches found.' : 'Great job! No inconsistencies found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-16 animate-pulse">
    <div className="relative w-24 h-24 mb-6">
      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Profile...</h3>
    <p className="text-slate-500 text-sm">Cross-referencing your resume with LinkedIn data.</p>
  </div>
);

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

export default function LinkedInAnalyzer() {
  const { 
    resumes, 
    isFetchingResumes, 
    status, 
    result, 
    error, 
    analyzeProfile, 
    reset, 
    setError 
  } = useResumeAnalysis();

  const [url, setUrl] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Auto-select first resume when loaded
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const isValidLinkedInUrl = useMemo(() => {
    return /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/*/.test(url);
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidLinkedInUrl) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/johndoe).');
      return;
    }
    analyzeProfile(url, selectedResumeId);
  };

  const isLoading = status === 'loading';

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50 pb-16">
        {/* Hero Header Area */}
        <div className="bg-white border-b border-slate-200 pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="max-w-5xl mx-auto relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-blue-100/50">
              <LinkIcon className="text-blue-600 w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
                LinkedIn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Cross-Analyzer</span>
              </h1>
              <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed">
                Ensure your professional narrative is bulletproof. We cross-reference your live LinkedIn profile with your targeted resume to spot critical gaps and missing opportunities.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          {/* Form View */}
          {(status === 'idle' || status === 'error') && !isLoading && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-10 mb-8 max-w-2xl mx-auto sm:mx-0 transition-all">
              <form onSubmit={handleSubmit} className="space-y-7" noValidate>
                
                {/* Resume Selection */}
                <div className="space-y-3">
                  <label htmlFor="resume-select" className="flex items-center gap-2 text-sm font-bold text-slate-700 tracking-wide uppercase">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Target Resume
                  </label>
                  <div className="relative">
                    <select
                      id="resume-select"
                      className="w-full appearance-none border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 p-4 border bg-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-slate-700 font-medium transition-all"
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      disabled={isFetchingResumes || resumes.length === 0}
                      required
                    >
                      <option value="" disabled>
                        {isFetchingResumes ? 'Loading your resumes...' : '-- Select a resume --'}
                      </option>
                      {resumes.map(resume => (
                        <option key={resume.id} value={resume.id}>
                          {resume.title} {resume.updatedAt && `(Updated ${new Date(resume.updatedAt).toLocaleDateString()})`}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                  {resumes.length === 0 && !isFetchingResumes && (
                    <p className="text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-lg flex items-center gap-2 border border-amber-100">
                      <AlertOctagon className="w-4 h-4" /> You need to upload or create a resume first.
                    </p>
                  )}
                </div>

                {/* URL Input */}
                <div className="space-y-3">
                  <label htmlFor="linkedin-url" className="flex items-center gap-2 text-sm font-bold text-slate-700 tracking-wide uppercase">
                    <LinkIcon className="w-4 h-4 text-slate-400" />
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="linkedin-url"
                    type="url"
                    className="w-full border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 p-4 border bg-white disabled:opacity-60 transition-all placeholder:text-slate-300 font-medium text-slate-700"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError('');
                    }}
                    required
                  />
                </div>

                {/* Error State */}
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in zoom-in-95 duration-300 shadow-sm" role="alert">
                    <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                    <p className="font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!url || !selectedResumeId || isFetchingResumes}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  >
                    Analyze Alignment
                    <Sparkles className="w-5 h-5 opacity-70" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 mt-8 max-w-2xl">
              <LoadingSkeleton />
            </div>
          )}

          {/* Results View */}
          {status === 'success' && result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6 mt-8" role="region" aria-label="Analysis Results">
              
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                  {typeof result.profileScore === 'number' && (
                    <ScoreRing score={result.profileScore} />
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Analysis Complete</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Cross-referenced successfully
                    </p>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-200 w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Analyze Another
                </button>
              </div>

              {/* Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultList 
                  title="Verified Alignments" 
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

                {/* Suggestions / Recommendations */}
                {(result?.suggestions?.length > 0 || typeof result?.suggestions === 'string') && (
                  <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-3xl shadow-md border border-indigo-100 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/40 group-hover:bg-transparent transition-colors duration-500"></div>
                    <div className="relative z-10 border-b border-indigo-100/50 px-6 sm:px-8 py-5 flex items-center gap-4">
                      <div className="p-2.5 bg-indigo-500 rounded-xl shadow-inner shadow-indigo-600">
                        <Lightbulb className="text-white w-5 h-5" />
                      </div>
                      <h3 className="font-black text-indigo-950 text-xl tracking-tight">Executive Recommendations</h3>
                    </div>
                    <div className="relative z-10 p-6 sm:p-8">
                      {Array.isArray(result.suggestions) ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.suggestions.map((suggestion, idx) => (
                             <li key={idx} className="bg-white/60 p-4 rounded-2xl border border-indigo-50 text-slate-700 leading-relaxed flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                               <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-sm"></div>
                               <span className="text-[15px] font-medium">{suggestion}</span>
                             </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-white/60 p-6 rounded-2xl border border-indigo-50 shadow-sm">
                          <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                            {result.suggestions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Tips */}
                {result?.tips?.length > 0 && (
                  <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-100 px-6 sm:px-8 py-5 flex items-center gap-4">
                      <div className="p-2.5 bg-slate-100 rounded-xl">
                        <Sparkles className="text-amber-500 w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">Pro Tips for LinkedIn</h3>
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-wrap gap-3">
                        {result.tips.map((tip, idx) => (
                          <div key={idx} className="bg-amber-50 text-amber-900 border border-amber-100/50 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-amber-500" />
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