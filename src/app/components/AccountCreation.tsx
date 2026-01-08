import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  UserCircle2,
  LogIn
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AccountCreationProps {
  onAccountCreated: (userData: { username: string; email: string }) => void;
  invitationToken?: string;
  studyName?: string;
  invitedBy?: string;
}

type ViewState = "signup" | "login" | "signup-success";

export function AccountCreation({ 
  onAccountCreated, 
  invitationToken,
  studyName = "Additional eCourse Training",
  invitedBy = "Site Administrator"
}: AccountCreationProps) {
  const [view, setView] = useState<ViewState>(invitationToken ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const maxLoginAttempts = 5;

  // Auto-generate username from first and last name
  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const firstLetter = formData.firstName.charAt(0).toLowerCase();
      const lastName = formData.lastName.toLowerCase().replace(/[^a-z]/g, "");
      const randomSuffix = Math.floor(Math.random() * 1000);
      const generatedUsername = `${firstLetter}${lastName}${randomSuffix}`;
      setFormData((prev) => ({ ...prev, username: generatedUsername }));
    }
  }, [formData.firstName, formData.lastName]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (view === "signup") {
      // First Name - letters only
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name must contain letters only";
      }

      // Last Name - letters only
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name must contain letters only";
      }

      // Email
      if (!formData.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      // Password validation
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
        newErrors.password = "Password must include uppercase, lowercase, number, and special character";
      }

      // Confirm Password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Role
      if (!formData.role) {
        newErrors.role = "Please select your role";
      }

      // Privacy Policy
      if (!acceptedPrivacy) {
        newErrors.privacy = "You must agree to the Privacy Policy";
      }
    } else {
      // Login validation
      if (!formData.username.trim()) {
        newErrors.username = "Username or email is required";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
      
      if (loginAttempts >= maxLoginAttempts) {
        newErrors.general = "Too many login attempts. Please try again later or contact support.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      if (view === "signup") {
        setRegisteredEmail(formData.email);
        setView("signup-success");
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        // Login successful
        const storedEmail = registeredEmail || formData.email;
        onAccountCreated({
          username: formData.username,
          email: storedEmail,
        });
      }
    }, 1500);
  };

  // Signup Success Screen
  if (view === "signup-success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-teal-600 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Account Created Successfully!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your TRIA Global account has been created and is ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <p className="mb-2">
                    <strong>Verification Email Sent</strong>
                  </p>
                  <p className="text-sm">
                    A verification email has been sent to <strong>{registeredEmail}</strong>. 
                    Please check your inbox and verify your email address.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Account registration complete</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Assigned to study: <strong>{studyName}</strong></p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Security settings configured</p>
                  </div>
                </div>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <p className="text-sm">
                    <strong>For security purposes</strong>, please log in with your new credentials 
                    to activate your account and access the system.
                  </p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  setView("login");
                  setFormData((prev) => ({ ...prev, username: "", password: "" }));
                }}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700"
              >
                Proceed to Login
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Login Screen
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
                <LogIn className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your TRIA Global account</p>
          </div>

          {/* Login Attempts Warning */}
          {loginAttempts > 2 && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <p className="text-sm">
                  <strong>Warning:</strong> {maxLoginAttempts - loginAttempts} login attempts remaining.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* General Error */}
                {errors.general && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Username or Email */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username or email"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={errors.username ? "border-red-500" : ""}
                    autoComplete="username"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-teal-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-teal-600 hover:bg-teal-700"
                  disabled={isSubmitting || loginAttempts >= maxLoginAttempts}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Login
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center text-sm text-gray-600 pt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setView("signup")}
                    className="text-teal-600 hover:underline"
                  >
                    Request Access
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Signup Screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">TRIA Global – Access Request</h1>
          <p className="text-gray-600">Create your account to access the clinical data platform</p>
        </div>

        {/* Invitation Alert */}
        {invitationToken && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="text-sm">
                <strong>{invitedBy}</strong> has invited you to join <strong>{studyName}</strong>
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: User Information */}
              <div className="space-y-5">
                <h2 className="text-xl pb-2 border-b">Section 1: User Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name (letters only)"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter last name (letters only)"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={errors.lastName ? "border-red-500" : ""}
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email ID */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Section 2: Account Details */}
              <div className="space-y-5">
                <h2 className="text-xl pb-2 border-b">Section 2: Account Details</h2>

                {/* Auto-generated Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Auto-generated)</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      readOnly
                      className="bg-gray-50 pl-10"
                    />
                    <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Format: First letter of first name + last name + numeric suffix
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Retype Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Retype Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Role & Study Details */}
              <div className="space-y-5">
                <h2 className="text-xl pb-2 border-b">Section 3: Role & Study Details</h2>

                {/* Role Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinical-research-coordinator">Clinical Research Coordinator</SelectItem>
                      <SelectItem value="principal-investigator">Principal Investigator</SelectItem>
                      <SelectItem value="study-coordinator">Study Coordinator</SelectItem>
                      <SelectItem value="data-manager">Data Manager</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="site-staff">Site Staff</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>

              {/* Section 4: Privacy & Confirmation */}
              <div className="space-y-5">
                <h2 className="text-xl pb-2 border-b">Section 4: Privacy & Confirmation</h2>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={acceptedPrivacy}
                      onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                      className={errors.privacy ? "border-red-500" : "mt-1"}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="privacy" className="cursor-pointer text-sm leading-relaxed">
                        I agree to the{" "}
                        <a href="#" className="text-teal-600 hover:underline">
                          Privacy Policy
                        </a>{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {errors.privacy && (
                        <p className="text-sm text-red-600">{errors.privacy}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-4 pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 bg-teal-600 hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign Up
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="text-teal-600 hover:underline"
                  >
                    Login
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
