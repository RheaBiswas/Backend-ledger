import React, { useState } from "react";
import { api } from "../utils/api";
import { Lock, Mail, User, ArrowRight, ShieldCheck, HelpCircle, ArrowLeft } from "lucide-react";

export default function Auth({ onAuthSuccess }) {
  const [view, setView] = useState("LOGIN"); // "LOGIN", "REGISTER", "FORGOT"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email) {
      setError("Email is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (view === "FORGOT") return true;

    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (view === "REGISTER" && !name) {
      setError("Name is required for registration.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (view === "LOGIN") {
        await api.auth.login(email, password);
        onAuthSuccess();
      } else if (view === "REGISTER") {
        await api.auth.register(email, name, password);
        onAuthSuccess();
      } else if (view === "FORGOT") {
        const res = await api.auth.forgotPassword(email);
        setSuccess(res.message || "A password reset link has been sent to your email.");
        setEmail("");
      }
    } catch (err) {
      setError(err.message || "An error occurred during submission.");
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
            {view === "LOGIN" && "Access your minimal double-entry bookkeeping ledger"}
            {view === "REGISTER" && "Create an account to manage your accounts & ledgers"}
            {view === "FORGOT" && "Recover your account credentials"}
          </p>
        </div>

        <div className="glass-card-body" style={{ padding: "1.5rem 2rem 2.5rem" }}>
          {error && (
            <div 
              style={{ 
                background: "var(--error-bg)", 
                border: "1px solid var(--error-border)", 
                color: "var(--error)", 
                padding: "0.75rem 1rem", 
                borderRadius: "0.5rem", 
                fontSize: "0.85rem",
                marginBottom: "1.25rem" 
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              style={{ 
                background: "var(--success-bg)", 
                border: "1px solid var(--success-border)", 
                color: "var(--success)", 
                padding: "0.75rem 1rem", 
                borderRadius: "0.5rem", 
                fontSize: "0.85rem",
                marginBottom: "1.25rem" 
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {view === "REGISTER" && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dark)" }} />
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: "2.75rem" }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dark)" }} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "2.75rem" }}
                  required
                />
              </div>
            </div>

            {view !== "FORGOT" && (
              <div className="form-group" style={{ marginBottom: view === "LOGIN" ? "1rem" : "2rem" }}>
                <label className="form-label" htmlFor="password">Password</label>
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
            )}

            {view === "LOGIN" && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setView("FORGOT");
                    setError("");
                    setSuccess("");
                  }}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "var(--text-muted)", 
                    cursor: "pointer", 
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

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
                  {view === "LOGIN" && "Sign In"}
                  {view === "REGISTER" && "Register"}
                  {view === "FORGOT" && "Send Reset Link"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem" }}>
            {view === "FORGOT" ? (
              <button
                onClick={() => {
                  setView("LOGIN");
                  setError("");
                  setSuccess("");
                }}
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: "var(--text-muted)", 
                  fontWeight: "600", 
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            ) : (
              <>
                <span style={{ color: "var(--text-muted)" }}>
                  {view === "LOGIN" ? "New to LedgerBook? " : "Already have an account? "}
                </span>
                <button
                  onClick={() => {
                    setView(view === "LOGIN" ? "REGISTER" : "LOGIN");
                    setError("");
                    setSuccess("");
                  }}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "var(--primary)", 
                    fontWeight: "600", 
                    cursor: "pointer",
                    padding: "0"
                  }}
                >
                  {view === "LOGIN" ? "Create an account" : "Sign in here"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
