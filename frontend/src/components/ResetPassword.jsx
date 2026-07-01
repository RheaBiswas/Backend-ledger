import React, { useState } from "react";
import { api } from "../utils/api";
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPassword({ token, onBackToLogin }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      return setError("All fields are required.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword(token, password);
      setSuccess(res.message || "Your password has been successfully reset.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow-bg"></div>
      
      <div className="glass-card auth-content" style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <div className="glass-card-header" style={{ textAlign: "center", padding: "2.5rem 1.5rem 1.5rem" }}>
          <div className="navbar-logo" style={{ justifyContent: "center", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
            <ShieldCheck size={28} style={{ color: "var(--primary)" }} />
            <span>Ledger</span>Book
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Reset Password
          </p>
        </div>

        <div className="glass-card-body" style={{ padding: "1.5rem 2rem 2.5rem" }}>
          {error && (
            <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error)", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.85rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <CheckCircle2 size={48} style={{ color: "var(--success)", margin: "0 auto 1rem" }} />
              <p style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "1.5rem" }}>{success}</p>
              <button 
                onClick={onBackToLogin} 
                className="btn btn-primary" 
                style={{ width: "100%" }}
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dark)" }} />
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: "2.75rem" }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dark)" }} />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: "2.75rem" }}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", height: "2.75rem" }}
                disabled={loading}
              >
                {loading ? (
                  <div className="step-spinner"></div>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
