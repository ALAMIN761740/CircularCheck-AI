import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Flag,
  Globe,
  Plus,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { submitCommunityReport } from '../lib/firestoreService';
import type {
  CommunityReport,
  ReportCategory,
  RiskLevel,
  ScanAnalysisResult,
  UserProfile,
  VerificationSource,
} from '../types/circular';

interface CommunityViewProps {
  approvedReports: CommunityReport[];
  sources: VerificationSource[];
  user: UserProfile | null;
  prefillScan: ScanAnalysisResult | null;
  onClearPrefill: () => void;
  onSignInPrompt: () => void;
}

const CATEGORIES: ReportCategory[] = [
  'Payment Scam',
  'Impersonation',
  'Phishing URL',
  'Fake Job Offer',
  'Data Harvesting',
];

export function CommunityView({
  approvedReports,
  sources,
  user,
  prefillScan,
  onClearPrefill,
  onSignInPrompt,
}: CommunityViewProps) {
  const [subTab, setSubTab] = useState<'alerts' | 'registry'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showForm, setShowForm] = useState(Boolean(prefillScan));

  const [orgName, setOrgName] = useState(
    prefillScan?.organizationName && prefillScan.organizationName !== 'Not specified'
      ? prefillScan.organizationName
      : ''
  );
  const [circularTitle, setCircularTitle] = useState(
    prefillScan?.jobTitle && prefillScan.jobTitle !== 'Not specified'
      ? prefillScan.jobTitle
      : ''
  );
  const [reportCategory, setReportCategory] = useState<ReportCategory>('Payment Scam');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(prefillScan?.riskLevel || 'High');
  const [description, setDescription] = useState(
    prefillScan?.analysisSummary || ''
  );
  const [evidence, setEvidence] = useState(
    prefillScan?.websiteUrl && prefillScan.websiteUrl !== 'Not specified'
      ? prefillScan.websiteUrl
      : prefillScan?.paymentMethod && prefillScan.paymentMethod !== 'Not specified'
        ? prefillScan.paymentMethod
        : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return approvedReports.filter((r) => {
      if (categoryFilter !== 'All' && r.reportCategory !== categoryFilter) return false;
      if (!q) return true;
      return (
        r.organizationName.toLowerCase().includes(q) ||
        r.circularTitle.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [approvedReports, searchTerm, categoryFilter]);

  const filteredSources = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter(
      (s) =>
        s.organizationName.toLowerCase().includes(q) ||
        s.officialDomain.toLowerCase().includes(q) ||
        s.sourceType.toLowerCase().includes(q)
    );
  }, [sources, searchTerm]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignInPrompt();
      return;
    }
    setSubmitError(null);
    setSubmitMessage(null);

    if (orgName.trim().length < 2 || circularTitle.trim().length < 2) {
      setSubmitError('Please enter both organization name and circular title.');
      return;
    }
    if (description.trim().length < 15) {
      setSubmitError('Please provide at least 15 characters describing why this circular is suspicious.');
      return;
    }

    setSubmitting(true);
    try {
      await submitCommunityReport({
        userId: user.uid,
        reporterName: user.displayName,
        scanId: prefillScan?.id,
        organizationName: orgName.trim(),
        circularTitle: circularTitle.trim(),
        description: description.trim(),
        evidence: evidence.trim(),
        reportCategory,
        riskLevel,
      });
      setSubmitMessage('Report submitted for moderator review. Track its status in your Dashboard.');
      setOrgName('');
      setCircularTitle('');
      setDescription('');
      setEvidence('');
      onClearPrefill();
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Community Intelligence &amp; Official Registry
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Browse moderated recruitment scam alerts reported by job seekers and verify domains against official Bangladeshi portals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              onSignInPrompt();
              return;
            }
            setShowForm((p) => !p);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Submit Suspicious Circular</span>
        </button>
      </div>

      {submitMessage && (
        <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>{submitMessage}</span>
        </div>
      )}

      {/* Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReport}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Submit Suspicious Circular Report
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                onClearPrefill();
              }}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close submission form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Claimed Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., Fake Ministry of Health Portal"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Circular / Position Title
              </label>
              <input
                type="text"
                required
                value={circularTitle}
                onChange={(e) => setCircularTitle(e.target.value)}
                placeholder="e.g., District Field Officer Recruitment 2026"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Scam Pattern Category
              </label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value as ReportCategory)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Perceived Risk Severity
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
              >
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Description of Suspicious Behaviour
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what fee, suspicious URL, or impersonation warning sign was observed..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Evidence (URL, Masked Phone Pattern, or Email Domain — avoid sharing your own PII)
              </label>
              <input
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="e.g., https://fake-portal.xyz or bKash personal fee request"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
              />
            </div>
          </div>

          {submitError && (
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit for Moderation'}
            </button>
          </div>
        </form>
      )}

      {/* Segmented Tabs & Search Toolbar */}
      <div className="mt-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
        <div className="flex items-center gap-1 self-start rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSubTab('alerts')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'alerts'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved Scam Alerts ({approvedReports.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('registry')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'registry'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Official Verification Portals ({sources.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={subTab === 'alerts' ? 'Search alerts...' : 'Search official portals...'}
              className="w-60 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
            />
          </div>

          {subTab === 'alerts' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content Lists */}
      {subTab === 'alerts' ? (
        filteredReports.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="mt-3 font-display text-base font-bold text-slate-900">
              No matching approved reports
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Approved community reports will appear here after moderator review.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {filteredReports.map((rep) => (
              <div key={rep.id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      {rep.riskLevel} Risk
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{rep.reportCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rep.organizationName}</span>
                  </div>
                  <span className="font-mono-tabular text-xs text-slate-500">
                    {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-base font-bold text-slate-900">
                  {rep.circularTitle}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{rep.description}</p>

                {rep.evidence && (
                  <p className="mt-2.5 font-mono-tabular text-xs text-slate-500">
                    Reported Evidence: {rep.evidence}
                  </p>
                )}

                {rep.adminNotes && (
                  <p className="mt-2 text-xs font-medium text-teal-800">
                    Moderator Note: {rep.adminNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredSources.map((src) => (
            <div
              key={src.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Globe className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                  <span>{src.sourceType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{src.officialDomain}</span>
                </div>
                <h3 className="mt-1.5 font-display text-base font-bold text-slate-900">
                  {src.organizationName}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">{src.verificationNotes}</p>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <a
                  href={src.officialRecruitmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
