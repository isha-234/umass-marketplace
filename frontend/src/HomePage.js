import React, { useRef } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import { FaBars, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function HomePage() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="navbar">
        <h1 className="brand">
          <span className="brand-highlight">UMass</span> Marketplace
        </h1>
        <button className="menu-btn">
          <FaBars />
        </button>
      </header>

      {/* Hero section */}
      <section className="hero">
        <h2 className="tagline">Your campus hub for buying, selling & sharing</h2>

        <div className="actions">
          <Link to="/listings" className="action-card buy">
            <h3>Buy</h3>
          </Link>
          <Link to="/sell/new" className="action-card sell">
            <h3>Sell</h3>
          </Link>
        </div>
      </section>

      {/* Events Section */}
      <section className="events">
        <div className="events-header">
          <h3>Campus Events</h3>
        </div>

        <div className="events-scroll" ref={scrollRef}>
          <div className="event-card">Career Fair</div>
          <div className="event-card">Club Expo</div>
          <div className="event-card">Food Festival</div>
          <div className="event-card">Open Mic Night</div>
          <div className="event-card">Hackathon</div>
        </div>
      </section>
    </div>
  );
}
