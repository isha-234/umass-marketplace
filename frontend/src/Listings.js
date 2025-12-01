import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Listings.css";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchListings = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/listing/all`);
        if (!active) return;
        setItems(res.data);
      } catch (err) {
        if (!active) return;
        console.error("Error fetching listings:", err);
        setError("We couldn't load listings right now. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchListings();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="listings-page">
      <section className="listings-hero">
        <div className="hero-content">
          <p className="eyebrow">Marketplace</p>
          <h1>Fresh finds from your campus</h1>
          <p className="subtitle">
            Browse everything students are selling right now—tech, books,
            furniture, and more.
          </p>
          <div className="hero-stats">
            <span>{items.length} listings</span>
            <span>Updated live</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-badge">Buy & Sell</div>
          <p className="hero-note">
            Post a listing and reach the UMass community in minutes.
          </p>
          <a className="hero-link" href="/sell/new">
            Create a listing →
          </a>
        </div>
      </section>

      <section className="listings-grid-section">
        {loading && <div className="muted">Loading listings…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="muted">No listings yet. Be the first to post!</div>
        )}

        <div className="listings-grid">
          {items.map((item) => (
            <article key={item._id} className="listing-card">
              <div className="image-wrapper">
                {item.images?.[0] ? (
                  <img
                    src={`${BACKEND_URL}${item.images[0]}`}
                    alt={item.title}
                  />
                ) : (
                  <div className="image-placeholder">No photo</div>
                )}
              </div>

              <div className="card-body">
                <div className="card-top">
                  <h3>{item.title}</h3>
                  <span className="price">${item.price}</span>
                </div>
                <p className="meta">
                  {item.category} • {item.condition}
                </p>
                <p className="description">{item.description}</p>

                {item.images?.length > 1 && (
                  <div className="thumb-row">
                    {item.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={`${BACKEND_URL}${img}`}
                        alt={`thumb-${idx}`}
                      />
                    ))}
                  </div>
                )}

                <div className="contact">
                  <span>{item.contactEmail}</span>
                  <span>{item.contactPhone}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
