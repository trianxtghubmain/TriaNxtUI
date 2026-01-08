/**
 * TypeScript type definitions for the Clinical Research System
 */

export enum DocumentStatus {
  UPLOADED = "uploaded",
  PROCESSING = "processing",
  PROCESSED = "processed",
  REVIEW_PENDING = "review_pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  FAILED = "failed",
}

export enum ReviewStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  APPROVED = "approved",
  REJECTED = "rejected",
  MODIFIED = "modified",
}

export enum UserRole {
  ADMIN = "admin",
  PI = "principal_investigator",
  CRC = "clinical_research_coordinator",
  DATA_MANAGER = "data_manager",
  AUDITOR = "auditor",
  AI_REVIEWER = "ai_reviewer",
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  document_type?: string;
  status: DocumentStatus;
  study_id?: string;
  patient_id?: string;
  extracted_data?: Record<string, any>;
  ai_confidence?: number;
  created_at: string;
  processed_at?: string;
}

export interface ExtractedField {
  value: string;
  confidence: number;
  location?: string;
  ambiguity_flag: boolean;
  notes?: string;
}

export interface EDCForm {
  id: number;
  form_name: string;
  form_version: string;
  study_id: string;
  form_schema: FormField[];
  validation_rules?: Record<string, any>;
  is_active: boolean;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "textarea";
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface EDCEntry {
  id: number;
  form_id: number;
  study_id: string;
  patient_id: string;
  visit_id?: string;
  entry_data: Record<string, any>;
  validation_results?: ValidationResult;
  completeness_score?: number;
  ai_assisted: boolean;
  ai_confidence?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  validation_result: "PASS" | "FAIL" | "WARNING";
  errors: ValidationError[];
  overall_confidence: number;
  recommendation: "ACCEPT" | "REVIEW" | "REJECT";
}

export interface ValidationError {
  field: string;
  severity: "ERROR" | "WARNING" | "INFO";
  message: string;
  suggested_value?: string;
  rule_violated?: string;
}

export interface Review {
  id: number;
  review_type: string;
  document_id?: number;
  edc_entry_id?: number;
  priority_score: number;
  priority_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  assigned_to_id?: number;
  status: ReviewStatus;
  ai_suggestions?: Record<string, any>;
  ai_confidence?: number;
  reviewer_notes?: string;
  decision?: string;
  decision_reason?: string;
  created_at: string;
  completed_at?: string;
}

export interface DashboardStats {
  total_documents: number;
  pending_reviews: number;
  processed_today: number;
  average_confidence: number;
  documents_by_status: Record<DocumentStatus, number>;
  reviews_by_priority: Record<string, number>;
  processing_time_avg: number;
  accuracy_rate: number;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  reason?: string;
  timestamp: string;
}
