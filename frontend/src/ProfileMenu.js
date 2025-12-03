import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./ProfileMenu.css";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="profile-container" ref={menuRef}>
      <button className="profile-btn" onClick={() => setOpen(!open)}>
        <FaUserCircle size={26} color="#881c1c" />
      </button>

      {open && (
        <div className="profile-dropdown">
          <Link to="/saved" className="dropdown-item">My Saved Items</Link>
          <Link to="/draft-listings" className="dropdown-item">Draft Listings</Link>
          <Link to="/my-listings" className="dropdown-item">My Listings</Link>

          <button className="dropdown-item logout">Logout</button>
        </div>
      )}
    </div>
  );
}
