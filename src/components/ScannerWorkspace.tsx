import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import type { InputType, ScanAnalysisResult } from '../types/circular';

interface ScannerWorkspaceProps {
  onScanComplete: (report: ScanAnalysisResult) => void;
  defaultLang: 'en' | 'bn';
  onChangeLang: (lang: 'en' | 'bn') => void;
}

const SAMPLE_CIRCULARS: {
  id: string;
  label: string;
  inputType: 'text' | 'url';
  content: string;
}[] = [
  {
    id: 'sample-scam',
    label: 'Sample: Suspicious bKash Fee Scam',
    inputType: 'text',
    content: `URGENT GOVERNMENT HEALTH PROJECT RECRUITMENT 2026
Ministry of Health & Family Welfare — District Field Officer (450 Posts)
Salary: 42,000 BDT + Allowances. No written exam required! Direct appointment letter within 48 hours.
Limited seats — apply TODAY ONLY!
Send 750 BDT registration and training fee via bKash Send Money (Personal) to 01711-000999 before 5:00 PM.
Send NID photo, selfie, and bKash transaction ID to mohfw.recruitment.bd@gmail.com or WhatsApp +8801711000999.`,
  },
  {
    id: 'sample-gov',
    label: 'Sample: Official Teletalk / BPSC Notice',
    inputType: 'text',
    content: `Bangladesh Public Service Commission (BPSC)
Memo No: 80.00.0000.200.11.012.26-145
Position: Assistant Engineer (Civil) — Grade 9 (National Pay Scale 2015: BDT 22,000–53,060)
Application Deadline: 28 December 2026
Candidates must apply online strictly through https://bpsc.teletalk.com.bd and https://www.bpsc.gov.bd.
Application Fee: BDT 200 payable only via Teletalk Prepaid SMS following official portal instructions.`,
  },
  {
    id: 'sample-url',
    label: 'Sample: Lookalike NGO URL',
    inputType: 'url',
    content: 'https://brac-career-portal-bd.xyz/apply-officer',
  },
];

const ANALYSIS_STEPS = [
  'Extracting recruitment fields and payment instructions',
  'Checking URLs and official Bangladeshi registries',
  'Running deterministic rule engine & AI semantic review',
  'Generating bilingual risk indicators and recommendations',
];

export function ScannerWorkspace({
  onScanComplete,
  defaultLang,
  onChangeLang,
}: ScannerWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    mimeType: string;
    base64: string;
    sizeLabel: string;
  } | null>(null);
  const [urlPreview, setUrlPreview] = useState<{
    valid: boolean;
    hostname: string;
    warnings: string[];
    matchedOfficialSource?: { organizationName: string; officialDomain: string } | null;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    const allowed =
      activeTab === 'pdf'
        ? ['application/pdf']
        : ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError(
        activeTab === 'pdf'
          ? 'Please select a valid PDF document (.pdf).'
          : 'Please select a PNG, JPEG, or WebP screenshot.'
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be 10 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      setSelectedFile({
        fileName: file.name,
        mimeType: file.type,
        base64,
        sizeLabel: `${(file.size / 1024).toFixed(0)} KB`,
      });
    };
    reader.onerror = () => setError('Could not read the selected file.');
    reader.readAsDataURL(file);
  };

  const handleQuickUrlCheck = async () => {
    if (!urlInput.trim()) return;
    setError(null);
    try {
      const res = await fetch('/api/verify/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not inspect URL.');
        return;
      }
      setUrlPreview(data);
    } catch {
      setError('Unable to reach URL verification service.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'text' && textInput.trim().length < 20) {
      setError('Please paste at least 20 characters of the job circular.');
      return;
    }
    if (activeTab === 'url' && urlInput.trim().length < 5) {
      setError('Please enter a valid circular URL.');
      return;
    }
    if ((activeTab === 'image' || activeTab === 'pdf') && !selectedFile) {
      setError(`Please select a ${activeTab === 'pdf' ? 'PDF document' : 'circular image'} to analyze.`);
      return;
    }

    setIsAnalyzing(true);
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);

    try {
      let endpoint = '/api/scans/text';
      let payload: Record<string, unknown> = { text: textInput.trim() };

      if (activeTab === 'url') {
        endpoint = '/api/scans/url';
        payload = { url: urlInput.trim() };
      } else if ((activeTab === 'image' || activeTab === 'pdf') && selectedFile) {
        endpoint = '/api/scans/file';
        payload = {
          fileName: selectedFile.fileName,
          mimeType: selectedFile.mimeType,
          base64: selectedFile.base64,
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Circular analysis failed.');
      }

      onScanComplete(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const applySample = (sample: (typeof SAMPLE_CIRCULARS)[number]) => {
    setError(null);
    setUrlPreview(null);
    if (sample.inputType === 'url') {
      setActiveTab('url');
      setUrlInput(sample.content);
    } else {
      setActiveTab('text');
      setTextInput(sample.content);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Job Circular Scanner
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Submit circular text, a recruitment URL, a screenshot, or a PDF notice for automated fraud-indicator analysis.
          </p>
        </div>

        {/* Workspace Language Toggle */}
        <div className="flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              defaultLang === 'en'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('bn')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              defaultLang === 'bn'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        {/* Segmented Input Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                { id: 'text', label: 'Paste Text', icon: FileText },
                { id: 'url', label: 'Website URL', icon: Globe },
                { id: 'image', label: 'Upload Image', icon: ImageIcon },
                { id: 'pdf', label: 'Upload PDF', icon: Upload },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedFile(null);
                    setError(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_CIRCULARS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => applySample(s)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'text' && (
            <div>
              <label htmlFor="circular-text" className="block text-sm font-semibold text-slate-900">
                Job Circular Text (English or বাংলা)
              </label>
              <textarea
                id="circular-text"
                rows={9}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the complete job advertisement, salary, fee instructions, contact email/phone, and application link..."
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Supports Bengali and English recruitment text</span>
                <span className="font-mono-tabular">{textInput.length} / 12,000 chars</span>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div>
              <label htmlFor="circular-url" className="block text-sm font-semibold text-slate-900">
                Recruitment Portal or Circular URL
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="circular-url"
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlPreview(null);
                  }}
                  placeholder="https://example.gov.bd/circular/2026"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono-tabular text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                />
                <button
                  type="button"
                  onClick={handleQuickUrlCheck}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Pre-Check Domain</span>
                </button>
              </div>

              {urlPreview && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    {urlPreview.warnings.length === 0 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        <span>Domain structure check passed ({urlPreview.hostname})</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-700" aria-hidden="true" />
                        <span>Domain warnings detected ({urlPreview.hostname || 'Invalid URL'})</span>
                      </>
                    )}
                  </div>
                  {urlPreview.matchedOfficialSource && (
                    <p className="mt-1.5 text-xs text-teal-800">
                      Matches verified registry: {urlPreview.matchedOfficialSource.organizationName} ({urlPreview.matchedOfficialSource.officialDomain})
                    </p>
                  )}
                  {urlPreview.warnings.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
                      {urlPreview.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'image' || activeTab === 'pdf') && (
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                {activeTab === 'pdf'
                  ? 'Upload Circular PDF Document (Max 10 MB)'
                  : 'Upload Circular Screenshot or Photo (PNG, JPEG, WebP · Max 10 MB)'}
              </label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-teal-700 hover:bg-slate-100/70 transition-colors">
                <Upload className="h-7 w-7 text-slate-500" aria-hidden="true" />
                <span className="mt-3 text-sm font-semibold text-slate-800">
                  {selectedFile
                    ? `${selectedFile.fileName} (${selectedFile.sizeLabel})`
                    : activeTab === 'pdf'
                      ? 'Click to select a PDF file'
                      : 'Click to select an image or screenshot'}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  {activeTab === 'pdf'
                    ? 'Text and tables will be extracted automatically'
                    : 'Bengali & English OCR supported directly'}
                </span>
                <input
                  type="file"
                  accept={activeTab === 'pdf' ? 'application/pdf' : 'image/png,image/jpeg,image/webp'}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  className="sr-only"
                />
              </label>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {isAnalyzing && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
                <Loader2 className="h-4 w-4 animate-spin text-teal-700" aria-hidden="true" />
                <span>Analyzing circular...</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ANALYSIS_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 text-xs ${
                      i <= stepIndex ? 'font-medium text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    <span className="font-mono-tabular">0{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">
              Submitted text is analyzed strictly as untrusted circular data and is not used as AI instructions.
            </p>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze Circular</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
