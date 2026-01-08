/**
 * Mock data for development and demonstration
 * In production, this would be replaced with actual API calls
 */

import { Document, DocumentStatus, Review, ReviewStatus, EDCForm, EDCEntry, DashboardStats, AuditLog } from "./types";

export const mockDocuments: Document[] = [
  {
    id: 1,
    filename: "Informed_Consent_P001.pdf",
    file_type: "application/pdf",
    file_size: 245678,
    document_type: "Informed Consent Form",
    status: DocumentStatus.APPROVED,
    study_id: "STUDY-2024-001",
    patient_id: "P001",
    ai_confidence: 0.96,
    created_at: "2026-01-01T08:30:00Z",
    processed_at: "2026-01-01T08:31:15Z",
    extracted_data: {
      patient_id: { value: "P001", confidence: 0.99 },
      consent_date: { value: "2025-12-15", confidence: 0.95 },
      investigator_name: { value: "Dr. Sarah Johnson", confidence: 0.97 },
      study_protocol: { value: "STUDY-2024-001", confidence: 0.98 }
    }
  },
  {
    id: 2,
    filename: "Lab_Report_P001_Visit1.pdf",
    file_type: "application/pdf",
    file_size: 189234,
    document_type: "Lab Report",
    status: DocumentStatus.REVIEW_PENDING,
    study_id: "STUDY-2024-001",
    patient_id: "P001",
    ai_confidence: 0.78,
    created_at: "2026-01-01T09:15:00Z",
    processed_at: "2026-01-01T09:16:30Z",
    extracted_data: {
      patient_id: { value: "P001", confidence: 0.99 },
      visit_date: { value: "2025-12-20", confidence: 0.95 },
      hemoglobin: { value: "13.5 g/dL", confidence: 0.92 },
      wbc_count: { value: "7.2 x10^9/L", confidence: 0.85 },
      platelet_count: { value: "245 x10^9/L", confidence: 0.73 }
    }
  },
  {
    id: 3,
    filename: "Medical_Record_P002.pdf",
    file_type: "application/pdf",
    file_size: 356789,
    document_type: "Medical Record",
    status: DocumentStatus.PROCESSED,
    study_id: "STUDY-2024-001",
    patient_id: "P002",
    ai_confidence: 0.89,
    created_at: "2026-01-01T10:00:00Z",
    processed_at: "2026-01-01T10:02:45Z"
  },
  {
    id: 4,
    filename: "Adverse_Event_P003.pdf",
    file_type: "application/pdf",
    file_size: 123456,
    document_type: "Adverse Event Report",
    status: DocumentStatus.REVIEW_PENDING,
    study_id: "STUDY-2024-001",
    patient_id: "P003",
    ai_confidence: 0.65,
    created_at: "2026-01-01T11:30:00Z",
    processed_at: "2026-01-01T11:31:00Z"
  },
  {
    id: 5,
    filename: "Protocol_Amendment_v2.pdf",
    file_type: "application/pdf",
    file_size: 890123,
    document_type: "Protocol Document",
    status: DocumentStatus.PROCESSING,
    study_id: "STUDY-2024-001",
    created_at: "2026-01-01T12:00:00Z"
  }
];

export const mockReviews: Review[] = [
  {
    id: 1,
    review_type: "document",
    document_id: 2,
    priority_score: 85,
    priority_level: "HIGH",
    status: ReviewStatus.PENDING,
    ai_confidence: 0.78,
    ai_suggestions: {
      recommendation: "REVIEW",
      concerns: ["Low confidence on platelet count extraction", "Possible OCR error in WBC value"]
    },
    created_at: "2026-01-01T09:16:30Z"
  },
  {
    id: 2,
    review_type: "document",
    document_id: 4,
    priority_score: 95,
    priority_level: "CRITICAL",
    status: ReviewStatus.PENDING,
    ai_confidence: 0.65,
    ai_suggestions: {
      recommendation: "IMMEDIATE_REVIEW",
      concerns: ["Adverse event requires immediate attention", "Safety-critical document"]
    },
    created_at: "2026-01-01T11:31:00Z"
  },
  {
    id: 3,
    review_type: "edc_entry",
    edc_entry_id: 1,
    priority_score: 60,
    priority_level: "MEDIUM",
    status: ReviewStatus.IN_PROGRESS,
    ai_confidence: 0.82,
    assigned_to_id: 1,
    created_at: "2026-01-01T08:00:00Z"
  }
];

export const mockEDCForms: EDCForm[] = [
  {
    id: 1,
    form_name: "Vital Signs",
    form_version: "1.0",
    study_id: "STUDY-2024-001",
    is_active: true,
    form_schema: [
      { id: "visit_date", label: "Visit Date", type: "date", required: true },
      { id: "systolic_bp", label: "Systolic Blood Pressure (mmHg)", type: "number", required: true, 
        validation: { min: 70, max: 250, message: "Value must be between 70 and 250" } },
      { id: "diastolic_bp", label: "Diastolic Blood Pressure (mmHg)", type: "number", required: true,
        validation: { min: 40, max: 150, message: "Value must be between 40 and 150" } },
      { id: "heart_rate", label: "Heart Rate (bpm)", type: "number", required: true,
        validation: { min: 40, max: 200, message: "Value must be between 40 and 200" } },
      { id: "temperature", label: "Temperature (°C)", type: "number", required: true,
        validation: { min: 35, max: 42, message: "Value must be between 35 and 42" } },
      { id: "weight", label: "Weight (kg)", type: "number", required: false },
      { id: "height", label: "Height (cm)", type: "number", required: false }
    ],
    validation_rules: {
      cross_field: [
        { rule: "systolic_bp > diastolic_bp", message: "Systolic BP must be greater than Diastolic BP" }
      ]
    }
  },
  {
    id: 2,
    form_name: "Laboratory Results",
    form_version: "1.0",
    study_id: "STUDY-2024-001",
    is_active: true,
    form_schema: [
      { id: "collection_date", label: "Collection Date", type: "date", required: true },
      { id: "hemoglobin", label: "Hemoglobin (g/dL)", type: "number", required: true },
      { id: "wbc_count", label: "WBC Count (x10^9/L)", type: "number", required: true },
      { id: "platelet_count", label: "Platelet Count (x10^9/L)", type: "number", required: true },
      { id: "glucose", label: "Glucose (mg/dL)", type: "number", required: false },
      { id: "creatinine", label: "Creatinine (mg/dL)", type: "number", required: false }
    ]
  }
];

export const mockEDCEntries: EDCEntry[] = [
  {
    id: 1,
    form_id: 1,
    study_id: "STUDY-2024-001",
    patient_id: "P001",
    visit_id: "V1",
    entry_data: {
      visit_date: "2025-12-20",
      systolic_bp: 128,
      diastolic_bp: 82,
      heart_rate: 72,
      temperature: 36.8,
      weight: 75.5,
      height: 175
    },
    validation_results: {
      validation_result: "PASS",
      errors: [],
      overall_confidence: 0.95,
      recommendation: "ACCEPT"
    },
    completeness_score: 1.0,
    ai_assisted: true,
    ai_confidence: 0.95,
    status: "draft",
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:15:00Z"
  }
];

export const mockDashboardStats: DashboardStats = {
  total_documents: 156,
  pending_reviews: 12,
  processed_today: 24,
  average_confidence: 0.87,
  documents_by_status: {
    [DocumentStatus.UPLOADED]: 3,
    [DocumentStatus.PROCESSING]: 5,
    [DocumentStatus.PROCESSED]: 82,
    [DocumentStatus.REVIEW_PENDING]: 12,
    [DocumentStatus.APPROVED]: 48,
    [DocumentStatus.REJECTED]: 4,
    [DocumentStatus.FAILED]: 2
  },
  reviews_by_priority: {
    CRITICAL: 2,
    HIGH: 5,
    MEDIUM: 3,
    LOW: 2
  },
  processing_time_avg: 45,
  accuracy_rate: 0.94
};

export const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    action: "approve",
    resource_type: "document",
    resource_id: "1",
    reason: "Data extraction verified and accurate",
    timestamp: "2026-01-01T08:32:00Z"
  },
  {
    id: 2,
    user_id: 2,
    action: "create",
    resource_type: "edc_entry",
    resource_id: "1",
    new_value: { form_id: 1, patient_id: "P001" },
    timestamp: "2026-01-01T08:00:00Z"
  },
  {
    id: 3,
    user_id: 1,
    action: "update",
    resource_type: "document",
    resource_id: "2",
    old_value: { status: "processed" },
    new_value: { status: "review_pending" },
    reason: "Low AI confidence requires human review",
    timestamp: "2026-01-01T09:16:30Z"
  }
];

// Helper function to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockAPI = {
  // Documents
  getDocuments: async () => {
    await delay(300);
    return { documents: mockDocuments, total: mockDocuments.length };
  },
  
  getDocument: async (id: number) => {
    await delay(200);
    return mockDocuments.find(d => d.id === id);
  },
  
  uploadDocument: async (file: File, studyId?: string, patientId?: string) => {
    await delay(1000);
    const newDoc: Document = {
      id: mockDocuments.length + 1,
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      status: DocumentStatus.PROCESSING,
      study_id: studyId,
      patient_id: patientId,
      created_at: new Date().toISOString()
    };
    return newDoc;
  },
  
  // Reviews
  getReviews: async () => {
    await delay(300);
    return mockReviews;
  },
  
  approveReview: async (id: number, notes: string) => {
    await delay(500);
    return { success: true, message: "Review approved" };
  },
  
  rejectReview: async (id: number, reason: string) => {
    await delay(500);
    return { success: true, message: "Review rejected" };
  },
  
  // EDC
  getForms: async () => {
    await delay(200);
    return mockEDCForms;
  },
  
  getForm: async (id: number) => {
    await delay(200);
    return mockEDCForms.find(f => f.id === id);
  },
  
  getEDCEntries: async () => {
    await delay(300);
    return mockEDCEntries;
  },
  
  createEDCEntry: async (formId: number, data: any) => {
    await delay(500);
    const newEntry: EDCEntry = {
      id: mockEDCEntries.length + 1,
      form_id: formId,
      study_id: data.study_id || "STUDY-2024-001",
      patient_id: data.patient_id,
      entry_data: data,
      ai_assisted: false,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newEntry;
  },
  
  // Analytics
  getDashboardStats: async () => {
    await delay(400);
    return mockDashboardStats;
  },
  
  getAuditLogs: async (limit: number = 50) => {
    await delay(300);
    return mockAuditLogs.slice(0, limit);
  }
};
