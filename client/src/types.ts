export type IncidentCategory =
  | 'FAKE_PROFILE'
  | 'CYBERBULLYING'
  | 'IMPERSONATION'
  | 'ONLINE_HARASSMENT'
  | 'THREATS'
  | 'CYBERSTALKING'
  | 'OTHER';

export type CaseStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFO_REQUESTED'
  | 'REFERRED_TO_AUTHORITY'
  | 'ACTION_IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type StaffRole = 'SAFETY_OFFICER' | 'SYSTEM_ADMIN';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  department: string;
  isActive: boolean;
  createdAt?: string;
  _count?: {
    assignedCases: number;
  };
}

export interface StatusHistoryItem {
  id: string;
  oldStatus: string;
  newStatus: string;
  reason?: string;
  createdAt: string;
  changedBy?: {
    id: string;
    name: string;
  };
}

export interface ReporterUpdateItem {
  id: string;
  message: string;
  requiresInput: boolean;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface InternalNoteItem {
  id: string;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface ReporterFollowUpItem {
  id: string;
  message: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface CaseDetail {
  id: string;
  category: IncidentCategory;
  platform: string;
  description: string;
  incidentDate: string;
  profileUrl?: string | null;
  isImmediateDanger: boolean;
  reportingMode: 'ANONYMOUS' | 'IDENTIFIED';
  reporterName?: string | null;
  reporterEmail?: string | null;
  reporterPhone?: string | null;
  privacyNoticeAck: boolean;
  status: CaseStatus;
  priority: CasePriority;
  assignedOfficerId?: string | null;
  assignedOfficer?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  } | null;
  resolutionDetails?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryItem[];
  reporterUpdates: ReporterUpdateItem[];
  internalNotes?: InternalNoteItem[];
  followUps?: ReporterFollowUpItem[];
  evidence?: EvidenceItem[];
  evidenceCount?: number;
  auditEvents?: AuditEventItem[];
}

export interface AuditEventItem {
  id: string;
  action: string;
  details: string;
  caseId?: string | null;
  staffUserId?: string | null;
  staffUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  case?: {
    id: string;
    category: string;
    status: string;
  } | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalCases: number;
  submittedCases: number;
  underReviewCases: number;
  highOrCriticalPriority: number;
  additionalInfoRequested: number;
  resolvedCases: number;
  auditCount: number;
  byCategory: { name: string; count: number }[];
  byPlatform: { name: string; count: number }[];
  byStatus: { name: string; count: number }[];
}

export interface TriageResponse {
  disclaimer: string;
  suggestedCategory: string;
  categoryConfidence: number;
  categoryReason: string;
  recommendedPriority: string;
  urgencyFlags: string[];
  potentialCorrelatedCases: {
    id: string;
    category: string;
    platform: string;
    priority: string;
    createdAt: string;
  }[];
  recommendedActions: string[];
}
