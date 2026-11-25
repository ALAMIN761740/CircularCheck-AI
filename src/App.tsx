/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { CommunityView } from './components/CommunityView';
import { DashboardView } from './components/DashboardView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { ReportView } from './components/ReportView';
import { SafetyGuideView } from './components/SafetyGuideView';
import { ScannerWorkspace } from './components/ScannerWorkspace';
import { TopNav, type AppRoute } from './components/TopNav';
import { auth, googleProvider } from './lib/firebase';
import {
  deleteScan,
  ensureUserDocument,
  saveScanToFirestore,
  subscribeApprovedCommunityReports,
  subscribeMyCommunityReports,
  subscribeUserScans,
  subscribeVerificationSources,
  toggleScanSaved,
} from './lib/firestoreService';
import type {
  CommunityReport,
  ScanAnalysisResult,
  UserProfile,
  VerificationSource,
} from './types/circular';

export default function App() {
  const [route, setRoute] = useState<AppRoute>('home');
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const [activeReport, setActiveReport] = useState<ScanAnalysisResult | null>(null);
  const [prefillReportForCommunity, setPrefillReportForCommunity] =
    useState<ScanAnalysisResult | null>(null);

  const [userScans, setUserScans] = useState<ScanAnalysisResult[]>([]);
  const [approvedReports, setApprovedReports] = useState<CommunityReport[]>([]);
  const [myReports, setMyReports] = useState<CommunityReport[]>([]);
  const [firestoreSources, setFirestoreSources] = useState<VerificationSource[]>([]);
  const [apiSources, setApiSources] = useState<VerificationSource[]>([]);

  // Load baseline official sources from backend registry
  useEffect(() => {
    fetch('/api/verify/sources')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sources) {
          setApiSources(data.sources);
        }
      })
      .catch(() => {
        // Non-blocking fallback
      });
  }, []);

  // Subscribe to public approved reports & Firestore verification sources
  useEffect(() => {
    const unsubReports = subscribeApprovedCommunityReports(setApprovedReports);
    const unsubSources = subscribeVerificationSources(setFirestoreSources);
    return () => {
      unsubReports();
      unsubSources();
    };
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setUserScans([]);
        setMyReports([]);
        setAuthLoading(false);
        return;
      }
      try {
        const profile = await ensureUserDocument(fbUser);
        setUser(profile);
      } catch (err) {
        console.error('Auth profile sync error:', err);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // User-scoped Firestore listeners (only active when signed in)
  useEffect(() => {
    if (!user) return;
    const unsubScans = subscribeUserScans(user.uid, setUserScans);
    const unsubMyReports = subscribeMyCommunityReports(user.uid, setMyReports);
    return () => {
      unsubScans();
      unsubMyReports();
    };
  }, [user]);

  const mergedSources = useMemo(() => {
    const map = new Map<string, VerificationSource>();
    for (const s of apiSources) map.set(s.officialDomain, s);
    for (const s of firestoreSources) map.set(s.officialDomain, s);
    return Array.from(map.values());
  }, [apiSources, firestoreSources]);

  const handleSignIn = async () => {
    setAuthNotice(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in was cancelled or blocked.';
      setAuthNotice(msg);
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    if (route === 'dashboard') {
      setRoute('home');
    }
  };

  const handleNavigate = (next: AppRoute) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanComplete = async (report: ScanAnalysisResult) => {
    if (user) {
      try {
        const saved = await saveScanToFirestore(user.uid, report, false);
        setActiveReport(saved);
      } catch {
        setActiveReport(report);
      }
    } else {
      setActiveReport(report);
    }
    handleNavigate('report');
  };

  const handleToggleSave = async (report: ScanAnalysisResult) => {
    if (!user) return;
    const existsInUserScans = userScans.some((s) => s.id === report.id);
    if (!existsInUserScans) {
      const created = await saveScanToFirestore(user.uid, report, true);
      if (activeReport?.id === report.id) {
        setActiveReport(created);
      }
      return;
    }
    const nextSaved = !report.isSaved;
    await toggleScanSaved(report.id, nextSaved);
    if (activeReport?.id === report.id) {
      setActiveReport({ ...report, isSaved: nextSaved });
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    await deleteScan(scanId);
    if (activeReport?.id === scanId) {
      setActiveReport(null);
      handleNavigate('dashboard');
    }
  };

  const handleReportToCommunity = (report: ScanAnalysisResult) => {
    setPrefillReportForCommunity(report);
    handleNavigate('community');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopNav
          currentRoute={route}
          onNavigate={handleNavigate}
          user={user}
          authLoading={authLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />

        {authNotice && (
          <div className="mx-auto mt-4 max-w-4xl px-4">
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
              <span>{authNotice}</span>
              <button
                type="button"
                onClick={() => setAuthNotice(null)}
                className="font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main>
          {route === 'home' && (
            <LandingPage
              onNavigate={handleNavigate}
              approvedReports={approvedReports}
              sources={mergedSources}
            />
          )}

          {route === 'scan' && (
            <ScannerWorkspace
              onScanComplete={handleScanComplete}
              defaultLang={lang}
              onChangeLang={setLang}
            />
          )}

          {route === 'report' && activeReport && (
            <ReportView
              report={activeReport}
              lang={lang}
              onChangeLang={setLang}
              isSignedIn={Boolean(user)}
              onToggleSave={handleToggleSave}
              onReportToCommunity={handleReportToCommunity}
              onNewScan={() => handleNavigate('scan')}
              onSignInPrompt={handleSignIn}
            />
          )}

          {route === 'report' && !activeReport && (
            <ScannerWorkspace
              onScanComplete={handleScanComplete}
              defaultLang={lang}
              onChangeLang={setLang}
            />
          )}

          {route === 'community' && (
            <CommunityView
              approvedReports={approvedReports}
              sources={mergedSources}
              user={user}
              prefillScan={prefillReportForCommunity}
              onClearPrefill={() => setPrefillReportForCommunity(null)}
              onSignInPrompt={handleSignIn}
            />
          )}

          {route === 'guide' && (
            <SafetyGuideView
              lang={lang}
              onChangeLang={setLang}
              onNavigate={handleNavigate}
            />
          )}

          {route === 'dashboard' && (
            <DashboardView
              user={user}
              scans={userScans}
              myReports={myReports}
              sources={mergedSources}
              onSignIn={handleSignIn}
              onNavigate={handleNavigate}
              onOpenReport={(rep) => {
                setActiveReport(rep);
                handleNavigate('report');
              }}
              onToggleSave={handleToggleSave}
              onDeleteScan={handleDeleteScan}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
