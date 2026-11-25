import type { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  ActivityLog,
  CommunityReport,
  ModerationStatus,
  ReportCategory,
  RiskLevel,
  ScanAnalysisResult,
  SourceType,
  UserProfile,
  VerificationSource,
} from '../types/circular';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';

function formatTimestamp(ts: unknown): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toISOString();
  }
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 120) || `id-${Date.now()}`;
}

export async function ensureUserDocument(fbUser: FirebaseUser): Promise<UserProfile> {
  const userPath = `users/${fbUser.uid}`;
  const privatePath = `users/${fbUser.uid}/private/info`;
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userRef);

    const isBootstrappedAdmin =
      fbUser.email === BOOTSTRAPPED_ADMIN_EMAIL && fbUser.emailVerified;

    if (!snap.exists()) {
      const role: 'user' | 'admin' = isBootstrappedAdmin ? 'admin' : 'user';
      const displayName = (fbUser.displayName || fbUser.email?.split('@')[0] || 'Job Seeker').slice(0, 120);
      const photoUrl = (fbUser.photoURL || '').slice(0, 500);

      await setDoc(userRef, {
        uid: fbUser.uid,
        displayName,
        photoUrl,
        role,
        status: 'active',
        scanCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (fbUser.email) {
        await setDoc(doc(db, 'users', fbUser.uid, 'private', 'info'), {
          uid: fbUser.uid,
          email: fbUser.email.slice(0, 200),
          updatedAt: serverTimestamp(),
        });
      }

      return {
        uid: fbUser.uid,
        displayName,
        photoUrl,
        role,
        status: 'active',
        scanCount: 0,
        email: fbUser.email || undefined,
      };
    }

    const data = snap.data();
    let email = fbUser.email || undefined;
    try {
      const privSnap = await getDoc(doc(db, 'users', fbUser.uid, 'private', 'info'));
      if (privSnap.exists()) {
        email = String(privSnap.data().email || fbUser.email || '');
      } else if (fbUser.email) {
        await setDoc(doc(db, 'users', fbUser.uid, 'private', 'info'), {
          uid: fbUser.uid,
          email: fbUser.email.slice(0, 200),
          updatedAt: serverTimestamp(),
        });
      }
    } catch {
      // Keep auth email fallback if private doc read fails
    }

    return {
      uid: String(data.uid),
      displayName: String(data.displayName || 'Job Seeker'),
      photoUrl: String(data.photoUrl || ''),
      role: isBootstrappedAdmin ? 'admin' : data.role === 'admin' ? 'admin' : 'user',
      status: data.status === 'suspended' ? 'suspended' : 'active',
      scanCount: Number(data.scanCount || 0),
      email,
      createdAt: formatTimestamp(data.createdAt),
      updatedAt: formatTimestamp(data.updatedAt),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${userPath} / ${privatePath}`);
  }
}

export async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
): Promise<void> {
  const id = sanitizeId(`log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const path = `activityLogs/${id}`;
  try {
    await setDoc(doc(db, 'activityLogs', id), {
      id,
      userId,
      action: action.slice(0, 120),
      resourceType: resourceType.slice(0, 80),
      resourceId: sanitizeId(resourceId),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function saveScanToFirestore(
  userId: string,
  report: ScanAnalysisResult,
  markSaved = false
): Promise<ScanAnalysisResult> {
  const scanId = sanitizeId(report.id);
  const path = `scans/${scanId}`;
  try {
    const payload = {
      id: scanId,
      userId,
      inputType: report.inputType,
      originalInput: (report.originalInput || 'Submitted circular').slice(0, 11800),
      extractedText: (report.extractedText || '').slice(0, 11800),
      organizationName: (report.organizationName || 'Not specified').slice(0, 290),
      jobTitle: (report.jobTitle || 'Not specified').slice(0, 290),
      salary: (report.salary || 'Not specified').slice(0, 190),
      applicationDeadline: (report.applicationDeadline || 'Not specified').slice(0, 190),
      applicationFee: (report.applicationFee || 'Not specified').slice(0, 190),
      paymentMethod: (report.paymentMethod || 'Not specified').slice(0, 290),
      contactInformation: (report.contactInformation || 'Not specified').slice(0, 580),
      emailAddress: (report.emailAddress || 'Not specified').slice(0, 190),
      websiteUrl: (report.websiteUrl || 'Not specified').slice(0, 490),
      riskScore: Math.max(0, Math.min(100, Number(report.riskScore || 0))),
      riskLevel: report.riskLevel,
      verificationStatus: report.verificationStatus,
      analysisSummary: (report.analysisSummary || 'Analysis completed.').slice(0, 2400),
      analysisSummaryBn: (report.analysisSummaryBn || '').slice(0, 2900),
      findings: report.findings.slice(0, 20),
      positiveSignals: report.positiveSignals.slice(0, 15).map((s) => String(s).slice(0, 400)),
      recommendations: report.recommendations.slice(0, 15).map((s) => String(s).slice(0, 400)),
      recommendationsBn: report.recommendationsBn.slice(0, 15).map((s) => String(s).slice(0, 500)),
      sources: report.sources.slice(0, 10).map((s) => String(s).slice(0, 400)),
      isSaved: markSaved,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'scans', scanId), payload);

    try {
      await updateDoc(doc(db, 'users', userId), {
        scanCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Non-fatal if user doc counter increment skips
    }

    await logActivity(userId, 'SCAN_CREATED', 'scans', scanId);

    return {
      ...report,
      id: scanId,
      userId,
      isSaved: markSaved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function toggleScanSaved(scanId: string, isSaved: boolean): Promise<void> {
  const path = `scans/${scanId}`;
  try {
    await updateDoc(doc(db, 'scans', scanId), {
      isSaved,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteScan(scanId: string): Promise<void> {
  const path = `scans/${scanId}`;
  try {
    await deleteDoc(doc(db, 'scans', scanId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeUserScans(
  userId: string,
  onData: (scans: ScanAnalysisResult[]) => void
): Unsubscribe {
  const q = query(collection(db, 'scans'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as ScanAnalysisResult),
          id: d.id,
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scans');
    }
  );
}

export function subscribeApprovedCommunityReports(
  onData: (reports: CommunityReport[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'communityReports'),
    where('moderationStatus', '==', 'approved')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as CommunityReport),
          id: d.id,
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'communityReports');
    }
  );
}

export function subscribeMyCommunityReports(
  userId: string,
  onData: (reports: CommunityReport[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'communityReports'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as CommunityReport),
          id: d.id,
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'communityReports');
    }
  );
}

export async function submitCommunityReport(input: {
  userId: string;
  reporterName: string;
  scanId?: string;
  organizationName: string;
  circularTitle: string;
  description: string;
  evidence: string;
  reportCategory: ReportCategory;
  riskLevel: RiskLevel;
}): Promise<string> {
  const reportId = sanitizeId(`rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const path = `communityReports/${reportId}`;
  try {
    await setDoc(doc(db, 'communityReports', reportId), {
      id: reportId,
      userId: input.userId,
      reporterName: input.reporterName.slice(0, 120) || 'Verified Member',
      scanId: input.scanId ? sanitizeId(input.scanId) : '',
      organizationName: input.organizationName.slice(0, 300),
      circularTitle: input.circularTitle.slice(0, 300),
      description: input.description.slice(0, 3000),
      evidence: input.evidence.slice(0, 2000),
      reportCategory: input.reportCategory,
      riskLevel: input.riskLevel,
      moderationStatus: 'pending',
      adminNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await logActivity(input.userId, 'COMMUNITY_REPORT_SUBMITTED', 'communityReports', reportId);
    return reportId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteCommunityReport(reportId: string): Promise<void> {
  const path = `communityReports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'communityReports', reportId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Admin data subscriptions & actions
export function subscribeAllReportsForAdmin(
  onData: (reports: CommunityReport[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'communityReports'),
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as CommunityReport),
          id: d.id,
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'communityReports');
    }
  );
}

export function subscribeAllUsersForAdmin(
  onData: (users: UserProfile[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: String(data.uid || d.id),
          displayName: String(data.displayName || 'User'),
          photoUrl: String(data.photoUrl || ''),
          role: data.role === 'admin' ? 'admin' : 'user',
          status: data.status === 'suspended' ? 'suspended' : 'active',
          scanCount: Number(data.scanCount || 0),
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatTimestamp(data.updatedAt),
        } satisfies UserProfile;
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

export function subscribeAllScansForAdmin(
  onData: (scans: ScanAnalysisResult[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'scans'),
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as ScanAnalysisResult),
          id: d.id,
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scans');
    }
  );
}

export function subscribeActivityLogsForAdmin(
  onData: (logs: ActivityLog[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'activityLogs'),
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: String(data.userId || ''),
          action: String(data.action || ''),
          resourceType: String(data.resourceType || ''),
          resourceId: String(data.resourceId || ''),
          createdAt: formatTimestamp(data.createdAt),
        } satisfies ActivityLog;
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items.slice(0, 40));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activityLogs');
    }
  );
}

export async function moderateCommunityReport(
  adminUid: string,
  reportId: string,
  moderationStatus: ModerationStatus,
  adminNotes: string,
  riskLevel: RiskLevel
): Promise<void> {
  const path = `communityReports/${reportId}`;
  try {
    await updateDoc(doc(db, 'communityReports', reportId), {
      moderationStatus,
      adminNotes: adminNotes.slice(0, 1000),
      riskLevel,
      updatedAt: serverTimestamp(),
    });
    await logActivity(adminUid, `REPORT_${moderationStatus.toUpperCase()}`, 'communityReports', reportId);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateUserRoleOrStatus(
  adminUid: string,
  targetUid: string,
  updates: { role?: 'user' | 'admin'; status?: 'active' | 'suspended' }
): Promise<void> {
  const path = `users/${targetUid}`;
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await logActivity(adminUid, 'USER_MODIFIED', 'users', targetUid);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeVerificationSources(
  onData: (sources: VerificationSource[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'verificationSources'),
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          organizationName: String(data.organizationName || ''),
          officialDomain: String(data.officialDomain || ''),
          officialRecruitmentUrl: String(data.officialRecruitmentUrl || ''),
          sourceType: (data.sourceType || 'Government') as SourceType,
          verificationNotes: String(data.verificationNotes || ''),
          createdAt: formatTimestamp(data.createdAt),
          updatedAt: formatTimestamp(data.updatedAt),
        } satisfies VerificationSource;
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'verificationSources');
    }
  );
}

export async function addVerificationSource(
  adminUid: string,
  source: Omit<VerificationSource, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const id = sanitizeId(`src-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const path = `verificationSources/${id}`;
  try {
    await setDoc(doc(db, 'verificationSources', id), {
      id,
      organizationName: source.organizationName.slice(0, 240),
      officialDomain: source.officialDomain.slice(0, 200),
      officialRecruitmentUrl: source.officialRecruitmentUrl.slice(0, 500),
      sourceType: source.sourceType,
      verificationNotes: source.verificationNotes.slice(0, 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await logActivity(adminUid, 'SOURCE_ADDED', 'verificationSources', id);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteVerificationSource(adminUid: string, sourceId: string): Promise<void> {
  const path = `verificationSources/${sourceId}`;
  try {
    await deleteDoc(doc(db, 'verificationSources', sourceId));
    await logActivity(adminUid, 'SOURCE_DELETED', 'verificationSources', sourceId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function seedDefaultSourcesIfEmpty(adminUid: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'verificationSources'));
    if (!snap.empty) return;
    const res = await fetch('/api/verify/sources');
    if (!res.ok) return;
    const data = (await res.json()) as { sources: VerificationSource[] };
    for (const s of data.sources.slice(0, 10)) {
      const id = sanitizeId(s.id);
      await setDoc(doc(db, 'verificationSources', id), {
        id,
        organizationName: s.organizationName.slice(0, 240),
        officialDomain: s.officialDomain.slice(0, 200),
        officialRecruitmentUrl: s.officialRecruitmentUrl.slice(0, 500),
        sourceType: s.sourceType,
        verificationNotes: s.verificationNotes.slice(0, 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await logActivity(adminUid, 'SOURCES_SEEDED', 'verificationSources', 'initial-batch');
  } catch {
    // Silent non-blocking seed helper
  }
}
