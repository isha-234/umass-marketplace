import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import SellerCreateListing from "./SellerCreateListing";
import Listings from "./Listings";
import AuthLogin from "./AuthLogin";
import HomePage from "./HomePage";
import Events from "./Events";
import "./App.css";

function Navbar() {
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
          <Link
            className="topbar-btn topbar-btn-outline"
            to="/events"
          >
            Events
          </Link>
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/sell/new" element={<SellerCreateListing />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
