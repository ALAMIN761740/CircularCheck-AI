export type InputType = 'text' | 'url' | 'image' | 'pdf';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type VerificationStatus =
  | 'Verified Against Available Source'
  | 'Partially Verified'
  | 'Unverified'
  | 'Unable to Verify';

export type ReportCategory =
  | 'Payment Scam'
  | 'Impersonation'
  | 'Phishing URL'
  | 'Fake Job Offer'
  | 'Data Harvesting';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type SourceType =
  | 'Government'
  | 'Banking'
  | 'NGO'
  | 'Telecom & Corporate'
  | 'Education';

export interface RiskFinding {
  title: string;
  severity: RiskLevel;
  category: string;
  weight: number;
  description: string;
  descriptionBn: string;
  evidence: string;
  source: 'AI' | 'Rule Engine' | 'Hybrid';
}

export interface ScanAnalysisResult {
  id: string;
  userId?: string;
  inputType: InputType;
  originalInput: string;
  extractedText: string;
  organizationName: string;
  jobTitle: string;
  salary: string;
  applicationDeadline: string;
  applicationFee: string;
  paymentMethod: string;
  contactInformation: string;
  emailAddress: string;
  websiteUrl: string;
  riskScore: number;
  riskLevel: RiskLevel;
  verificationStatus: VerificationStatus;
  analysisSummary: string;
  analysisSummaryBn: string;
  findings: RiskFinding[];
  positiveSignals: string[];
  recommendations: string[];
  recommendationsBn: string[];
  sources: string[];
  isSaved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityReport {
  id: string;
  userId: string;
  reporterName: string;
  scanId: string;
  organizationName: string;
  circularTitle: string;
  description: string;
  evidence: string;
  reportCategory: ReportCategory;
  riskLevel: RiskLevel;
  moderationStatus: ModerationStatus;
  adminNotes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerificationSource {
  id: string;
  organizationName: string;
  officialDomain: string;
  officialRecruitmentUrl: string;
  sourceType: SourceType;
  verificationNotes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoUrl?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  scanCount: number;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt?: string;
}
