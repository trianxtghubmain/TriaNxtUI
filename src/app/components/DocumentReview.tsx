import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from "lucide-react";
import { mockAPI } from "../mockData";
import { Document, DocumentStatus } from "../types";
import { toast } from "sonner";

export function DocumentReview() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [studyId, setStudyId] = useState("");
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const { documents } = await mockAPI.getDocuments();
    setDocuments(documents);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      const newDoc = await mockAPI.uploadDocument(file, studyId, patientId);
      toast.success("Document uploaded successfully");
      setDocuments([newDoc, ...documents]);
      setShowUpload(false);
      setFile(null);
      setStudyId("");
      setPatientId("");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const viewDocument = async (doc: Document) => {
    const fullDoc = await mockAPI.getDocument(doc.id);
    if (fullDoc) {
      setSelectedDocument(fullDoc);
      setShowDetails(true);
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case DocumentStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case DocumentStatus.PROCESSING:
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case DocumentStatus.REVIEW_PENDING:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case DocumentStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case DocumentStatus.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case DocumentStatus.REVIEW_PENDING:
        return "bg-orange-100 text-orange-800";
      case DocumentStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-500";
    if (confidence >= 0.95) return "text-green-600";
    if (confidence >= 0.80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Document Review</h2>
          <p className="text-gray-600">Upload and review clinical research documents</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>All uploaded documents and their processing status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Study ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>AI Confidence</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{doc.filename}</TableCell>
                    <TableCell>{doc.document_type || "Unknown"}</TableCell>
                    <TableCell>{doc.study_id || "-"}</TableCell>
                    <TableCell>{doc.patient_id || "-"}</TableCell>
                    <TableCell>
                      {doc.ai_confidence ? (
                        <span className={getConfidenceColor(doc.ai_confidence)}>
                          {(doc.ai_confidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDocument(doc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a clinical research document for AI processing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted: PDF, PNG, JPG, TIFF (Max 50MB)
              </p>
            </div>
            <div>
              <Label htmlFor="studyId">Study ID (Optional)</Label>
              <Input
                id="studyId"
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
                placeholder="STUDY-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="patientId">Patient ID (Optional)</Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="P001"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>{selectedDocument?.filename}</DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Document Type</p>
                  <p>{selectedDocument.document_type || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {selectedDocument.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">AI Confidence</p>
                  <p className={getConfidenceColor(selectedDocument.ai_confidence)}>
                    {selectedDocument.ai_confidence
                      ? `${(selectedDocument.ai_confidence * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p>{(selectedDocument.file_size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              {selectedDocument.extracted_data && (
                <div>
                  <h3 className="mb-2">Extracted Data</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {Object.entries(selectedDocument.extracted_data).map(([key, field]: [string, any]) => (
                          <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{key.replace(/_/g, " ")}</p>
                              <p className="text-gray-600">{field.value}</p>
                            </div>
                            <Badge className={field.confidence >= 0.9 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {(field.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
