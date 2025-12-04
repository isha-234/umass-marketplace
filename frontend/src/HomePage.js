import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="homepage">
      <section className="hero">
        <h2 className="tagline">
          Your campus hub for buying, selling and sharing!
        </h2>

        <div className="actions">
          <Link to="/listings" className="action-card buy">
            <h3>Buy</h3>
          </Link>
          <Link to="/sell/new" className="action-card sell">
            <h3>Sell</h3>
          </Link>
          <Link to="/events" className="action-card events-card">
            <h3>Events</h3>
          </Link>
        </div>
      </section>
    </div>
  );
}
