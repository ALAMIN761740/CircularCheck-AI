import {
  CheckCircle2,
  Database,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  addVerificationSource,
  deleteCommunityReport,
  deleteVerificationSource,
  moderateCommunityReport,
  seedDefaultSourcesIfEmpty,
  subscribeActivityLogsForAdmin,
  subscribeAllReportsForAdmin,
  subscribeAllScansForAdmin,
  subscribeAllUsersForAdmin,
  updateUserRoleOrStatus,
} from '../lib/firestoreService';
import type {
  ActivityLog,
  CommunityReport,
  RiskLevel,
  ScanAnalysisResult,
  SourceType,
  UserProfile,
  VerificationSource,
} from '../types/circular';

interface AdminPanelProps {
  currentUser: UserProfile;
  sources: VerificationSource[];
}

export function AdminPanel({ currentUser, sources }: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'moderation' | 'users' | 'sources' | 'logs'>('moderation');
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [scans, setScans] = useState<ScanAnalysisResult[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notesByReport, setNotesByReport] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newSourceOrg, setNewSourceOrg] = useState('');
  const [newSourceDomain, setNewSourceDomain] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceType, setNewSourceType] = useState<SourceType>('Government');
  const [newSourceNotes, setNewSourceNotes] = useState('');

  useEffect(() => {
    const unsub1 = subscribeAllReportsForAdmin(setReports);
    const unsub2 = subscribeAllUsersForAdmin(setUsers);
    const unsub3 = subscribeAllScansForAdmin(setScans);
    const unsub4 = subscribeActivityLogsForAdmin(setLogs);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const pendingCount = reports.filter((r) => r.moderationStatus === 'pending').length;
  const approvedCount = reports.filter((r) => r.moderationStatus === 'approved').length;

  const riskChartData = useMemo(() => {
    const counts: Record<RiskLevel, number> = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    for (const s of scans) {
      counts[s.riskLevel] = (counts[s.riskLevel] || 0) + 1;
    }
    return [
      { level: 'Low', scans: counts.Low },
      { level: 'Moderate', scans: counts.Moderate },
      { level: 'High', scans: counts.High },
      { level: 'Critical', scans: counts.Critical },
    ];
  }, [scans]);

  const handleModerate = async (
    report: CommunityReport,
    status: 'approved' | 'rejected'
  ) => {
    setBusyId(report.id);
    try {
      const note = notesByReport[report.id] ?? report.adminNotes ?? '';
      await moderateCommunityReport(
        currentUser.uid,
        report.id,
        status,
        note,
        report.riskLevel
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceOrg.trim() || !newSourceDomain.trim() || !newSourceUrl.trim()) return;
    setBusyId('new-source');
    try {
      await addVerificationSource(currentUser.uid, {
        organizationName: newSourceOrg.trim(),
        officialDomain: newSourceDomain.trim(),
        officialRecruitmentUrl: newSourceUrl.trim(),
        sourceType: newSourceType,
        verificationNotes: newSourceNotes.trim(),
      });
      setNewSourceOrg('');
      setNewSourceDomain('');
      setNewSourceUrl('');
      setNewSourceNotes('');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Administrative Operations &amp; Moderation
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Review community scam reports, manage registered accounts, and maintain the official verification registry.
        </p>
      </div>

      {/* Platform KPI Strip */}
      <div className="grid grid-cols-2 border border-slate-200 bg-white rounded-xl sm:grid-cols-4">
        <div className="border-b border-r border-slate-200 p-4 sm:border-b-0">
          <div className="text-xs text-slate-500">Registered Users</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
            {users.length}
          </div>
        </div>
        <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r">
          <div className="text-xs text-slate-500">Total Stored Scans</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
            {scans.length}
          </div>
        </div>
        <div className="border-r border-slate-200 p-4">
          <div className="text-xs text-slate-500">Pending Moderation</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-amber-700">
            {pendingCount}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Approved Alerts</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-teal-700">
            {approvedCount}
          </div>
        </div>
      </div>

      {/* Risk Distribution Analytics Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-display text-sm font-bold text-slate-900">
          Platform Risk Category Distribution
        </h3>
        <div className="mt-4 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="level" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip />
              <Bar dataKey="scans" fill="#0F766E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {(
          [
            { id: 'moderation', label: `Moderation Queue (${reports.length})` },
            { id: 'users', label: `Users (${users.length})` },
            { id: 'sources', label: `Verification Sources (${sources.length})` },
            { id: 'logs', label: 'Audit Logs' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAdminTab(t.id)}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              adminTab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adminTab === 'moderation' && (
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No community reports submitted yet.
            </div>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">
                      Status: {rep.moderationStatus}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{rep.reportCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rep.riskLevel} Risk</span>
                    <span aria-hidden="true">·</span>
                    <span>By {rep.reporterName}</span>
                  </div>
                  <span className="font-mono-tabular text-xs text-slate-400">
                    {rep.createdAt ? new Date(rep.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <h4 className="mt-1.5 font-display text-sm font-bold text-slate-900">
                  {rep.circularTitle} — {rep.organizationName}
                </h4>
                <p className="mt-1 text-sm text-slate-600">{rep.description}</p>
                {rep.evidence && (
                  <p className="mt-1.5 font-mono-tabular text-xs text-slate-500">
                    Evidence: {rep.evidence}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={notesByReport[rep.id] ?? rep.adminNotes ?? ''}
                    onChange={(e) =>
                      setNotesByReport((prev) => ({ ...prev, [rep.id]: e.target.value }))
                    }
                    placeholder="Add moderator verification note..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={() => handleModerate(rep, 'approved')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={() => handleModerate(rep, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={() => deleteCommunityReport(rep.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      aria-label="Delete report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {adminTab === 'users' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Scans</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{u.displayName}</div>
                    <div className="font-mono-tabular text-[11px] text-slate-500">{u.uid}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{u.role}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{u.status}</td>
                  <td className="px-4 py-3 text-right font-mono-tabular text-slate-900">
                    {u.scanCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateUserRoleOrStatus(currentUser.uid, u.uid, {
                            role: u.role === 'admin' ? 'user' : 'admin',
                          })
                        }
                        className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {u.role === 'admin' ? 'Set User' : 'Make Admin'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateUserRoleOrStatus(currentUser.uid, u.uid, {
                            status: u.status === 'active' ? 'suspended' : 'active',
                          })
                        }
                        className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'sources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Manage official verification registry entries stored in Firestore.
            </p>
            <button
              type="button"
              onClick={() => seedDefaultSourcesIfEmpty(currentUser.uid)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sync Default Bangladesh Sources</span>
            </button>
          </div>

          <form
            onSubmit={handleAddSource}
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
          >
            <input
              type="text"
              required
              value={newSourceOrg}
              onChange={(e) => setNewSourceOrg(e.target.value)}
              placeholder="Organization Name"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
            />
            <input
              type="text"
              required
              value={newSourceDomain}
              onChange={(e) => setNewSourceDomain(e.target.value)}
              placeholder="Official Domain (e.g., bpsc.gov.bd)"
              className="rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-xs focus:border-teal-700 focus:outline-none"
            />
            <input
              type="url"
              required
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              placeholder="https://www.bpsc.gov.bd"
              className="rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-xs focus:border-teal-700 focus:outline-none"
            />
            <select
              value={newSourceType}
              onChange={(e) => setNewSourceType(e.target.value as SourceType)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
            >
              <option value="Government">Government</option>
              <option value="Banking">Banking</option>
              <option value="NGO">NGO</option>
              <option value="Telecom & Corporate">Telecom &amp; Corporate</option>
              <option value="Education">Education</option>
            </select>
            <input
              type="text"
              value={newSourceNotes}
              onChange={(e) => setNewSourceNotes(e.target.value)}
              placeholder="Verification guidance note..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-700 focus:outline-none sm:col-span-2"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={busyId === 'new-source'}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Official Source</span>
              </button>
            </div>
          </form>

          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {sources.map((src) => (
              <div key={src.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">
                    {src.sourceType} · <span className="font-mono-tabular">{src.officialDomain}</span>
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {src.organizationName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteVerificationSource(currentUser.uid, src.id)}
                  className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                  aria-label="Remove source"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'logs' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Resource</th>
                <th className="px-4 py-3 font-semibold">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2.5 font-mono-tabular text-slate-500">
                    {l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{l.action}</td>
                  <td className="px-4 py-2.5 font-mono-tabular text-slate-600">
                    {l.resourceType}/{l.resourceId}
                  </td>
                  <td className="px-4 py-2.5 font-mono-tabular text-slate-500">{l.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
