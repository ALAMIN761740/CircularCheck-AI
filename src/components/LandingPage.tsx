import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileSearch,
  Globe,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import type { CommunityReport, VerificationSource } from '../types/circular';
import type { AppRoute } from './TopNav';

interface LandingPageProps {
  onNavigate: (route: AppRoute) => void;
  approvedReports: CommunityReport[];
  sources: VerificationSource[];
}

const FAQS = [
  {
    q: 'Does CircularCheck AI guarantee whether a job circular is 100% genuine or fake?',
    a: 'No automated tool can guarantee authenticity on its own. CircularCheck AI provides transparent risk indicators, extracted evidence, and official-source comparisons so you can verify a notice before paying fees or sharing personal documents.',
  },
  {
    q: 'Can I scan Bengali job circular screenshots or PDFs?',
    a: 'Yes. Upload PNG, JPEG, WebP screenshots or PDF circulars up to 10 MB. The multimodal analyzer extracts both Bengali and English text and explains detected risk factors in both languages.',
  },
  {
    q: 'Why does the system flag personal bKash, Nagad, or Rocket requests?',
    a: 'Recognized Bangladeshi public-sector and major institutional recruitments use authorized gateways such as Teletalk or bank treasury challans. Requests to send application or training money to personal mobile wallets are one of the highest-frequency scam indicators.',
  },
  {
    q: 'Do I need an account to scan a circular?',
    a: 'Guest users can analyze circulars immediately without signing in. Signing in with Google lets you save circulars, track scan history, export reports, and submit community scam alerts.',
  },
];

export function LandingPage({
  onNavigate,
  approvedReports,
  sources,
}: LandingPageProps) {
  const [imgError, setImgError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-medium text-teal-800">
              Employment Safety &amp; Recruitment Verification · Bangladesh
            </p>
            <h1
              className="mt-3 font-display font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', lineHeight: 1.08, textWrap: 'balance' }}
            >
              Verify job circulars before you apply.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Analyze recruitment advertisements from text, website links, screenshots, or PDF files. Detect unauthorized mobile wallet fees, lookalike domains, and impersonation cues with clear English and Bengali explanations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => onNavigate('scan')}
                className="inline-flex items-center gap-2.5 rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Scan a Job Circular</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('community')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Browse Community Alerts</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {!imgError ? (
                <img
                  src="/src/assets/images/hero_verification_desk_1795613473519.jpg"
                  alt="Bangladeshi graduate reviewing an official recruitment document alongside a laptop"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover lg:h-full"
                />
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-8 text-center">
                  <FileSearch className="h-10 w-10 text-teal-700" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Circular Verification Workspace
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width 4-Column Metrics Strip */}
        <div className="mt-12 grid grid-cols-2 border-y border-slate-200 bg-white sm:grid-cols-4">
          <div className="border-b border-r border-slate-200 p-5 sm:border-b-0">
            <div className="font-mono-tabular text-2xl font-semibold text-slate-900">4</div>
            <div className="mt-1 text-xs font-medium text-slate-600">
              Input Formats · Text, URL, Image, PDF
            </div>
          </div>
          <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
            <div className="font-mono-tabular text-2xl font-semibold text-slate-900">6 Rules</div>
            <div className="mt-1 text-xs font-medium text-slate-600">
              Payment, Domain, Urgency &amp; Privacy Checks
            </div>
          </div>
          <div className="border-r border-slate-200 p-5">
            <div className="font-mono-tabular text-2xl font-semibold text-slate-900">
              {sources.length || 14}+
            </div>
            <div className="mt-1 text-xs font-medium text-slate-600">
              Official Bangladeshi Portal References
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono-tabular text-2xl font-semibold text-slate-900">EN / বাংলা</div>
            <div className="mt-1 text-xs font-medium text-slate-600">
              Bilingual Risk Summary &amp; Guidance
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities — Asymmetric Bento Grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How CircularCheck AI evaluates recruitment notices
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Every submission runs through structured extraction, deterministic Bangladesh scam-pattern rules, domain verification, and AI semantic review.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-7 lg:col-span-2">
            <p className="text-xs font-semibold text-teal-800">01. Hybrid AI &amp; Deterministic Rule Scoring</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">
              Transparent evidence instead of black-box guesses
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              CircularCheck AI separates suspicious indicators from verified facts. Six deterministic rule checks inspect personal mobile wallet fees (bKash, Nagad, Rocket), lookalike URLs, free webmail contacts on government claims, manipulative urgency, and sensitive data requests, then calibrate findings with AI semantic reasoning.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div>
                <div className="font-mono-tabular text-sm font-semibold text-slate-900">0–24 Low</div>
                <p className="mt-1 text-xs text-slate-500">Few risk indicators detected</p>
              </div>
              <div>
                <div className="font-mono-tabular text-sm font-semibold text-amber-700">25–49 Moderate</div>
                <p className="mt-1 text-xs text-slate-500">Unverified details require review</p>
              </div>
              <div>
                <div className="font-mono-tabular text-sm font-semibold text-red-700">50–100 High / Critical</div>
                <p className="mt-1 text-xs text-slate-500">Strong scam indicators present</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-7">
            <p className="text-xs font-semibold text-teal-800">02. Multimodal OCR &amp; PDF Extraction</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">
              Scan social media screenshots &amp; PDF notices
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Upload Facebook job post screenshots, WhatsApp forwarded images, or PDF recruitment notices. Extracted organization names, salaries, deadlines, fees, and URLs are structured into a readable report.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('scan')}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              <span>Upload a circular</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-7">
            <p className="text-xs font-semibold text-teal-800">03. Domain &amp; Portal Cross-Check</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">
              Spot lookalike .gov.bd &amp; Teletalk links
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Compares extracted URLs and employer domains against verified Bangladeshi recruitment portals including BPSC, Teletalk All Jobs, Bangladesh Bank, DPE, NTRCA, BRAC, and major telecom employers.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-7 lg:col-span-2">
            <p className="text-xs font-semibold text-teal-800">04. Moderated Community Intelligence</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">
              Learn from verified community scam reports
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Job seekers can submit suspicious circulars with supporting evidence for moderator review. Approved reports appear in the public alert directory so other applicants avoid recurring payment traps and fake appointment letters.
            </p>
            <div className="mt-5 flex flex-wrap gap-6 text-xs font-medium text-slate-500">
              <span>Moderated submissions</span>
              <span aria-hidden="true">·</span>
              <span>PDF report export</span>
              <span aria-hidden="true">·</span>
              <span>Saved scan history</span>
            </div>
          </div>
        </div>
      </section>

      {/* Adjacent Proof: Community Alerts & Trusted Portals */}
      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Community Alerts Preview */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Recent Moderated Community Alerts
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('community')}
                  className="text-sm font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0"
                >
                  View all alerts
                </button>
              </div>

              {approvedReports.length === 0 ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-medium text-slate-800">
                    No approved community reports published yet.
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Sign in and scan a suspicious circular to submit the first verified warning to the community board.
                  </p>
                </div>
              ) : (
                <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {approvedReports.slice(0, 3).map((rep) => (
                    <div key={rep.id} className="p-5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          {rep.riskLevel} Risk
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{rep.reportCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rep.organizationName}</span>
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-semibold text-slate-900">
                        {rep.circularTitle}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {rep.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Official Verification Sources Preview */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Official Verification Portals
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('community')}
                  className="text-sm font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0"
                >
                  Full directory
                </button>
              </div>

              <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {sources.slice(0, 4).map((src) => (
                  <a
                    key={src.id}
                    href={src.officialRecruitmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Globe className="h-3.5 w-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                        <span>{src.sourceType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular truncate">{src.officialDomain}</span>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {src.organizationName}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Responsible AI Notice */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Frequently asked questions
        </h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-900 sm:text-base">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-slate-700">
            <strong className="font-semibold text-slate-900">Advisory Notice:</strong>{' '}
            CircularCheck AI surfaces automated fraud indicators and verification references to support informed decisions. It does not issue legal certifications or replace direct confirmation on an employer’s official portal.
          </p>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
            <span className="font-display text-sm font-bold text-slate-900">CircularCheck AI</span>
            <span className="text-xs text-slate-500">· Verify Before You Apply · Bangladesh</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
            <button type="button" onClick={() => onNavigate('scan')} className="hover:text-slate-900">
              Scanner
            </button>
            <button type="button" onClick={() => onNavigate('community')} className="hover:text-slate-900">
              Community Reports
            </button>
            <button type="button" onClick={() => onNavigate('guide')} className="hover:text-slate-900">
              Safety Guide
            </button>
            <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-slate-900">
              Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
