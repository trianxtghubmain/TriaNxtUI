# AI Prompt Templates for Clinical Research System

## Overview

This document contains prompt templates for various AI tasks in the clinical research workflow. These prompts are designed to work with various LLM providers (OpenAI, Anthropic, local models).

## Document Extraction Prompts

### 1. Clinical Document Classification

```
SYSTEM: You are a clinical document classification expert. Classify documents accurately and provide confidence scores.

USER: Analyze the following document and classify it into one of these categories:
- Informed Consent Form
- Lab Report
- Medical Record
- Case Report Form
- Adverse Event Report
- Protocol Document
- Other

Document Text:
{document_text}

Respond in JSON format:
{
  "document_type": "category name",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "secondary_types": ["alternative classifications if uncertain"]
}
```

### 2. Data Field Extraction

```
SYSTEM: You are an expert at extracting structured data from clinical documents. Extract all relevant information accurately, maintaining data integrity.

USER: Extract the following fields from this clinical document:

Required Fields:
- Patient ID / Subject Number
- Date of Visit
- Study Protocol Number
- Site Number
- Investigator Name
- Vital Signs (Blood Pressure, Heart Rate, Temperature, etc.)
- Laboratory Values
- Adverse Events
- Medications
- Dates (consent, screening, enrollment)

Document Text:
{document_text}

Instructions:
1. Extract exact values as they appear
2. If a field is not found, mark as "NOT_FOUND"
3. Include page/section references
4. Flag any ambiguous or unclear values
5. Provide confidence score for each extracted field

Respond in JSON format:
{
  "extracted_fields": {
    "field_name": {
      "value": "extracted value",
      "confidence": 0.0-1.0,
      "location": "page X, section Y",
      "ambiguity_flag": true/false,
      "notes": "any relevant notes"
    }
  },
  "overall_confidence": 0.0-1.0,
  "extraction_issues": ["list of any problems encountered"]
}
```

### 3. OCR Post-Processing

```
SYSTEM: You are an expert at correcting OCR errors in medical documents while preserving exact medical terminology and numerical values.

USER: The following text was extracted using OCR and may contain errors. Correct any obvious OCR mistakes while being extremely careful with:
- Medical terminology (preserve exact spelling)
- Numerical values (dates, measurements, IDs)
- Names and identifiers
- Units of measurement

OCR Text:
{ocr_text}

Context: This is a {document_type} from a clinical trial.

Rules:
1. Only correct obvious OCR errors (l→1, O→0, etc.)
2. NEVER change medical terms unless clearly garbled
3. NEVER alter numerical values unless obviously wrong (e.g., letter instead of number)
4. Flag uncertain corrections
5. Preserve original formatting

Respond in JSON format:
{
  "corrected_text": "text with corrections",
  "corrections_made": [
    {
      "original": "original text",
      "corrected": "corrected text",
      "confidence": 0.0-1.0,
      "reason": "why correction was made"
    }
  ],
  "uncertain_segments": ["text segments needing human review"]
}
```

## Data Validation Prompts

### 4. Clinical Data Validation

```
SYSTEM: You are a clinical data validation expert. Validate data against clinical trial protocols and identify potential issues.

USER: Validate the following EDC data entry:

Data:
{edc_data}

Validation Rules:
{validation_rules}

Study Protocol Context:
{protocol_context}

Check for:
1. Data type consistency
2. Range validation (vital signs, lab values)
3. Logical consistency (e.g., end date before start date)
4. Required fields completion
5. Format compliance (dates, IDs, etc.)
6. Medical plausibility (e.g., impossible vital signs)
7. Cross-field validation

Respond in JSON format:
{
  "validation_result": "PASS|FAIL|WARNING",
  "errors": [
    {
      "field": "field_name",
      "severity": "ERROR|WARNING|INFO",
      "message": "description of issue",
      "suggested_value": "if applicable",
      "rule_violated": "which validation rule"
    }
  ],
  "overall_confidence": 0.0-1.0,
  "recommendation": "ACCEPT|REVIEW|REJECT"
}
```

### 5. Anomaly Detection

```
SYSTEM: You are an expert at detecting anomalies and inconsistencies in clinical trial data.

USER: Review this patient's data for anomalies:

Current Data Entry:
{current_entry}

Historical Patient Data:
{patient_history}

Population Statistics:
{population_stats}

Look for:
1. Sudden changes in vital signs
2. Inconsistent patterns
3. Statistical outliers
4. Impossible or implausible values
5. Data entry errors (copy-paste, typos)
6. Missing expected follow-up data
7. Protocol deviations

Respond in JSON format:
{
  "anomalies_detected": [
    {
      "field": "field_name",
      "type": "outlier|inconsistency|pattern_break|implausible",
      "severity": "HIGH|MEDIUM|LOW",
      "description": "what's unusual",
      "evidence": "supporting data",
      "recommendation": "suggested action"
    }
  ],
  "risk_level": "HIGH|MEDIUM|LOW",
  "requires_immediate_review": true/false
}
```

## Review & Triage Prompts

### 6. Review Priority Scoring

```
SYSTEM: You are an expert at triaging clinical research documents and data for review priority.

USER: Assign a priority score to this item:

Item Type: {item_type}
Data: {item_data}
AI Confidence: {ai_confidence}
Document Type: {document_type}
Study Phase: {study_phase}

Prioritization Factors:
1. Patient safety impact (highest priority)
2. Regulatory compliance risk
3. AI confidence level (low confidence = higher priority)
4. Data completeness and quality
5. Time sensitivity
6. Protocol significance

Respond in JSON format:
{
  "priority_score": 1-100,
  "priority_level": "CRITICAL|HIGH|MEDIUM|LOW",
  "reasoning": "why this priority",
  "recommended_reviewer_role": "who should review",
  "suggested_sla": "time in hours",
  "safety_flag": true/false
}
```

### 7. Intelligent Routing

```
SYSTEM: You are an expert at routing clinical research items to appropriate reviewers.

USER: Determine the best reviewer(s) for this item:

Item Details:
{item_details}

Available Reviewers:
{reviewer_list_with_specialties}

Consider:
1. Expertise match
2. Current workload
3. Language proficiency
4. Site/study familiarity
5. Previous experience with similar items
6. Availability and timezone

Respond in JSON format:
{
  "primary_reviewer": {
    "reviewer_id": "ID",
    "name": "Name",
    "match_score": 0.0-1.0,
    "reasoning": "why this reviewer"
  },
  "backup_reviewers": [
    {
      "reviewer_id": "ID",
      "name": "Name",
      "match_score": 0.0-1.0
    }
  ],
  "escalation_required": true/false,
  "estimated_review_time": "time in minutes"
}
```

## EDC Automation Prompts

### 8. Form Field Mapping

```
SYSTEM: You are an expert at mapping extracted document data to EDC form fields.

USER: Map the extracted data to the EDC form template:

Extracted Data:
{extracted_data}

EDC Form Template:
{form_template}

Instructions:
1. Match extracted fields to form fields
2. Transform data formats as needed
3. Handle unit conversions
4. Flag uncertain mappings
5. Identify missing required fields

Respond in JSON format:
{
  "field_mappings": {
    "edc_field_id": {
      "source_field": "extracted field name",
      "value": "mapped value",
      "confidence": 0.0-1.0,
      "transformation_applied": "description if any",
      "requires_review": true/false
    }
  },
  "unmapped_edc_fields": ["required fields with no data"],
  "unused_extracted_data": ["extracted data not mapped"],
  "mapping_confidence": 0.0-1.0
}
```

### 9. Auto-fill Suggestion

```
SYSTEM: You are an expert at suggesting EDC form auto-fills based on historical data and context.

USER: Suggest values for incomplete EDC fields:

Current Form Data:
{current_form_data}

Patient Historical Data:
{patient_history}

Study Protocol Defaults:
{protocol_defaults}

Rules:
1. Suggest only high-confidence values
2. Use historical patterns when appropriate
3. Follow protocol defaults
4. Never guess safety-critical fields
5. Explain reasoning for suggestions

Respond in JSON format:
{
  "suggestions": {
    "field_id": {
      "suggested_value": "value",
      "confidence": 0.0-1.0,
      "reasoning": "why this value",
      "source": "history|protocol|inference",
      "should_auto_fill": true/false
    }
  },
  "auto_fill_ready": true/false,
  "requires_human_input": ["list of fields needing manual entry"]
}
```

## Quality Control Prompts

### 10. Consistency Check

```
SYSTEM: You are an expert at checking consistency across multiple clinical data entries.

USER: Check consistency across these related data entries:

Current Entry:
{current_entry}

Related Entries:
{related_entries}

Cross-references to check:
1. Patient demographics consistency
2. Timeline logic (dates in sequence)
3. Medication records alignment
4. Adverse event correlations
5. Lab value trends
6. Protocol compliance

Respond in JSON format:
{
  "consistency_issues": [
    {
      "type": "inconsistency type",
      "severity": "HIGH|MEDIUM|LOW",
      "description": "what's inconsistent",
      "affected_entries": ["entry IDs"],
      "suggested_resolution": "how to fix"
    }
  ],
  "overall_consistency_score": 0.0-1.0,
  "requires_reconciliation": true/false
}
```

### 11. Completeness Assessment

```
SYSTEM: You are an expert at assessing clinical data completeness.

USER: Assess the completeness of this data submission:

Submitted Data:
{submitted_data}

Required Fields per Protocol:
{protocol_requirements}

Study Phase: {study_phase}
Visit Type: {visit_type}

Check for:
1. All required fields present
2. Appropriate level of detail
3. Supporting documentation
4. Follow-up items addressed
5. Query responses complete

Respond in JSON format:
{
  "completeness_score": 0.0-1.0,
  "missing_required_fields": ["list of fields"],
  "missing_documentation": ["list of docs"],
  "open_queries": ["query IDs"],
  "recommendations": ["what's needed to complete"],
  "can_submit": true/false,
  "blockers": ["items preventing submission"]
}
```

## Feedback & Learning Prompts

### 12. Feedback Integration

```
SYSTEM: You are analyzing human feedback to improve AI predictions.

USER: Analyze this correction feedback:

AI Prediction:
{ai_prediction}

Human Correction:
{human_correction}

Feedback Reason:
{feedback_reason}

Context:
{context}

Analyze:
1. Why did the AI make this error?
2. What pattern was missed?
3. How can this inform future predictions?
4. What additional training data is needed?

Respond in JSON format:
{
  "error_analysis": {
    "error_type": "classification",
    "root_cause": "description",
    "ai_confidence_was": 0.0-1.0,
    "should_have_been": 0.0-1.0
  },
  "learning_insights": ["key takeaways"],
  "pattern_identified": "pattern description",
  "training_data_gap": "what's missing",
  "recommendation": "how to prevent similar errors"
}
```

## Prompt Engineering Best Practices

### General Guidelines

1. **Be Specific**: Clearly define the task and expected output format
2. **Provide Context**: Include relevant background information
3. **Use Examples**: Few-shot learning improves accuracy
4. **Request Confidence**: Always ask for confidence scores
5. **Enable Uncertainty**: Allow AI to express uncertainty
6. **Structure Output**: Use JSON for consistent parsing
7. **Safety First**: Never allow AI to make final decisions on safety-critical items

### Prompt Templates Variables

Replace these placeholders with actual data:
- `{document_text}`: Full text of the document
- `{document_type}`: Type of document
- `{edc_data}`: EDC form data
- `{validation_rules}`: Validation rule set
- `{protocol_context}`: Study protocol information
- `{patient_history}`: Historical patient data
- `{item_data}`: Data item to be reviewed
- `{form_template}`: EDC form structure
- `{ai_confidence}`: AI confidence score

### Response Format Standards

All AI responses should include:
```json
{
  "result": "primary result",
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "requires_human_review": true/false,
  "alternative_interpretations": [],
  "metadata": {
    "model": "model_name",
    "timestamp": "ISO-8601",
    "processing_time_ms": 0
  }
}
```

## Testing AI Prompts

### Validation Checklist

- [ ] Test with various document types
- [ ] Verify confidence scores are calibrated
- [ ] Check edge cases and unusual inputs
- [ ] Validate JSON output format
- [ ] Test with intentionally ambiguous data
- [ ] Verify safety guardrails work
- [ ] Check for bias in predictions
- [ ] Test multilingual support (if applicable)
- [ ] Validate against gold-standard dataset
- [ ] Measure response time and token usage

### Performance Metrics

Track these metrics for each prompt:
- Accuracy (vs. human expert)
- Precision and Recall
- F1 Score
- Confidence calibration (reliability diagrams)
- False positive/negative rates
- Processing time
- Cost (token usage)
- Human agreement rate

## Model Selection Guidelines

### Task-Specific Recommendations

| Task | Recommended Model | Reasoning |
|------|------------------|-----------|
| Document Classification | GPT-4, Claude 3 | High accuracy needed |
| Data Extraction | GPT-4, Claude 3 Opus | Complex structured data |
| OCR Correction | GPT-3.5, Claude 3 Sonnet | Cost-effective, fast |
| Validation | GPT-4, Local models | Rule-based + AI hybrid |
| Anomaly Detection | GPT-4, Statistical models | Pattern recognition |
| Priority Scoring | GPT-3.5, Claude 3 Sonnet | Fast, good enough |
| Field Mapping | GPT-4 | Semantic understanding |

### Cost Optimization

1. Use smaller models for simple tasks
2. Cache common prompts and responses
3. Batch process when possible
4. Use streaming for long outputs
5. Implement retry logic with exponential backoff
6. Monitor and optimize token usage

## Security & Privacy

### PHI Protection

- NEVER include actual PHI in logs or debugging
- Use synthetic data for testing
- Implement data masking in prompts
- Use on-premise models for sensitive data
- Ensure API calls are encrypted
- Follow data retention policies

### Prompt Injection Prevention

```python
# Sanitize user inputs before including in prompts
def sanitize_input(user_input: str) -> str:
    # Remove prompt injection attempts
    # Validate input format
    # Truncate to maximum length
    # Escape special characters
    return sanitized_input
```

---

**Last Updated**: January 1, 2026
**Version**: 1.0
