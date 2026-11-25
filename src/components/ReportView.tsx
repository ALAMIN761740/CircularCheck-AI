import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Download,
  Flag,
  Globe,
  Info,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { exportReportToPdf } from '../lib/pdfExport';
import type { RiskLevel, ScanAnalysisResult, VerificationStatus } from '../types/circular';

interface ReportViewProps {
  report: ScanAnalysisResult;
  lang: 'en' | 'bn';
  onChangeLang: (lang: 'en' | 'bn') => void;
  isSignedIn: boolean;
  onToggleSave: (report: ScanAnalysisResult) => Promise<void>;
  onReportToCommunity: (report: ScanAnalysisResult) => void;
  onNewScan: () => void;
  onSignInPrompt: () => void;
}

function getRiskVisuals(level: RiskLevel) {
  switch (level) {
    case 'Critical':
      return {
        textClass: 'text-red-700',
        barClass: 'bg-red-600',
        borderClass: 'border-red-200 bg-red-50/60',
        Icon: AlertOctagon,
        labelBn: 'অত্যন্ত ঝুঁকিপূর্ণ লক্ষণ',
      };
    case 'High':
      return {
        textClass: 'text-orange-700',
        barClass: 'bg-orange-600',
        borderClass: 'border-orange-200 bg-orange-50/60',
        Icon: ShieldAlert,
        labelBn: 'উচ্চ ঝুঁকিপূর্ণ লক্ষণ',
      };
    case 'Moderate':
      return {
        textClass: 'text-amber-700',
        barClass: 'bg-amber-500',
        borderClass: 'border-amber-200 bg-amber-50/60',
        Icon: AlertTriangle,
        labelBn: 'মাঝারি ঝুঁকি — যাচাই প্রয়োজন',
      };
    default:
      return {
        textClass: 'text-emerald-700',
        barClass: 'bg-emerald-600',
        borderClass: 'border-emerald-200 bg-emerald-50/60',
        Icon: ShieldCheck,
        labelBn: 'কম ঝুঁকিপূর্ণ লক্ষণ',
      };
  }
}

function getVerificationVisuals(status: VerificationStatus) {
  switch (status) {
    case 'Verified Against Available Source':
      return { Icon: CheckCircle2, color: 'text-emerald-700' };
    case 'Partially Verified':
      return { Icon: Info, color: 'text-teal-700' };
    case 'Unverified':
      return { Icon: AlertTriangle, color: 'text-red-700' };
    default:
      return { Icon: Globe, color: 'text-slate-600' };
  }
}

export function ReportView({
  report,
  lang,
  onChangeLang,
  isSignedIn,
  onToggleSave,
  onReportToCommunity,
  onNewScan,
  onSignInPrompt,
}: ReportViewProps) {
  const [saving, setSaving] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  const riskVis = getRiskVisuals(report.riskLevel);
  const RiskIcon = riskVis.Icon;
  const verVis = getVerificationVisuals(report.verificationStatus);
  const VerIcon = verVis.Icon;

  const handleSave = async () => {
    if (!isSignedIn) {
      onSignInPrompt();
      return;
    }
    setSaving(true);
    try {
      await onToggleSave(report);
    } finally {
      setSaving(false);
    }
  };

  const summaryText =
    lang === 'bn' && report.analysisSummaryBn
      ? report.analysisSummaryBn
      : report.analysisSummary;

  const recs =
    lang === 'bn' && report.recommendationsBn.length > 0
      ? report.recommendationsBn
      : report.recommendations;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Action Strip */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <button
            type="button"
            onClick={onNewScan}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Scanner</span>
          </button>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
            {report.jobTitle !== 'Not specified' ? report.jobTitle : 'Circular Risk Analysis Report'}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{report.organizationName}</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase">{report.inputType} Scan</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{report.id}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                lang === 'en' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('bn')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                lang === 'bn' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বাংলা
            </button>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            {report.isSaved ? (
              <BookmarkCheck className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
            ) : (
              <Bookmark className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            )}
            <span>{report.isSaved ? 'Saved' : 'Save Circular'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportReportToPdf(report)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onReportToCommunity(report)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Report Scam</span>
          </button>
        </div>
      </div>

      {/* Primary Risk Score & Verification Overview */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className={`rounded-xl border p-6 lg:col-span-5 ${riskVis.borderClass}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Risk Indicator Score
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${riskVis.textClass}`}>
              <RiskIcon className="h-4 w-4" aria-hidden="true" />
              <span>
                {lang === 'bn' ? riskVis.labelBn : `${report.riskLevel} Risk Indicators`}
              </span>
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono-tabular text-4xl font-bold text-slate-900">
              {report.riskScore}
            </span>
            <span className="font-mono-tabular text-sm text-slate-500">/ 100</span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${riskVis.barClass}`}
              style={{ width: `${Math.max(4, report.riskScore)}%` }}
            />
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-slate-200/80 pt-4 text-xs font-medium text-slate-700">
            <VerIcon className={`h-4 w-4 shrink-0 ${verVis.color}`} aria-hidden="true" />
            <span>Source Status: {report.verificationStatus}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-base font-bold text-slate-900">
            {lang === 'bn' ? 'বিশ্লেষণের সারসংক্ষেপ' : 'Executive Risk Summary'}
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-700">{summaryText}</p>

          <h3 className="mt-5 text-xs font-semibold text-slate-500">
            {lang === 'bn' ? 'করণীয় পরামর্শ' : 'Recommended Next Steps'}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {recs.map((rec) => (
              <li key={rec} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Findings & Extracted Metadata */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Detected Indicators */}
        <div className="lg:col-span-7">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Detected Risk Indicators ({report.findings.length})
          </h2>

          {report.findings.length === 0 ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No significant fraud indicators were triggered by automated rules or semantic analysis. Still verify directly with the organization’s official portal.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {report.findings.map((finding, index) => {
                const fv = getRiskVisuals(finding.severity);
                const FIcon = fv.Icon;
                return (
                  <div key={`${finding.title}-${index}`} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${fv.textClass}`}>
                        <FIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{finding.severity}</span>
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{finding.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{finding.source}</span>
                      </div>
                    </div>
                    <h3 className="mt-1.5 font-display text-sm font-bold text-slate-900">
                      {finding.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {lang === 'bn' && finding.descriptionBn
                        ? finding.descriptionBn
                        : finding.description}
                    </p>
                    {finding.evidence && (
                      <p className="mt-2 font-mono-tabular text-xs text-slate-500">
                        Evidence: {finding.evidence}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Positive Signals & Sources */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-base font-bold text-slate-900">
              Positive Signals &amp; Official References
            </h3>
            {report.positiveSignals.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {report.positiveSignals.map((sig) => (
                  <li key={sig} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No strong official verification signals found in the submitted circular.
              </p>
            )}

            {report.sources.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500">Matched Reference Sources</p>
                <ul className="mt-2 space-y-1 text-xs font-medium text-teal-800">
                  {report.sources.map((src) => (
                    <li key={src}>{src}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Extracted Details Table */}
        <div className="lg:col-span-5">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Extracted Circular Information
          </h2>
          <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
            {(
              [
                ['Organization', report.organizationName],
                ['Position', report.jobTitle],
                ['Salary', report.salary],
                ['Deadline', report.applicationDeadline],
                ['Application Fee', report.applicationFee],
                ['Payment Method', report.paymentMethod],
                ['Email Address', report.emailAddress],
                ['Website URL', report.websiteUrl],
                ['Contact Details', report.contactInformation],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3 px-4 py-3">
                <span className="text-xs font-medium text-slate-500">{label}</span>
                <span className="col-span-2 break-words font-medium text-slate-900">
                  {value || 'Not specified'}
                </span>
              </div>
            ))}
          </div>

          {report.extractedText && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={() => setShowRawText((p) => !p)}
                className="flex w-full items-center justify-between text-xs font-semibold text-slate-700"
              >
                <span>Extracted Circular Text</span>
                <span>{showRawText ? 'Hide' : 'Show'}</span>
              </button>
              {showRawText && (
                <pre className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono-tabular text-xs text-slate-700">
                  {report.extractedText}
                </pre>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-xs leading-relaxed text-slate-600">
            <strong className="font-semibold text-slate-800">Limitations:</strong> Automated risk indicators and AI assessments may produce false positives or miss novel scams. Always cross-check directly with official organization portals.
          </div>
        </div>
      </div>
    </div>
  );
}
