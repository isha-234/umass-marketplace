import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import "./ProfileMenu.css";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const { user, isVerified, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  // If user is NOT logged in → show Login button
  if (!user || !isVerified) {
    return (
      <Link className="topbar-btn topbar-btn-outline" to="/auth">
        Log In
      </Link>
    );
  }

  return (
    <div className="profile-container" ref={menuRef}>
      {/* USER EMAIL (shown outside dropdown, left of icon) */}
      <span className="profile-email">{user.email}</span>

      {/* PROFILE ICON */}
      <button className="profile-btn" onClick={() => setOpen(!open)}>
        <FaUserCircle size={26} color="#881c1c" />
      </button>

      {open && (
        <div className="profile-dropdown">
          <Link to="/saved" className="dropdown-item">My Saved Items</Link>
          <Link to="/draft-listings" className="dropdown-item">Draft Listings</Link>
          <Link to="/my-listings" className="dropdown-item">My Listings</Link>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
