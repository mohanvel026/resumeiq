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
  Target,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';

// ============================================================================
// 1. CUSTOM HOOKS
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
        const response = await api.get('/api/resume/all', { signal: abortController.signal });
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
// 2. SUB-COMPONENTS
// ============================================================================

const ScoreRing = ({ score }) => {
  const normalizedScore = Math.min(Math.max(score || 0, 0), 100);
  const colorClass = normalizedScore >= 80 ? 'var(--success)' : normalizedScore >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: '50%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
        <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', padding: '4px' }} viewBox="0 0 36 36">
          <path
            style={{ color: 'var(--border-color)' }}
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            style={{ color: colorClass, transition: 'stroke-dasharray 1s ease-out' }}
            strokeWidth="3"
            strokeDasharray={`${normalizedScore} 100`}
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{normalizedScore}</span>
        </div>
      </div>
    </div>
  );
};

const ResultList = ({ title, icon: Icon, items, type }) => {
  const isPositive = type === 'success';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', background: isPositive ? 'rgba(40,167,69,0.05)' : 'rgba(220,53,69,0.05)' }}>
        <Icon style={{ width: '20px', height: '20px', color: isPositive ? 'var(--success)' : 'var(--danger)' }} />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px', flexGrow: 1 }}>
        {items?.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((point, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
                <div style={{ marginTop: '6px', flexShrink: 0, width: '6px', height: '6px', borderRadius: '50%', background: isPositive ? 'var(--success)' : 'var(--danger)' }}></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', textAlign: 'center' }}>
            <Target style={{ width: '24px', height: '24px', color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              {isPositive ? 'No exact matches found.' : 'Excellent! No inconsistencies found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
    <div className="spinner" style={{ marginBottom: '24px', width: '48px', height: '48px', borderWidth: '4px' }}></div>
    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Running Deep Analysis</h3>
    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Cross-referencing resume context with LinkedIn data endpoints...</p>
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
      <div className="page-header">
        <h2 className="page-title">LinkedIn Alignment Engine</h2>
        <p className="page-subtitle">Synchronize your professional narrative. We computationally cross-reference your live LinkedIn presence against your targeted resume to identify critical gaps, misalignments, and optimization opportunities.</p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {/* Form View */}
        {(status === 'idle' || status === 'error') && !isLoading && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleSubmit}>
              
              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                {/* Resume Selection */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="resume-select" className="form-label">
                    Target Resume Document
                  </label>
                  <select
                    id="resume-select"
                    className="form-select"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    disabled={isFetchingResumes || resumes.length === 0}
                    required
                  >
                    <option value="" disabled>
                      {isFetchingResumes ? 'Loading workspace resumes...' : '-- Select a document --'}
                    </option>
                    {resumes.map(resume => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title} {resume.updatedAt && `• ${new Date(resume.updatedAt).toLocaleDateString()}`}
                      </option>
                    ))}
                  </select>
                  {resumes.length === 0 && !isFetchingResumes && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--danger)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle style={{ width: '14px', height: '14px' }} /> No resumes found in workspace.
                    </p>
                  )}
                </div>

                {/* URL Input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="linkedin-url" className="form-label">
                    LinkedIn Profile URL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <LinkIcon style={{ width: '16px', height: '16px' }} />
                    </div>
                    <input
                      id="linkedin-url"
                      type="url"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
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
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <AlertCircle style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontWeight: '500' }}>{error}</p>
                </div>
              )}

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={!url || !effectiveResumeId || isFetchingResumes}
                  className="btn btn-primary"
                >
                  Run Diagnostics
                  <ArrowRight style={{ width: '16px', height: '16px', opacity: 0.8 }} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <LoadingSkeleton />
          </div>
        )}

        {/* Results View */}
        {status === 'success' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            
            {/* Results Header */}
            <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {typeof result.profileScore === 'number' && (
                  <ScoreRing score={result.profileScore} />
                )}
                <div>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Diagnostic Report</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                      Analysis successfully completed
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={reset}
                className="btn btn-ghost"
              >
                <RotateCcw style={{ width: '14px', height: '14px' }} />
                New Analysis
              </button>
            </div>

            {/* Grids */}
            <div className="grid-2">
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
                <div className="card" style={{ gridColumn: '1 / -1', padding: 0, overflow: 'hidden' }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Lightbulb style={{ color: 'var(--info)', width: '20px', height: '20px' }} />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Optimization Directives</h3>
                  </div>
                  <div style={{ padding: '24px' }}>
                    {Array.isArray(result.suggestions) ? (
                      <div className="grid-2">
                        {result.suggestions.map((suggestion, idx) => (
                           <div key={idx} style={{ background: 'var(--bg-hover)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-body)' }}>
                             <Check style={{ width: '16px', height: '16px', color: 'var(--info)', flexShrink: 0, marginTop: '2px' }} />
                             <span style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>{suggestion}</span>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: 'var(--bg-hover)', padding: '24px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {result.suggestions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Tips */}
              {result?.tips?.length > 0 && (
                <div className="panel-dark" style={{ gridColumn: '1 / -1', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles style={{ color: 'var(--warning)', width: '20px', height: '20px' }} />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>Platform Intelligence</h3>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {result.tips.map((tip, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 'var(--border-radius)', fontSize: '0.8125rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)' }}></span>
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
    </Layout>
  );
}