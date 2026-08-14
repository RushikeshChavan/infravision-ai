import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, User as UserIcon, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { ErrorMessage } from "../../components/ErrorMessage";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error: authError, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name.trim()) {
      setLocalError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate("/citizen", { replace: true });
    } catch (err: any) {
      setLocalError(err.message || "Failed to create citizen account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Building2 size={26} />
          </div>
          <h1 className="auth-title">Citizen Registration</h1>
          <p className="auth-subtitle">
            Create a public transparency account to track national infrastructure projects
          </p>
        </div>

        {/* Error alert */}
        {(localError || authError) && (
          <ErrorMessage
            message={localError || authError || "Registration failed."}
            className="mb-4"
          />
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Rajesh Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            leftIcon={<UserIcon size={16} />}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="citizen@example.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            leftIcon={<Mail size={16} />}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
            rightIcon={
              showPassword ? <EyeOff size={16} /> : <Eye size={16} />
            }
            onRightIconClick={() => setShowPassword(!showPassword)}
          />

          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
          />

          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--color-primary-light)",
              borderRadius: "var(--radius-md)",
              marginBottom: "16px",
              fontSize: "0.78rem",
              color: "var(--color-primary)",
              lineHeight: 1.4,
            }}
          >
            <strong>Note:</strong> Public registration grants Citizen access. Department officials and contractor accounts must be provisioned by a Department Administrator.
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
            style={{ width: "100%" }}
          >
            Create Citizen Account
          </Button>
        </form>

        {/* Back to Login */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--color-text-secondary)",
          }}
        >
          <span>Already have an account? </span>
          <Link
            to="/login"
            style={{ fontWeight: 600, color: "var(--color-accent)" }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
