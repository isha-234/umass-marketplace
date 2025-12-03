import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Listings.css";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  // TODO: Replace this with logged-in email
  const userEmail = "rosh@umass.edu";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/listing/user/published`, {
          params: { email: userEmail },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Error loading my listings:", err);
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
          <p className="eyebrow">Your Listings</p>
          <h1>Published Listings</h1>
          <p className="subtitle">These are visible to buyers.</p>
          <div className="hero-stats">
            <span>{items.length} active listings</span>
          </div>
        </div>
      </section>

      <section className="listings-grid-section">
        {loading && <div className="muted">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="muted">You have no published listings yet.</div>
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
                <div className="card-top">
                  <h3>{item.title}</h3>
                  <span className="price">${item.price}</span>
                </div>
                <p className="meta">{item.category} • {item.condition}</p>
                <p className="description">{item.description}</p>
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
              <div className="modal-image">
                {selectedImage ? (
                  <img src={selectedImage} alt={selectedItem.title} />
                ) : (
                  <div className="image-placeholder">No photo</div>
                )}
              </div>
              <div className="modal-details">
                <h2>{selectedItem.title}</h2>
                <p className="description">{selectedItem.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
