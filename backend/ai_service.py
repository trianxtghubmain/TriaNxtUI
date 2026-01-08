"""
AI Service Module

This module handles all AI/ML operations including:
- Document text extraction
- Data field extraction
- Validation and anomaly detection
- Classification and routing
"""

import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import openai
from anthropic import Anthropic

from .config import settings

logger = logging.getLogger(__name__)

class AIService:
    """AI Service for clinical research automation"""
    
    def __init__(self):
        """Initialize AI service with API clients"""
        self.openai_client = None
        self.anthropic_client = None
        
        # Initialize clients if API keys are provided
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "YOUR_OPENAI_API_KEY_HERE":
            openai.api_key = settings.OPENAI_API_KEY
            self.openai_client = openai
            
        if settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "YOUR_ANTHROPIC_API_KEY_HERE":
            self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    async def classify_document(self, document_text: str) -> Dict[str, Any]:
        """
        Classify a clinical document into predefined categories
        
        Args:
            document_text: The text content of the document
            
        Returns:
            Classification result with confidence score
        """
        prompt = f"""Analyze the following document and classify it into one of these categories:
- Informed Consent Form
- Lab Report
- Medical Record
- Case Report Form
- Adverse Event Report
- Protocol Document
- Other

Document Text:
{document_text[:2000]}  # Truncate for API limits

Respond in JSON format:
{{
  "document_type": "category name",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "secondary_types": ["alternative classifications if uncertain"]
}}
"""
        
        try:
            result = await self._call_llm(prompt, response_format="json")
            return json.loads(result)
        except Exception as e:
            logger.error(f"Document classification error: {str(e)}")
            return {
                "document_type": "Other",
                "confidence": 0.0,
                "reasoning": f"Classification failed: {str(e)}",
                "secondary_types": []
            }
    
    async def extract_fields(self, document_text: str, document_type: str) -> Dict[str, Any]:
        """
        Extract structured data fields from a document
        
        Args:
            document_text: The text content of the document
            document_type: The type of document
            
        Returns:
            Extracted fields with confidence scores
        """
        prompt = f"""Extract the following fields from this {document_type}:

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
{document_text[:3000]}

Instructions:
1. Extract exact values as they appear
2. If a field is not found, mark as "NOT_FOUND"
3. Include page/section references
4. Flag any ambiguous or unclear values
5. Provide confidence score for each extracted field

Respond in JSON format:
{{
  "extracted_fields": {{
    "field_name": {{
      "value": "extracted value",
      "confidence": 0.0-1.0,
      "location": "page X, section Y",
      "ambiguity_flag": true/false,
      "notes": "any relevant notes"
    }}
  }},
  "overall_confidence": 0.0-1.0,
  "extraction_issues": ["list of any problems encountered"]
}}
"""
        
        try:
            result = await self._call_llm(prompt, response_format="json")
            return json.loads(result)
        except Exception as e:
            logger.error(f"Field extraction error: {str(e)}")
            return {
                "extracted_fields": {},
                "overall_confidence": 0.0,
                "extraction_issues": [str(e)]
            }
    
    async def validate_data(self, data: Dict[str, Any], validation_rules: Dict[str, Any], 
                           protocol_context: Optional[str] = None) -> Dict[str, Any]:
        """
        Validate EDC data entry against rules
        
        Args:
            data: The data to validate
            validation_rules: Validation rules to apply
            protocol_context: Optional study protocol context
            
        Returns:
            Validation results with errors and warnings
        """
        prompt = f"""Validate the following EDC data entry:

Data:
{json.dumps(data, indent=2)}

Validation Rules:
{json.dumps(validation_rules, indent=2)}

{f"Study Protocol Context: {protocol_context}" if protocol_context else ""}

Check for:
1. Data type consistency
2. Range validation (vital signs, lab values)
3. Logical consistency (e.g., end date before start date)
4. Required fields completion
5. Format compliance (dates, IDs, etc.)
6. Medical plausibility (e.g., impossible vital signs)
7. Cross-field validation

Respond in JSON format:
{{
  "validation_result": "PASS|FAIL|WARNING",
  "errors": [
    {{
      "field": "field_name",
      "severity": "ERROR|WARNING|INFO",
      "message": "description of issue",
      "suggested_value": "if applicable",
      "rule_violated": "which validation rule"
    }}
  ],
  "overall_confidence": 0.0-1.0,
  "recommendation": "ACCEPT|REVIEW|REJECT"
}}
"""
        
        try:
            result = await self._call_llm(prompt, response_format="json")
            return json.loads(result)
        except Exception as e:
            logger.error(f"Data validation error: {str(e)}")
            return {
                "validation_result": "FAIL",
                "errors": [{"field": "system", "severity": "ERROR", "message": str(e)}],
                "overall_confidence": 0.0,
                "recommendation": "REVIEW"
            }
    
    async def detect_anomalies(self, current_entry: Dict[str, Any], 
                              patient_history: List[Dict[str, Any]],
                              population_stats: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Detect anomalies in patient data
        
        Args:
            current_entry: Current data entry
            patient_history: Historical patient data
            population_stats: Optional population statistics
            
        Returns:
            Detected anomalies with severity levels
        """
        prompt = f"""Review this patient's data for anomalies:

Current Data Entry:
{json.dumps(current_entry, indent=2)}

Historical Patient Data:
{json.dumps(patient_history[-5:], indent=2) if patient_history else "No history available"}

{f"Population Statistics: {json.dumps(population_stats, indent=2)}" if population_stats else ""}

Look for:
1. Sudden changes in vital signs
2. Inconsistent patterns
3. Statistical outliers
4. Impossible or implausible values
5. Data entry errors (copy-paste, typos)
6. Missing expected follow-up data
7. Protocol deviations

Respond in JSON format:
{{
  "anomalies_detected": [
    {{
      "field": "field_name",
      "type": "outlier|inconsistency|pattern_break|implausible",
      "severity": "HIGH|MEDIUM|LOW",
      "description": "what's unusual",
      "evidence": "supporting data",
      "recommendation": "suggested action"
    }}
  ],
  "risk_level": "HIGH|MEDIUM|LOW",
  "requires_immediate_review": true/false
}}
"""
        
        try:
            result = await self._call_llm(prompt, response_format="json")
            return json.loads(result)
        except Exception as e:
            logger.error(f"Anomaly detection error: {str(e)}")
            return {
                "anomalies_detected": [],
                "risk_level": "MEDIUM",
                "requires_immediate_review": True
            }
    
    async def calculate_priority(self, item_data: Dict[str, Any], 
                                 ai_confidence: float,
                                 item_type: str) -> Dict[str, Any]:
        """
        Calculate review priority for an item
        
        Args:
            item_data: The item to prioritize
            ai_confidence: AI confidence score
            item_type: Type of item
            
        Returns:
            Priority score and routing information
        """
        prompt = f"""Assign a priority score to this item:

Item Type: {item_type}
Data: {json.dumps(item_data, indent=2)}
AI Confidence: {ai_confidence}

Prioritization Factors:
1. Patient safety impact (highest priority)
2. Regulatory compliance risk
3. AI confidence level (low confidence = higher priority)
4. Data completeness and quality
5. Time sensitivity
6. Protocol significance

Respond in JSON format:
{{
  "priority_score": 1-100,
  "priority_level": "CRITICAL|HIGH|MEDIUM|LOW",
  "reasoning": "why this priority",
  "recommended_reviewer_role": "who should review",
  "suggested_sla": "time in hours",
  "safety_flag": true/false
}}
"""
        
        try:
            result = await self._call_llm(prompt, response_format="json")
            return json.loads(result)
        except Exception as e:
            logger.error(f"Priority calculation error: {str(e)}")
            return {
                "priority_score": 50,
                "priority_level": "MEDIUM",
                "reasoning": "Error in AI priority calculation",
                "recommended_reviewer_role": "data_manager",
                "suggested_sla": "24",
                "safety_flag": False
            }
    
    async def map_to_edc_form(self, extracted_data: Dict[str, Any], 
                             form_template: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map extracted data to EDC form fields
        
        Args:
            extracted_data: Extracted document data
            form_template: EDC form template
            
        Returns:
            Field mappings with confidence scores
        """
        prompt = f"""Map the extracted data to the EDC form template:

Extracted Data:
{json.dumps(extracted_data, indent=2)}

EDC Form Template:
{json.dumps(form_template, indent=2)}

Instructions:
1. Match extracted fields to form fields
2. Transform data formats as needed
3. Handle unit conversions
4. Flag uncertain mappings
5. Identify missing required fields

Respond in JSON format:
{{
  "field_mappings": {{
    "edc_field_id": {{
      "source_field": "extracted field name",
      "value": "mapped value",
      "confidence": 0.0-1.0,
      "transformation_applied": "description if any",
      "requires_review": true/false
    }}
  }},
  "unmapped_edc_fields": ["required fields with no data"],
  "unused_extracted_data": ["extracted data not mapped"],
  "mapping_confidence": 0.0-1.0
}}
"""
        
        try:
            result = await self._call_llm(prompt, response_format="json")
            return json.loads(result)
        except Exception as e:
            logger.error(f"EDC mapping error: {str(e)}")
            return {
                "field_mappings": {},
                "unmapped_edc_fields": [],
                "unused_extracted_data": [],
                "mapping_confidence": 0.0
            }
    
    async def _call_llm(self, prompt: str, response_format: str = "text") -> str:
        """
        Call the configured LLM with the given prompt
        
        Args:
            prompt: The prompt to send
            response_format: Expected response format
            
        Returns:
            LLM response
        """
        if not settings.ENABLE_AI_PROCESSING:
            raise Exception("AI processing is disabled")
        
        # Try OpenAI first
        if self.openai_client:
            try:
                response = await self.openai_client.ChatCompletion.acreate(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an expert clinical research AI assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=settings.AI_TEMPERATURE,
                    max_tokens=settings.AI_MAX_TOKENS,
                    timeout=settings.AI_TIMEOUT
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"OpenAI API error: {str(e)}")
        
        # Try Anthropic as fallback
        if self.anthropic_client:
            try:
                response = await self.anthropic_client.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=settings.AI_MAX_TOKENS,
                    temperature=settings.AI_TEMPERATURE,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text
            except Exception as e:
                logger.error(f"Anthropic API error: {str(e)}")
        
        # Return mock response if no API available (for development)
        logger.warning("No AI API available, returning mock response")
        return self._mock_response(response_format)
    
    def _mock_response(self, response_format: str) -> str:
        """Generate mock response for development"""
        if response_format == "json":
            return json.dumps({
                "result": "mock_result",
                "confidence": 0.85,
                "reasoning": "This is a mock response for development",
                "requires_human_review": True
            })
        return "This is a mock AI response for development purposes."

# Singleton instance
ai_service = AIService()
