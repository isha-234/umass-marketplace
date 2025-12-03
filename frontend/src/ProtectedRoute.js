import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, isVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-loading">Checking your session…</div>;
  }

  if (!user || !isVerified) {
    return <Navigate to="/auth" replace state={{ from: location, reason: "verify" }} />;
  }

  return children;
}
