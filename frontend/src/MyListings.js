import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DraftListings.css";
import { useAuth } from "./AuthContext";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const { user } = useAuth();
  const userEmail = user?.email;

  useEffect(() => {
    if (!userEmail) return;

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
    <div className="dl-listings-page">
      <section className="dl-listings-hero">
        <div className="dl-hero-content">
          <p className="dl-eyebrow">Your Listings</p>
          <h1>Published Listings</h1>
          <p className="dl-subtitle">These are visible to buyers.</p>
          <div className="dl-hero-stats">
            <span>{items.length} active listings</span>
          </div>
        </div>
      </section>

      <section className="dl-listings-grid-section">
        {loading && <div className="dl-muted">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="dl-muted">You have no published listings yet.</div>
        )}

        <div className="dl-listings-grid">
          {items.map((item) => (
            <article
              key={item._id}
              className="dl-listing-card"
              onClick={() => openDetails(item)}
            >
              <div className="dl-image-wrapper clickable">
                {item.images?.[0] ? (
                  <img
                    src={`${BACKEND_URL}${item.images[0]}`}
                    alt={item.title}
                  />
                ) : (
                  <div className="dl-image-placeholder">No photo</div>
                )}
              </div>

              {/* Details */}
              <div className="dl-card-body">
                <div className="dl-card-top">
                  <h3>{item.title}</h3>
                  <span className="dl-price">${item.price}</span>
                </div>

                <p className="dl-meta">
                  {item.category} • {item.condition}
                </p>

                <p className="dl-description">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>


      {/* ===========================
          MODAL
      ============================ */}
      {selectedItem && (
        <div className="dl-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="dl-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="dl-close-btn"
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>

            <div className="dl-modal-content">
              <div className="dl-modal-image">
                {selectedImage ? (
                  <img src={selectedImage} alt={selectedItem.title} />
                ) : (
                  <div className="dl-image-placeholder">No photo</div>
                )}

                {selectedItem.images?.length > 1 && (
                  <div className="dl-modal-thumbs">
                    {selectedItem.images.map((img, idx) => {
                      const url = `${BACKEND_URL}${img}`;
                      return (
                        <img
                          key={idx}
                          src={url}
                          alt={`thumb-${idx}`}
                          className={
                            url === selectedImage ? "active" : ""
                          }
                          onClick={() => setSelectedImage(url)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="dl-modal-details">
                <div className="dl-modal-header">
                  <h2>{selectedItem.title}</h2>
                  <span className="dl-price">${selectedItem.price}</span>
                </div>

                <p className="dl-meta">
                  {selectedItem.category} • {selectedItem.condition}
                </p>

                <p className="dl-description">{selectedItem.description}</p>

                <div className="dl-detail-grid">
                  <div>
                    <strong>Location:</strong> {selectedItem.location}
                  </div>
                  <div>
                    <strong>Delivery:</strong> {selectedItem.deliveryOption}
                  </div>
                </div>

                <div className="dl-contact">
                  <span>{selectedItem.contactEmail}</span>
                  <span>{selectedItem.contactPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
