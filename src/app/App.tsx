import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Dashboard } from "./components/Dashboard";
import { DocumentReview } from "./components/DocumentReview";
import { EDCAutomation } from "./components/EDCAutomation";
import { ReviewQueue } from "./components/ReviewQueue";
import { AuditTrail } from "./components/AuditTrail";
import { AccountCreation } from "./components/AccountCreation";
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  CheckSquare, 
  ScrollText, 
  Settings,
  Activity,
  AlertCircle,
  LogOut,
  User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";

type View = "dashboard" | "documents" | "edc" | "reviews" | "audit" | "about";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null);

  // Simulate invitation token from URL (in real app, parse from URL params)
  const invitationToken = "demo-invitation-token";

  const handleAccountCreated = (userData: { username: string; email: string }) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView("dashboard");
  };

  // If not authenticated, show account creation
  if (!isAuthenticated) {
    return (
      <>
        <AccountCreation
          onAccountCreated={handleAccountCreated}
          invitationToken={invitationToken}
          studyName="Additional eCourse Training"
          invitedBy="Dr. Sarah Johnson"
        />
        <Toaster />
      </>
    );
  }

  const menuItems = [
    { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
    { id: "documents" as View, label: "Document Review", icon: FileText },
    { id: "edc" as View, label: "EDC Automation", icon: ClipboardList },
    { id: "reviews" as View, label: "Review Queue", icon: CheckSquare },
    { id: "audit" as View, label: "Audit Trail", icon: ScrollText },
    { id: "about" as View, label: "About", icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "documents":
        return <DocumentReview />;
      case "edc":
        return <EDCAutomation />;
      case "reviews":
        return <ReviewQueue />;
      case "audit":
        return <AuditTrail />;
      case "about":
        return <AboutView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg">Clinical Research</h1>
              <p className="text-xs text-gray-500">AI-Assisted System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{currentUser.username}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>

          <div className="text-xs text-gray-500">
            <p>Version 1.0.0</p>
            <p className="mt-1">Demo Mode</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>

      <Toaster />
    </div>
  );
}

function AboutView() {
  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h2>AI-Assisted Clinical Research System</h2>
        <p className="text-gray-600">Complete platform for clinical trial document management and data capture</p>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <p><strong>Demo Environment:</strong> This is a demonstration system with mock data. Not for production use with real patient data.</p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>This system demonstrates AI-assisted workflows for clinical research:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Automated document processing and data extraction</li>
              <li>Electronic Data Capture (EDC) with AI suggestions</li>
              <li>Human-in-the-loop review and validation</li>
              <li>Comprehensive audit trail for compliance</li>
              <li>Real-time analytics and monitoring</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p>Document Review</p>
                <p className="text-sm text-gray-600">OCR, classification, and data extraction</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ClipboardList className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p>EDC Automation</p>
                <p className="text-sm text-gray-600">AI-powered form auto-fill and validation</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckSquare className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p>Review Queue</p>
                <p className="text-sm text-gray-600">Priority-based human validation</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ScrollText className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p>Audit Trail</p>
                <p className="text-sm text-gray-600">21 CFR Part 11 compliant logging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="mb-2">Frontend</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• React.js 18.3</p>
                <p>• TypeScript</p>
                <p>• Tailwind CSS 4.0</p>
                <p>• Radix UI Components</p>
                <p>• Recharts for Analytics</p>
              </div>
            </div>
            <div>
              <p className="mb-2">Backend</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Python 3.11+</p>
                <p>• FastAPI Framework</p>
                <p>• PostgreSQL Database</p>
                <p>• Redis Caching</p>
                <p>• OpenAI/Anthropic AI APIs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <Badge className="bg-green-100 text-green-800">21 CFR Part 11</Badge>
            <p className="text-gray-600">Electronic records and signatures compliance</p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge className="bg-blue-100 text-blue-800">HIPAA</Badge>
            <p className="text-gray-600">Privacy and security considerations</p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge className="bg-purple-100 text-purple-800">GDPR</Badge>
            <p className="text-gray-600">Data protection compliance</p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge className="bg-orange-100 text-orange-800">ICH GCP</Badge>
            <p className="text-gray-600">Good Clinical Practice guidelines</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>📄 <strong>ARCHITECTURE.md</strong> - System architecture and design</p>
          <p>📄 <strong>COMPLIANCE.md</strong> - Compliance and safety guidelines</p>
          <p>📄 <strong>AI_PROMPTS.md</strong> - AI prompt templates and best practices</p>
          <p>📄 <strong>backend/README.md</strong> - Backend setup and API documentation</p>
        </CardContent>
      </Card>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800 space-y-2">
          <p><strong>Getting Started:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Review the system architecture in ARCHITECTURE.md</li>
            <li>Read compliance requirements in COMPLIANCE.md</li>
            <li>Set up the backend following backend/README.md</li>
            <li>Configure AI API keys in backend .env file</li>
            <li>Run frontend: npm run dev</li>
            <li>Run backend: uvicorn main:app --reload</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p><strong>Important Disclaimer:</strong></p>
              <p className="mt-2">
                This is a reference implementation for training, demonstration, and educational purposes.
                It is NOT validated for production use in clinical trials. Before deploying in a regulated
                environment, ensure proper validation, security review, and regulatory compliance assessment.
              </p>
              <p className="mt-2">
                This system is not intended for collecting PII or securing sensitive patient data without
                appropriate safeguards and validation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}