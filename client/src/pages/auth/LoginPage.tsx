import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Building2, Eye, EyeOff, Lock, Mail, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { ErrorMessage } from "../../components/ErrorMessage";
import { USER_ROLES } from "../../types";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError("Please enter your registered email address.");
      return;
    }
    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for hackathon demo
  const fillDemoAccount = (demoEmail: string, demoPass = "Password@123") => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLocalError(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo & Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Building2 size={26} />
          </div>
          <h1 className="auth-title">InfraVision AI</h1>
          <p className="auth-subtitle">
            Digital Infrastructure Project Monitoring Platform
          </p>
        </div>

        {/* Error Display */}
        {(localError || authError) && (
          <ErrorMessage
            message={localError || authError || "Authentication error."}
            className="mb-4"
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Official Email Address"
            type="email"
            placeholder="officer@nic.in or user@infravision.gov"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            leftIcon={<Mail size={16} />}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            leftIcon={<Lock size={16} />}
            rightIcon={
              showPassword ? <EyeOff size={16} /> : <Eye size={16} />
            }
            onRightIconClick={() => setShowPassword(!showPassword)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
            style={{ width: "100%", marginTop: "8px" }}
          >
            Sign In to Portal
          </Button>
        </form>

        {/* Citizen Registration Link */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--color-text-secondary)",
          }}
        >
          <span>Are you a citizen? </span>
          <Link
            to="/register"
            style={{ fontWeight: 600, color: "var(--color-accent)" }}
          >
            Register Public Account
          </Link>
        </div>

        {/* Hackathon Demo Account Quick-Fill */}
        <div className="auth-demo-accounts">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text-muted)",
            }}
          >
            <Shield size={13} />
            <span>Demo Credentials (1-Click Fill)</span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            <button
              type="button"
              className="demo-account-chip"
              onClick={() => fillDemoAccount("admin@infravision.gov")}
            >
              Super Admin
            </button>
            <button
              type="button"
              className="demo-account-chip"
              onClick={() => fillDemoAccount("deptadmin@pwd.gov")}
            >
              Dept Admin
            </button>
            <button
              type="button"
              className="demo-account-chip"
              onClick={() => fillDemoAccount("pm@pwd.gov")}
            >
              Project Manager
            </button>
            <button
              type="button"
              className="demo-account-chip"
              onClick={() => fillDemoAccount("field@pwd.gov")}
            >
              Field Engineer
            </button>
            <button
              type="button"
              className="demo-account-chip"
              onClick={() => fillDemoAccount("contractor@infra.com")}
            >
              Contractor
            </button>
            <button
              type="button"
              className="demo-account-chip"
              onClick={() => fillDemoAccount("auditor@cag.gov")}
            >
              Auditor
            </button>
            <button
              type="button"
              className="demo-account-chip"
              onClick={() => fillDemoAccount("citizen@public.org")}
            >
              Citizen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
