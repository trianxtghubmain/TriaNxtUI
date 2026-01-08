import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { FileText, Plus, Save, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { mockAPI, mockDocuments } from "../mockData";
import { EDCForm, EDCEntry, FormField, ValidationError } from "../types";
import { toast } from "sonner";

export function EDCAutomation() {
  const [forms, setForms] = useState<EDCForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<EDCForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validation, setValidation] = useState<ValidationError[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    const data = await mockAPI.getForms();
    setForms(data);
    setLoading(false);
  };

  const handleFormSelect = async (formId: string) => {
    const form = forms.find(f => f.id === parseInt(formId));
    if (form) {
      setSelectedForm(form);
      setFormData({});
      setValidation([]);
      setShowNewEntry(true);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  const autoFillFromDocument = () => {
    // Simulate AI auto-fill from a processed document
    const mockExtractedData = mockDocuments[1]?.extracted_data;
    if (mockExtractedData && selectedForm) {
      const suggestions: Record<string, any> = {};
      
      // Map extracted data to form fields
      selectedForm.form_schema.forEach(field => {
        const extracted = Object.entries(mockExtractedData).find(
          ([key]) => key.toLowerCase().includes(field.id.toLowerCase()) ||
                     field.label.toLowerCase().includes(key.toLowerCase())
        );
        
        if (extracted) {
          const [, fieldData]: [string, any] = extracted;
          suggestions[field.id] = {
            value: fieldData.value,
            confidence: fieldData.confidence
          };
        }
      });
      
      setAiSuggestions(suggestions);
      
      // Auto-fill high confidence values
      const highConfidenceData: Record<string, any> = {};
      Object.entries(suggestions).forEach(([fieldId, data]) => {
        if (data.confidence >= 0.9) {
          highConfidenceData[fieldId] = data.value;
        }
      });
      
      setFormData({ ...formData, ...highConfidenceData });
      toast.success("Auto-filled high confidence fields");
    }
  };

  const validateForm = () => {
    if (!selectedForm) return;
    
    const errors: ValidationError[] = [];
    
    // Check required fields
    selectedForm.form_schema.forEach(field => {
      if (field.required && !formData[field.id]) {
        errors.push({
          field: field.id,
          severity: "ERROR",
          message: `${field.label} is required`
        });
      }
      
      // Check validation rules
      if (field.validation && formData[field.id]) {
        const value = parseFloat(formData[field.id]);
        if (field.validation.min !== undefined && value < field.validation.min) {
          errors.push({
            field: field.id,
            severity: "ERROR",
            message: field.validation.message || `Value must be at least ${field.validation.min}`
          });
        }
        if (field.validation.max !== undefined && value > field.validation.max) {
          errors.push({
            field: field.id,
            severity: "ERROR",
            message: field.validation.message || `Value must be at most ${field.validation.max}`
          });
        }
      }
    });
    
    // Cross-field validation
    if (selectedForm.validation_rules?.cross_field) {
      selectedForm.validation_rules.cross_field.forEach((rule: any) => {
        if (rule.rule === "systolic_bp > diastolic_bp") {
          if (formData.systolic_bp && formData.diastolic_bp &&
              parseFloat(formData.systolic_bp) <= parseFloat(formData.diastolic_bp)) {
            errors.push({
              field: "systolic_bp",
              severity: "ERROR",
              message: rule.message
            });
          }
        }
      });
    }
    
    setValidation(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedForm) return;
    
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }
    
    try {
      await mockAPI.createEDCEntry(selectedForm.id, {
        ...formData,
        patient_id: formData.patient_id || "P001"
      });
      toast.success("EDC entry created successfully");
      setShowNewEntry(false);
      setFormData({});
      setValidation([]);
      setAiSuggestions({});
    } catch (error) {
      toast.error("Failed to create entry");
    }
  };

  const renderField = (field: FormField) => {
    const hasError = validation.some(v => v.field === field.id);
    const suggestion = aiSuggestions[field.id];
    
    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.id}>
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>
          {suggestion && (
            <Badge className={suggestion.confidence >= 0.9 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              <Sparkles className="h-3 w-3 mr-1" />
              AI: {(suggestion.confidence * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        
        {field.type === "select" ? (
          <Select value={formData[field.id]} onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "textarea" ? (
          <textarea
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`w-full p-2 border rounded ${hasError ? "border-red-500" : ""}`}
            rows={3}
          />
        ) : (
          <Input
            id={field.id}
            type={field.type}
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? "border-red-500" : ""}
          />
        )}
        
        {suggestion && !formData[field.id] && suggestion.confidence < 0.9 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFieldChange(field.id, suggestion.value)}
          >
            Use AI suggestion: {suggestion.value}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>EDC Automation</h2>
          <p className="text-gray-600">Electronic Data Capture with AI assistance</p>
        </div>
        <Select onValueChange={handleFormSelect}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select form to create entry..." />
          </SelectTrigger>
          <SelectContent>
            {forms.map(form => (
              <SelectItem key={form.id} value={form.id.toString()}>
                {form.form_name} (v{form.form_version})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Forms</CardTitle>
            <CardDescription>Select a form to begin data entry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forms.map(form => (
                <Card
                  key={form.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleFormSelect(form.id.toString())}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p>{form.form_name}</p>
                        <p className="text-sm text-gray-600">
                          Version {form.form_version} • {form.form_schema.length} fields
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Study: {form.study_id}
                        </p>
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Automation Features</CardTitle>
            <CardDescription>How AI assists with data entry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p>Auto-fill from Documents</p>
                  <p className="text-sm text-gray-600">
                    Automatically populate fields from processed documents with high confidence
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p>Smart Suggestions</p>
                  <p className="text-sm text-gray-600">
                    AI suggests values based on document extraction and historical data
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p>Real-time Validation</p>
                  <p className="text-sm text-gray-600">
                    Validate data against protocol rules and detect anomalies
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p>Confidence Scoring</p>
                  <p className="text-sm text-gray-600">
                    Each suggestion includes a confidence score for transparency
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All AI suggestions require human review before final submission
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Entry Dialog */}
      <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedForm?.form_name} - New Entry
            </DialogTitle>
            <DialogDescription>
              Fill in the form fields. AI suggestions are shown where available.
            </DialogDescription>
          </DialogHeader>
          
          {selectedForm && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <p className="text-sm">
                  {Object.keys(aiSuggestions).length > 0
                    ? `${Object.keys(aiSuggestions).length} AI suggestions available`
                    : "No AI suggestions loaded"}
                </p>
                <Button variant="outline" size="sm" onClick={autoFillFromDocument}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Load AI Suggestions
                </Button>
              </div>

              {validation.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p>Please fix the following errors:</p>
                    <ul className="list-disc list-inside mt-2">
                      {validation.map((error, idx) => (
                        <li key={idx}>{error.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedForm.form_schema.map(field => renderField(field))}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={validateForm}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Validate
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
