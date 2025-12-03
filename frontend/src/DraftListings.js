import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Listings.css";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function DraftListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const userEmail = "rosh@umass.edu";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/listing/user/drafts`, {
          params: { email: userEmail },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Error loading draft listings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openDetails = (item) => {
    setSelectedItem(item);
    setSelectedImage(item.images?.[0] ? `${BACKEND_URL}${item.images[0]}` : "");
  };

  return (
    <div className="listings-page">
      <section className="listings-hero">
        <div className="hero-content">
          <p className="eyebrow">Your Drafts</p>
          <h1>Draft Listings</h1>
          <p className="subtitle">Items saved but not published yet.</p>
          <div className="hero-stats">
            <span>{items.length} drafts</span>
          </div>
        </div>
      </section>

      <section className="listings-grid-section">
        {loading && <div className="muted">Loading drafts…</div>}
        {!loading && items.length === 0 && (
          <div className="muted">You have no draft listings.</div>
        )}

        <div className="listings-grid">
          {items.map((item) => (
            <article
              key={item._id}
              className="listing-card"
              onClick={() => openDetails(item)}
            >
              <div className="image-wrapper clickable">
                {item.images?.[0] ? (
                  <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                ) : (
                  <div className="image-placeholder">No photo</div>
                )}
              </div>

              <div className="card-body">
                <span className="badge draft-badge">DRAFT</span>

                <div className="card-top">
                  <h3>{item.title || "Untitled draft"}</h3>
                </div>

                <p className="description">
                  {item.description || "No description yet."}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            <div className="modal-content">
              Draft details here...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
