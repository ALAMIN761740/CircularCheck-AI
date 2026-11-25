import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Flag,
  History,
  LayoutDashboard,
  LogIn,
  Plus,
  Search,
  Shield,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  CommunityReport,
  RiskLevel,
  ScanAnalysisResult,
  UserProfile,
  VerificationSource,
} from '../types/circular';
import { AdminPanel } from './AdminPanel';
import type { AppRoute } from './TopNav';

interface DashboardViewProps {
  user: UserProfile | null;
  scans: ScanAnalysisResult[];
  myReports: CommunityReport[];
  sources: VerificationSource[];
  onSignIn: () => void;
  onNavigate: (route: AppRoute) => void;
  onOpenReport: (report: ScanAnalysisResult) => void;
  onToggleSave: (report: ScanAnalysisResult) => Promise<void>;
  onDeleteScan: (scanId: string) => Promise<void>;
}

type DashTab = 'overview' | 'history' | 'saved' | 'reports' | 'admin';

export function DashboardView({
  user,
  scans,
  myReports,
  sources,
  onSignIn,
  onNavigate,
  onOpenReport,
  onToggleSave,
  onDeleteScan,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<DashTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');

  const savedScans = useMemo(() => scans.filter((s) => s.isSaved), [scans]);
  const highRiskCount = useMemo(
    () => scans.filter((s) => s.riskLevel === 'High' || s.riskLevel === 'Critical').length,
    [scans]
  );

  const filteredScans = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const base = activeTab === 'saved' ? savedScans : scans;
    return base.filter((s) => {
      if (riskFilter !== 'All' && s.riskLevel !== riskFilter) return false;
      if (!q) return true;
      return (
        s.organizationName.toLowerCase().includes(q) ||
        s.jobTitle.toLowerCase().includes(q) ||
        s.inputType.toLowerCase().includes(q)
      );
    });
  }, [scans, savedScans, activeTab, searchTerm, riskFilter]);

  const chartData = useMemo(() => {
    const counts: Record<RiskLevel, number> = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    for (const s of scans) {
      counts[s.riskLevel] = (counts[s.riskLevel] || 0) + 1;
    }
    return [
      { level: 'Low', count: counts.Low },
      { level: 'Moderate', count: counts.Moderate },
      { level: 'High', count: counts.High },
      { level: 'Critical', count: counts.Critical },
    ];
  }, [scans]);

  if (!user) {
    return (
      <div className="mx-auto my-14 max-w-xl rounded-xl border border-slate-200 bg-white p-10 text-center">
        <LayoutDashboard className="mx-auto h-9 w-9 text-teal-700" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
          Personal Verification Dashboard
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Sign in with Google to automatically store your circular scan history, bookmark verified or risky circulars, and track community report moderation.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span>Sign In with Google</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('scan')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Continue as Guest Scanner</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar Navigation (240-260px on desktop) */}
        <aside className="lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-sm font-bold text-slate-900 truncate">{user.displayName}</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {user.role === 'admin' ? 'Administrator Account' : 'Registered Member'}
              </div>
            </div>

            <nav className="mt-3 space-y-1" aria-label="Dashboard sections">
              {(
                [
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'history', label: `Scan History (${scans.length})`, icon: History },
                  { id: 'saved', label: `Saved Circulars (${savedScans.length})`, icon: Bookmark },
                  { id: 'reports', label: `My Reports (${myReports.length})`, icon: Flag },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                    activeTab === 'admin'
                      ? 'bg-teal-700 text-white'
                      : 'text-teal-800 hover:bg-teal-50'
                  }`}
                >
                  <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Admin Console</span>
                </button>
              )}
            </nav>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('scan')}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-800"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New Circular Scan</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Content */}
        <main className="lg:col-span-9">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Summary of your analyzed job circulars, risk indicators, and saved items.
                </p>
              </div>

              <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-white sm:grid-cols-4">
                <div className="border-b border-r border-slate-200 p-4 sm:border-b-0">
                  <div className="text-xs text-slate-500">Total Scans</div>
                  <div className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                    {scans.length}
                  </div>
                </div>
                <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">
                  <div className="text-xs text-slate-500">High / Critical Flagged</div>
                  <div className="mt-1 font-mono-tabular text-2xl font-bold text-red-700">
                    {highRiskCount}
                  </div>
                </div>
                <div className="border-r border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Saved Circulars</div>
                  <div className="mt-1 font-mono-tabular text-2xl font-bold text-teal-700">
                    {savedScans.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-500">My Reports</div>
                  <div className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                    {myReports.length}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Your Risk Distribution
                </h2>
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="level" tick={{ fontSize: 12, fill: '#475569' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0F172A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Scans Preview */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Recent Circular Analyses
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                  >
                    View all
                  </button>
                </div>
                {scans.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-600">
                      You have not scanned any circulars yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('scan')}
                      className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Run Your First Scan
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {scans.slice(0, 5).map((scan) => (
                      <div
                        key={scan.id}
                        className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/70"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {scan.jobTitle !== 'Not specified'
                              ? scan.jobTitle
                              : scan.organizationName}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {scan.organizationName} · {scan.inputType.toUpperCase()} ·{' '}
                            <span className="font-mono-tabular">
                              {scan.riskScore}/100 ({scan.riskLevel})
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenReport(scan)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                        >
                          <span>Open Report</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'history' || activeTab === 'saved') && (
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {activeTab === 'saved' ? 'Saved Circulars' : 'Scan History'}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter by organization or role..."
                      className="w-56 rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs focus:border-teal-700 focus:outline-none"
                    />
                  </div>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value as 'All' | RiskLevel)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-700 focus:outline-none"
                  >
                    <option value="All">All Risk Levels</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {filteredScans.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                  <p className="text-sm font-medium text-slate-800">
                    {activeTab === 'saved'
                      ? 'No saved circulars match your filter.'
                      : 'No scans found.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('scan')}
                    className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                  >
                    Analyze a Circular
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Circular &amp; Organization</th>
                        <th className="px-4 py-3 font-semibold">Source</th>
                        <th className="px-4 py-3 text-right font-semibold">Risk Score</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredScans.map((scan) => (
                        <tr key={scan.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => onOpenReport(scan)}
                              className="text-left font-semibold text-slate-900 hover:text-teal-700"
                            >
                              {scan.jobTitle !== 'Not specified'
                                ? scan.jobTitle
                                : 'Job Circular Report'}
                            </button>
                            <div className="text-[11px] text-slate-500">
                              {scan.organizationName}
                            </div>
                          </td>
                          <td className="px-4 py-3 uppercase text-slate-600">
                            {scan.inputType}
                          </td>
                          <td className="px-4 py-3 text-right font-mono-tabular font-semibold text-slate-900">
                            {scan.riskScore}/100 · {scan.riskLevel}
                          </td>
                          <td className="px-4 py-3 font-mono-tabular text-slate-500">
                            {scan.createdAt
                              ? new Date(scan.createdAt).toLocaleDateString()
                              : ''}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onToggleSave(scan)}
                                className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                                title={scan.isSaved ? 'Remove bookmark' : 'Save circular'}
                              >
                                {scan.isSaved ? (
                                  <BookmarkCheck className="h-3.5 w-3.5 text-teal-700" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteScan(scan.id)}
                                className="rounded border border-slate-200 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                title="Delete scan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  My Community Submissions
                </h1>
                <button
                  type="button"
                  onClick={() => onNavigate('community')}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  New Report
                </button>
              </div>
              {myReports.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
                  You have not submitted any community reports yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {myReports.map((rep) => (
                    <div key={rep.id} className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span>
                          Moderation:{' '}
                          <strong className="font-semibold text-slate-900">
                            {rep.moderationStatus}
                          </strong>{' '}
                          · {rep.reportCategory}
                        </span>
                        <span className="font-mono-tabular">
                          {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-bold text-slate-900">
                        {rep.circularTitle} — {rep.organizationName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{rep.description}</p>
                      {rep.adminNotes && (
                        <p className="mt-2 text-xs font-medium text-teal-800">
                          Moderator Note: {rep.adminNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <AdminPanel currentUser={user} sources={sources} />
          )}
        </main>
      </div>
    </div>
  );
}
