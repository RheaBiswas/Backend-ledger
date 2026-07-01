import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import TransferForm from "./TransferForm";
import LedgerModal from "./LedgerModal";
import { 
  Plus, Copy, Check, ArrowDownLeft, ArrowUpLeft, RefreshCw, 
  HelpCircle, Shield, TrendingUp, AlertTriangle, ListFilter,
  DollarSign, ArrowUpRight, Award, Compass
} from "lucide-react";

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Interactive UI States
  const [copiedId, setCopiedId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [user, setUser] = useState(null);
  
  // Admin mint state
  const [mintTarget, setMintTarget] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [mintKey, setMintKey] = useState("");
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState("");
  const [mintSuccess, setMintSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch user accounts
      const accountsRes = await api.accounts.list();
      
      // 2. Fetch balance for each account in parallel
      const accountsWithBalances = await Promise.all(
        accountsRes.accounts.map(async (acc) => {
          try {
            const balRes = await api.accounts.getBalance(acc._id);
            return { ...acc, balance: balRes.balance };
          } catch (e) {
            return { ...acc, balance: 0 };
          }
        })
      );
      setAccounts(accountsWithBalances);

      // 3. Fetch user transactions
      const txRes = await api.transactions.list();
      setTransactions(txRes.transactions || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    setUser(currentUser);
    loadData();
    generateMintKey();
  }, []);

  const handleCreateAccount = async () => {
    setError("");
    try {
      await api.accounts.create();
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to create account.");
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateMintKey = () => {
    setMintKey("mint_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now());
  };

  const handleMintFunds = async (e) => {
    e.preventDefault();
    setMintError("");
    setMintSuccess("");
    
    if (!mintTarget) return setMintError("Target account ID is required.");
    if (!mintAmount || Number(mintAmount) <= 0) return setMintError("Enter a valid amount.");
    if (!mintKey) return setMintError("Idempotency key is required.");

    setMintLoading(true);
    try {
      await api.transactions.mint(mintTarget, mintAmount, mintKey);
      setMintSuccess(`Successfully minted ${mintAmount} INR to account!`);
      setMintAmount("");
      generateMintKey();
      await loadData();
    } catch (err) {
      setMintError(err.message || "Failed to mint initial funds.");
    } finally {
      setMintLoading(false);
    }
  };

  // Aggregate net worth across active INR accounts
  const netWorth = accounts
    .filter(a => a.status === "ACTIVE" && a.currency === "INR")
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const isSystemUser = user?.email === "system@house.ledger";

  return (
    <div className="content-wrapper">
      {error && (
        <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error)", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: HERO, ACCOUNTS, TRANSACTION HISTORY */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Dashboard Hero Banner */}
          <div className="glass-card dashboard-hero">
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <TrendingUp size={14} /> Bookkeeping Portfolio
              </span>
              <h2 style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>Welcome back, {user?.name || "User"}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.15rem" }}>
                Aggregating live computed balances from ledger operations
              </p>
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total Net Worth (INR)</div>
              <div className="net-worth-amount">
                {loading ? "Calculating..." : `${netWorth.toLocaleString()} INR`}
              </div>
            </div>
          </div>

          {/* Accounts Panel */}
          <div className="glass-card">
            <div className="glass-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <DollarSign size={20} style={{ color: "var(--primary)" }} />
                <h3>Your Bookkeeping Accounts</h3>
              </div>
              <button onClick={handleCreateAccount} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                <Plus size={16} /> Open Account
              </button>
            </div>

            <div className="glass-card-body">
              {loading && accounts.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                  <div className="step-spinner"></div>
                </div>
              ) : accounts.length === 0 ? (
                <div className="empty-state">
                  <Compass className="empty-state-icon" />
                  <p>No active accounts found. Open your first account to start transaction logging.</p>
                </div>
              ) : (
                <div className="accounts-grid">
                  {accounts.map((acc) => (
                    <div 
                      key={acc._id} 
                      className="glass-card account-card"
                      onClick={() => setSelectedAccountId(acc._id)}
                    >
                      <div className="account-card-header">
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                            Account ID
                          </div>
                          <button 
                            className="account-id-copy"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(acc._id);
                            }}
                          >
                            <span>{acc._id.slice(-8)}</span>
                            {copiedId === acc._id ? <Check size={10} style={{ color: "var(--success)" }} /> : <Copy size={10} />}
                          </button>
                        </div>
                        <span className={`badge badge-${acc.status.toLowerCase()}`}>
                          {acc.status}
                        </span>
                      </div>
                      
                      <div style={{ marginTop: "1rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Calculated Balance</div>
                        <div className="account-balance">
                          {acc.balance.toLocaleString()} <span style={{ fontSize: "1rem", color: "var(--text-dark)" }}>{acc.currency}</span>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        View Ledger Sheet →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transactions List Panel */}
          <div className="glass-card">
            <div className="glass-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={20} style={{ color: "var(--primary)" }} />
                <h3>Recent Transaction Audits</h3>
              </div>
              <button 
                onClick={loadData} 
                className="btn btn-secondary btn-icon"
                style={{ padding: "0.4rem" }}
                title="Refresh Audits"
              >
                <RefreshCw size={14} className={loading ? "spinning" : ""} />
              </button>
            </div>

            <div className="glass-card-body" style={{ padding: "0" }}>
              {loading && transactions.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                  <div className="step-spinner"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="empty-state">
                  <Compass className="empty-state-icon" />
                  <p>No transactions audited yet. Initiate a transfer to witness double-entry records.</p>
                </div>
              ) : (
                <div className="tx-table-container">
                  <table className="tx-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Direction</th>
                        <th>Counterparty</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        // Check direction of transaction based on user accounts
                        const userAccountIds = accounts.map(a => a._id);
                        const isDebit = userAccountIds.includes(tx.fromAccount?._id);
                        const isCredit = userAccountIds.includes(tx.toAccount?._id);
                        
                        let direction = "Internal";
                        let counterparty = "N/A";
                        
                        if (isDebit && isCredit) {
                          direction = "Transfer";
                          counterparty = `Account ${tx.toAccount?._id?.slice(-6)}`;
                        } else if (isDebit) {
                          direction = "Sent";
                          counterparty = tx.toAccount?.user?.name || `Account ${tx.toAccount?._id?.slice(-6)}`;
                        } else if (isCredit) {
                          direction = "Received";
                          counterparty = tx.fromAccount?.user?.name || `Account ${tx.fromAccount?._id?.slice(-6)}`;
                        }

                        return (
                          <tr key={tx._id}>
                            <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {new Date(tx.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              <div style={{ fontSize: "0.7rem", color: "var(--text-dark)" }}>
                                {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                            <td>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: "500", fontSize: "0.85rem" }}>
                                {direction === "Received" ? (
                                  <ArrowDownLeft size={14} style={{ color: "var(--success)" }} />
                                ) : direction === "Sent" ? (
                                  <ArrowUpRight size={14} style={{ color: "var(--error)" }} />
                                ) : (
                                  <ArrowUpLeft size={14} style={{ color: "var(--info)" }} />
                                )}
                                {direction}
                              </span>
                            </td>
                            <td style={{ fontSize: "0.85rem" }}>
                              <div>{counterparty}</div>
                              <div style={{ fontSize: "0.7rem", color: "var(--text-dark)", fontFamily: "monospace" }}>
                                Key: {tx.idempotencyKey.slice(0, 16)}...
                              </div>
                            </td>
                            <td style={{ fontWeight: "600" }}>
                              <span className={direction === "Received" ? "ledger-credit" : direction === "Sent" ? "ledger-debit" : ""}>
                                {direction === "Received" ? "+" : direction === "Sent" ? "-" : ""}{tx.amount.toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <span className={`badge status-${tx.status.toLowerCase()}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TRANSFER SIDEBAR & ADMIN CONTROLS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Transfer sidebar */}
          <TransferForm accounts={accounts} onTransferSuccess={loadData} />

          {/* System Admin Panel (Visible to system@house.ledger) */}
          {isSystemUser && (
            <div className="glass-card admin-mint-section">
              <div className="glass-card-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield size={20} style={{ color: "var(--secondary)" }} />
                <h3>System Admin Panel</h3>
              </div>
              <div className="glass-card-body">
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  As the central House system user, you can mint initial test funds directly from the reserve to any active user account.
                </p>

                {mintError && (
                  <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error)", padding: "0.5rem 0.75rem", borderRadius: "0.25rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                    {mintError}
                  </div>
                )}

                {mintSuccess && (
                  <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)", padding: "0.5rem 0.75rem", borderRadius: "0.25rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                    {mintSuccess}
                  </div>
                )}

                <form onSubmit={handleMintFunds}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="mintTarget">Target Account ID</label>
                    <input
                      id="mintTarget"
                      type="text"
                      className="form-input"
                      placeholder="Enter target account MongoDB ID"
                      value={mintTarget}
                      onChange={(e) => setMintTarget(e.target.value.trim())}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="mintAmount">Mint Amount (INR)</label>
                    <input
                      id="mintAmount"
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="e.g. 50000"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Idempotency Key</span>
                      <button type="button" onClick={generateMintKey} style={{ background: "none", border: "none", color: "var(--secondary)", cursor: "pointer", fontSize: "0.7rem" }}>
                        <RefreshCw size={10} /> Regen
                      </button>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={mintKey}
                      onChange={(e) => setMintKey(e.target.value)}
                      style={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-accent"
                    style={{ width: "100%", marginTop: "0.5rem" }}
                    disabled={mintLoading}
                  >
                    <Award size={16} />
                    {mintLoading ? "Minting..." : "Mint Initial Funds"}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Ledger modal detail */}
      {selectedAccountId && (
        <LedgerModal 
          accountId={selectedAccountId} 
          onClose={() => setSelectedAccountId(null)} 
        />
      )}
    </div>
  );
}
