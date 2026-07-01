import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { X, ArrowDownRight, ArrowUpRight, ShieldAlert, BookOpen, Clock } from "lucide-react";

export default function LedgerModal({ accountId, onClose }) {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (accountId) {
      fetchLedger();
    }
  }, [accountId]);

  const fetchLedger = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.accounts.getLedger(accountId);
      setLedgerEntries(data.ledgerEntries || []);
    } catch (err) {
      setError(err.message || "Failed to load ledger entries.");
    } finally {
      setLoading(false);
    }
  };

  // Reconcile total debits and credits
  const reconciliation = ledgerEntries.reduce(
    (acc, entry) => {
      if (entry.type === "CREDIT") {
        acc.credits += entry.amount;
      } else {
        acc.debits += entry.amount;
      }
      return acc;
    },
    { credits: 0, debits: 0 }
  );

  const finalBalance = reconciliation.credits - reconciliation.debits;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-card modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
      >
        <div className="glass-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BookOpen size={20} style={{ color: "var(--primary)" }} />
            <div>
              <h3 style={{ fontSize: "1.1rem" }}>Immutable Ledger Sheet</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "monospace" }}>
                Account: {accountId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: "50%", padding: "0.4rem" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="glass-card-body" style={{ padding: "1.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
              <div className="step-spinner" style={{ width: "2rem", height: "2rem" }}></div>
            </div>
          ) : error ? (
            <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error)", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          ) : (
            <div>
              {/* Immutability warning */}
              <div style={{ background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "0.5rem", padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem" }}>
                <ShieldAlert size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.1rem" }} />
                <span>
                  <strong>Ledger Rule:</strong> Every entry below is single, double-entry recorded and <strong>strictly immutable</strong>. Updates, edits, and deletions are permanently blocked by Mongoose middleware schemas.
                </span>
              </div>

              {/* Ledger Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-color)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Credits (+)</div>
                  <div className="ledger-credit" style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>
                    +{reconciliation.credits.toLocaleString()}
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-color)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Debits (-)</div>
                  <div className="ledger-debit" style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>
                    -{reconciliation.debits.toLocaleString()}
                  </div>
                </div>
                <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--primary-glow)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--primary)", textTransform: "uppercase", fontWeight: "600" }}>Computed Balance</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "0.25rem", color: "white" }}>
                    {finalBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Entries list */}
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Entry History</h4>
              <div 
                style={{ 
                  maxHeight: "35vh", 
                  overflowY: "auto", 
                  border: "1px solid var(--border-color)", 
                  borderRadius: "0.5rem", 
                  background: "rgba(0,0,0,0.1)" 
                }}
              >
                {ledgerEntries.length === 0 ? (
                  <div style={{ padding: "2rem", textAlignment: "center", color: "var(--text-dark)", fontSize: "0.85rem" }}>
                    No ledger entries for this account.
                  </div>
                ) : (
                  ledgerEntries.map((entry) => (
                    <div key={entry._id} className="ledger-entry-item">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div 
                          style={{ 
                            width: "2rem", 
                            height: "2rem", 
                            borderRadius: "50%", 
                            display: "flex", 
                            alignItems: "center", 
                            justify: "center", 
                            background: entry.type === "CREDIT" ? "var(--success-bg)" : "var(--error-bg)", 
                            color: entry.type === "CREDIT" ? "var(--success)" : "var(--error)" 
                          }}
                        >
                          {entry.type === "CREDIT" ? <ArrowDownRight size={18} style={{ margin: "auto" }} /> : <ArrowUpRight size={18} style={{ margin: "auto" }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                            {entry.type === "CREDIT" ? "Credit Inflow" : "Debit Outflow"}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                            Tx: {entry.transaction?._id?.slice(-8) || "Initial Mint"}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className={entry.type === "CREDIT" ? "ledger-credit" : "ledger-debit"}>
                          {entry.type === "CREDIT" ? "+" : "-"}{entry.amount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "0.25rem", justifyContent: "flex-end" }}>
                          <Clock size={10} />
                          {entry.transaction?.createdAt ? new Date(entry.transaction.createdAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "System Seed"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
