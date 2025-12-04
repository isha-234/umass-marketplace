import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import SellerCreateListing from "./SellerCreateListing";
import Listings from "./Listings";
import AuthLogin from "./AuthLogin";
import HomePage from "./HomePage";
import Events from "./Events";
import ProfileMenu from "./ProfileMenu";
import MyListings from "./MyListings";
import MessagesDrawer from "./MessagesDrawer";
import DraftListings from "./DraftListings";
import SavedItems from "./SavedItems";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";
import "./App.css";

function Navbar() {
  const { user, logout, isVerified } = useAuth();
  const navigate = useNavigate();

  const [messagesOpen, setMessagesOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <>
      <nav className="topbar">
        <div className="topbar-inner">
          <Link className="topbar-brand" to="/home">
            <img src="/logo2.png" alt="UM Marketplace logo" className="topbar-logo" />
            <span className="topbar-title">UMass Marketplace</span>
          </Link>

          <div className="topbar-actions">
            <Link className="topbar-btn topbar-btn-outline" to="/home">
              Home
            </Link>

            <Link className="topbar-btn topbar-btn-outline" to="/sell/new">
              Create Listing
            </Link>

            <Link className="topbar-btn topbar-btn-outline" to="/listings">
              View Listings
            </Link>

            <Link className="topbar-btn topbar-btn-outline" to="/events">
              Events
            </Link>

            {user && isVerified ? (
              <>
                {/* My Messages button */}
                <button
                    type="button"
                    className="topbar-btn topbar-btn-outline"
                    style={{ textTransform: "none" }}
                    onClick={() => setMessagesOpen(true)}
                  >
                    My Messages
                </button>


                {/* Profile menu (avatar / dropdown, etc.) */}
                <ProfileMenu />
              </>
            ) : (
              <Link className="topbar-btn topbar-btn-outline" to="/auth">
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Drawer mounted next to navbar so it overlays the app */}
      {user && isVerified && (
        <MessagesDrawer
          open={messagesOpen}
          onClose={() => setMessagesOpen(false)}
          currentUserEmail={user.email}
        />
      )}
    </>
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

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
     
          <Route path="/sell/new" element={<SellerCreateListing />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/draft-listings" element={<DraftListings />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedItems />
              </ProtectedRoute>
            }
          />
   </Routes>
      </main>
    </>
  );
}
export default App;
