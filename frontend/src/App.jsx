import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import ResetPassword from "./components/ResetPassword";
import { api } from "./utils/api";
import { ShieldCheck, LogOut } from "lucide-react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.auth.isAuthenticated());
  const [user, setUser] = useState(api.auth.getCurrentUser());
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    // Check if password reset token is in URL query parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setResetToken(token);
    }

    const handleAuthChange = () => {
      setIsAuthenticated(api.auth.isAuthenticated());
      setUser(api.auth.getCurrentUser());
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    await api.auth.logout();
  };

  const handleBackToLogin = () => {
    // Clear URL query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    setResetToken(null);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      {isAuthenticated && !resetToken && (
        <nav className="navbar">
          <div className="navbar-content">
            <div className="navbar-logo">
              <ShieldCheck size={22} style={{ color: "var(--primary)" }} />
              <span>Ledger</span>Book
            </div>

            <div className="navbar-actions">
              <div className="user-profile">
                <div className="user-avatar">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.name || "User"}</span>
                  <span className="user-role">
                    {user?.email === "system@house.ledger" ? "System House Admin" : "Active Portfolio"}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="btn btn-secondary" 
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", gap: "0.4rem" }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Primary views */}
      {resetToken ? (
        <ResetPassword token={resetToken} onBackToLogin={handleBackToLogin} />
      ) : isAuthenticated ? (
        <Dashboard />
      ) : (
        <Auth onAuthSuccess={() => {
          setIsAuthenticated(true);
          setUser(api.auth.getCurrentUser());
        }} />
      )}
    </div>
  );
}
