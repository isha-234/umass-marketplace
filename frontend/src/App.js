import React from "react";
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import SellerCreateListing from "./SellerCreateListing";
import Listings from "./Listings";
import AuthLogin from "./AuthLogin";
import HomePage from "./HomePage";
import ProfileMenu from "./ProfileMenu";
import MyListings from "./MyListings";
import DraftListings from "./DraftListings";

import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";
import "./App.css";

function Navbar() {
  const { user, logout, isVerified } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <nav className="topbar">
      <div className="topbar-inner">
        <Link className="topbar-brand" to="/home">
          UMass Marketplace
        </Link>

        <div className="topbar-actions">
          <Link
            className="topbar-btn topbar-btn-outline"
            to="/home"
          >
            Home
          </Link>
          <Link
            className="topbar-btn topbar-btn-primary"
            to="/sell/new"
          >
            Create Listing
          </Link>
          <Link
            className="topbar-btn topbar-btn-outline"
            to="/listings"
          >
            View Listings
          </Link>
          {user && isVerified ? (
            <>
              <span className="topbar-user">{user.email}</span>
              <button className="topbar-btn topbar-btn-outline" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <Link className="topbar-btn topbar-btn-outline" to="/auth">
              Log In
            </Link>
          )}
//          <Link className="topbar-btn topbar-btn-outline" to="/home">Home</Link>
//          <Link className="topbar-btn topbar-btn-primary" to="/sell/new">Create Listing</Link>
//          <Link className="topbar-btn topbar-btn-outline" to="/listings">View Listings</Link>
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
}


function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/auth";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <main className="app-main">
        <Routes>
          <Route path="/auth" element={<AuthLogin />} />
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/listings" element={<Listings />} />
          <Route
            path="/sell/new"
            element={
              <ProtectedRoute>
                <SellerCreateListing />
              </ProtectedRoute>
            }
          />
          <Route path="/sell/new" element={<SellerCreateListing />} />

          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/draft-listings" element={<DraftListings />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
