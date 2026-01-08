import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Label } from "./ui/label";
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, MessageSquare } from "lucide-react";
import { mockAPI, mockDocuments } from "../mockData";
import { Review, ReviewStatus, Document } from "../types";
import { toast } from "sonner";

export function ReviewQueue() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [relatedDocument, setRelatedDocument] = useState<Document | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const data = await mockAPI.getReviews();
    setReviews(data);
    setLoading(false);
  };

  const openReview = async (review: Review) => {
    setSelectedReview(review);
    
    // Load related document if available
    if (review.document_id) {
      const doc = await mockAPI.getDocument(review.document_id);
      if (doc) {
        setRelatedDocument(doc);
      }
    }
    
    setShowReviewDialog(true);
    setReviewNotes("");
    setRejectReason("");
  };

  const handleApprove = async () => {
    if (!selectedReview) return;
    
    try {
      await mockAPI.approveReview(selectedReview.id, reviewNotes);
      toast.success("Review approved");
      
      // Update local state
      setReviews(reviews.map(r => 
        r.id === selectedReview.id 
          ? { ...r, status: ReviewStatus.APPROVED, reviewer_notes: reviewNotes }
          : r
      ));
      
      setShowReviewDialog(false);
    } catch (error) {
      toast.error("Failed to approve review");
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      await mockAPI.rejectReview(selectedReview.id, rejectReason);
      toast.success("Review rejected");
      
      // Update local state
      setReviews(reviews.map(r => 
        r.id === selectedReview.id 
          ? { ...r, status: ReviewStatus.REJECTED, decision_reason: rejectReason }
          : r
      ));
      
      setShowReviewDialog(false);
    } catch (error) {
      toast.error("Failed to reject review");
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case ReviewStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case ReviewStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case ReviewStatus.PENDING:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingReviews = reviews.filter(r => r.status === ReviewStatus.PENDING || r.status === ReviewStatus.IN_PROGRESS);
  const completedReviews = reviews.filter(r => r.status === ReviewStatus.APPROVED || r.status === ReviewStatus.REJECTED);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2>Review Queue</h2>
        <p className="text-gray-600">Human-in-the-loop validation for AI-processed items</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{pendingReviews.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {reviews.filter(r => r.priority_level === "CRITICAL" && r.status === ReviewStatus.PENDING).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {reviews.filter(r => r.priority_level === "HIGH" && r.status === ReviewStatus.PENDING).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{completedReviews.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Items requiring human validation, sorted by priority</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : pendingReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All reviews completed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews
                .sort((a, b) => b.priority_score - a.priority_score)
                .map((review) => {
                  const doc = mockDocuments.find(d => d.id === review.document_id);
                  
                  return (
                    <Card
                      key={review.id}
                      className={`border-l-4 ${getPriorityColor(review.priority_level)} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => openReview(review)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getPriorityColor(review.priority_level)}>
                                {review.priority_level}
                              </Badge>
                              <Badge className={getStatusColor(review.status)}>
                                {review.status}
                              </Badge>
                              {review.ai_confidence && (
                                <Badge variant="outline">
                                  AI: {(review.ai_confidence * 100).toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                            
                            <p>
                              {review.review_type === "document" && doc
                                ? `Document: ${doc.filename}`
                                : `${review.review_type} Review #${review.id}`}
                            </p>
                            
                            {review.ai_suggestions && (
                              <div className="mt-2 text-sm text-gray-600">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {review.ai_suggestions.concerns?.[0] || "Requires human review"}
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-500 mt-2">
                              Created: {new Date(review.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Item</DialogTitle>
            <DialogDescription>
              Validate AI-processed data and make a decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              {/* Priority and Status */}
              <div className="flex space-x-2">
                <Badge className={getPriorityColor(selectedReview.priority_level)}>
                  {selectedReview.priority_level} PRIORITY
                </Badge>
                <Badge variant="outline">
                  Priority Score: {selectedReview.priority_score}/100
                </Badge>
                {selectedReview.ai_confidence && (
                  <Badge variant="outline">
                    AI Confidence: {(selectedReview.ai_confidence * 100).toFixed(1)}%
                  </Badge>
                )}
              </div>

              {/* AI Suggestions */}
              {selectedReview.ai_suggestions && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p>AI Recommendation: {selectedReview.ai_suggestions.recommendation}</p>
                    {selectedReview.ai_suggestions.concerns && (
                      <ul className="list-disc list-inside mt-2">
                        {selectedReview.ai_suggestions.concerns.map((concern: string, idx: number) => (
                          <li key={idx}>{concern}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Related Document */}
              {relatedDocument && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Related Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Filename</p>
                        <p>{relatedDocument.filename}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Document Type</p>
                        <p>{relatedDocument.document_type || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Patient ID</p>
                        <p>{relatedDocument.patient_id || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Study ID</p>
                        <p>{relatedDocument.study_id || "N/A"}</p>
                      </div>
                    </div>

                    {relatedDocument.extracted_data && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Extracted Data</p>
                        <div className="space-y-2">
                          {Object.entries(relatedDocument.extracted_data).map(([key, field]: [string, any]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <p className="text-sm">{key.replace(/_/g, " ")}</p>
                                <p>{field.value}</p>
                              </div>
                              <Badge className={field.confidence >= 0.9 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {(field.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Review Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any comments or observations..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Reject Reason */}
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Rejection Reason (Required for rejection)</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Explain why this item is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
