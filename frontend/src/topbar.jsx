import React, { useState } from "react";
import MessagesDrawer from "./MessagesDrawer";
import "./App.css"; // make sure this includes the CSS you pasted

export default function Topbar() {
  const [messagesOpen, setMessagesOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          {/* Brand / logo */}
          <a href="/" className="topbar-brand">
            UMass Marketplace
          </a>

          {/* Right side actions */}
          <div className="topbar-actions">
            {/* Create listing */}
            <a
              href="/sell/new"
              className="topbar-btn topbar-btn-outline"
            >
              Sell an item
            </a>

            {/* 👇 NEW: My Messages button */}
            <button
              type="button"
              className="topbar-btn topbar-btn-primary"
              onClick={() => setMessagesOpen(true)}
            >
              My Messages
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in drawer for messages */}
      <MessagesDrawer
        open={messagesOpen}
        onClose={() => setMessagesOpen(false)}
      />
    </>
  );
}
