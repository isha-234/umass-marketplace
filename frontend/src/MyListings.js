import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Listings.css";
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
                  <img
                    src={`${BACKEND_URL}${item.images[0]}`}
                    alt={item.title}
                  />
                ) : (
                  <div className="image-placeholder">No photo</div>
                )}
              </div>

              {/* Details */}
              <div className="card-body">
                <div className="card-top">
                  <h3>{item.title}</h3>
                  <span className="price">${item.price}</span>
                </div>

                <p className="meta">
                  {item.category} • {item.condition}
                </p>

                <p className="description">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>


      {/* ===========================
          MODAL
      ============================ */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>

            <div className="modal-content">
              <div className="modal-image">
                {selectedImage ? (
                  <img src={selectedImage} alt={selectedItem.title} />
                ) : (
                  <div className="image-placeholder">No photo</div>
                )}

                {selectedItem.images?.length > 1 && (
                  <div className="modal-thumbs">
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

              <div className="modal-details">
                <div className="modal-header">
                  <h2>{selectedItem.title}</h2>
                  <span className="price">${selectedItem.price}</span>
                </div>

                <p className="meta">
                  {selectedItem.category} • {selectedItem.condition}
                </p>

                <p className="description">{selectedItem.description}</p>

                <div className="detail-grid">
                  <div>
                    <strong>Location:</strong> {selectedItem.location}
                  </div>
                  <div>
                    <strong>Delivery:</strong> {selectedItem.deliveryOption}
                  </div>
                </div>

                <div className="contact">
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
