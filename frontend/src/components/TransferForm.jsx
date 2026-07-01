import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Send, RefreshCw, AlertCircle, CheckCircle, Shield, Clock, Mail, Coins } from "lucide-react";

export default function TransferForm({ accounts, onTransferSuccess }) {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Progress flow states
  const [progressStep, setProgressStep] = useState(0); // 0: idle, 1: init, 2: debit, 3: delay, 4: credit, 5: complete
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  const generateKey = () => {
    const key = "key_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    setIdempotencyKey(key);
  };

  useEffect(() => {
    generateKey();
    if (accounts.length > 0) {
      // Find first active account to set as default
      const firstActive = accounts.find(a => a.status === "ACTIVE");
      if (firstActive) setFromAccount(firstActive._id);
    }
  }, [accounts]);

  // Handle countdown during the 15-second delay
  useEffect(() => {
    let timer;
    if (progressStep === 3 && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setProgressStep(4); // transition to crediting
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [progressStep, secondsRemaining]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fromAccount) return setError("Please select a source account.");
    if (!toAccount) return setError("Please specify a recipient account ID.");
    if (!amount || Number(amount) <= 0) return setError("Please enter a valid transfer amount.");
    if (!idempotencyKey) return setError("An idempotency key is required.");

    setLoading(true);
    setSecondsRemaining(15);
    setProgressStep(1); // Step 1: Submitting & Validating

    // Visual step timeline triggers
    const t1 = setTimeout(() => setProgressStep(2), 1500); // 1.5s: Writing Debit
    const t2 = setTimeout(() => setProgressStep(3), 3000); // 3s: Simulating delay & ticking

    try {
      const result = await api.transactions.create(fromAccount, toAccount, amount, idempotencyKey);
      
      // Clear timers in case of early response (e.g. idempotency match)
      clearTimeout(t1);
      clearTimeout(t2);
      
      setProgressStep(5); // Completed successfully!
      setTimeout(() => {
        // Reset form
        setAmount("");
        generateKey();
        setProgressStep(0);
        setLoading(false);
        onTransferSuccess();
      }, 3000);

    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err.message || "Transaction failed. Please try again.");
      setProgressStep(0);
      setLoading(false);
    }
  };

  const currentFromAccountData = accounts.find(a => a._id === fromAccount);

  return (
    <div className="glass-card">
      <div className="glass-card-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Send size={20} style={{ color: "var(--primary)" }} />
        <h3>Transfer Funds</h3>
      </div>
      
      <div className="glass-card-body">
        {error && (
          <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error)", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.85rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!loading ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fromAccount">Source Account</label>
              <select
                id="fromAccount"
                className="form-input"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <option value="" disabled>Select an account</option>
                {accounts.map(acc => (
                  <option key={acc._id} value={acc._id} disabled={acc.status !== "ACTIVE"}>
                    {acc._id.slice(-6)} ({acc.currency}) - Status: {acc.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="toAccount">Recipient Account ID (MongoDB ObjectId)</label>
              <input
                id="toAccount"
                type="text"
                className="form-input"
                placeholder="e.g. 664f3d29a5b32810..."
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value.trim())}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount</label>
              <div style={{ position: "relative" }}>
                <Coins size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dark)" }} />
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="any"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Idempotency Key (Safe Retries)</span>
                <button
                  type="button"
                  onClick={generateKey}
                  style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}
                  title="Generate New Key"
                >
                  <RefreshCw size={12} /> Generate
                </button>
              </label>
              <input
                type="text"
                className="form-input"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              <Send size={16} />
              Confirm Transfer
            </button>
          </form>
        ) : (
          <div style={{ padding: "1rem 0" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h4 style={{ color: "var(--primary)" }}>Transaction Processing</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Executing ACID-compliant MongoDB session transaction
              </p>
            </div>

            <div className="progress-flow">
              {/* Step 1 */}
              <div className={`progress-step ${progressStep >= 1 ? (progressStep > 1 ? "completed" : "active") : ""}`}>
                <div className="progress-icon">
                  {progressStep > 1 ? <CheckCircle size={14} /> : (progressStep === 1 ? <div className="step-spinner"></div> : "1")}
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>1. Validating Request & Idempotency Key</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Checking key and account states</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`progress-step ${progressStep >= 2 ? (progressStep > 2 ? "completed" : "active") : ""}`}>
                <div className="progress-icon">
                  {progressStep > 2 ? <CheckCircle size={14} /> : (progressStep === 2 ? <div className="step-spinner"></div> : "2")}
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>2. Open Session & Write DEBIT</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sender account debited; transaction set to PENDING</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`progress-step ${progressStep >= 3 ? (progressStep > 3 ? "completed" : "active") : ""}`}>
                <div className="progress-icon">
                  {progressStep > 3 ? <CheckCircle size={14} /> : (progressStep === 3 ? <Clock size={14} className="spinning" /> : "3")}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "0.9rem" }}>
                    <span>3. Simulating In-Flight Delay</span>
                    {progressStep === 3 && (
                      <span style={{ color: "var(--warning)" }}>{secondsRemaining}s remaining</span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Enforcing hardcoded 15-second simulation delay</div>
                  {progressStep === 3 && (
                    <div className="countdown-bar">
                      <div className="countdown-bar-fill active"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div className={`progress-step ${progressStep >= 4 ? (progressStep > 4 ? "completed" : "active") : ""}`}>
                <div className="progress-icon">
                  {progressStep > 4 ? <CheckCircle size={14} /> : (progressStep === 4 ? <div className="step-spinner"></div> : "4")}
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>4. Write CREDIT & Commit Transaction</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Crediting receiver; transaction set to COMPLETED</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className={`progress-step ${progressStep >= 5 ? "completed" : ""}`}>
                <div className="progress-icon">
                  {progressStep >= 5 ? <CheckCircle size={14} /> : "5"}
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>5. Send Email Notification</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pushing success email notification</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
