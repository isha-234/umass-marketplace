import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./DraftListings.css";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";


const BACKEND_URL = "http://127.0.0.1:8000";

export default function SavedItems() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const getAuthAxios = async () => {
    const auth = getAuth();
    const current = auth.currentUser;
    if (!current) throw new Error("Not logged in");
    const token = await current.getIdToken();
    return axios.create({
      baseURL: BACKEND_URL,
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  useEffect(() => {
    let active = true;
    const fetchSaved = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const ax = await getAuthAxios();
        const res = await ax.get("/saved-items/listings");
        if (!active) return;
        setItems(res.data?.items || []);
        setError("");
      } catch (err) {
        if (!active) return;
        console.error("Error fetching saved items:", err);
        setError("Could not load saved items.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSaved();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="dl-listings-page">
      <section className="dl-listings-hero">
        <div className="dl-hero-content">
          <p className="dl-eyebrow">Saved</p>
          <h1>Your saved items</h1>
          <p className="dl-subtitle">Items you bookmarked for later.</p>
        </div>
      </section>

      <section className="dl-listings-grid-section">
        {loading && <div className="dl-muted">Loading saved items…</div>}
        {error && <div className="dl-error">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="dl-muted">No saved items yet.</div>
        )}
        <div className="dl-listings-grid">
          {items.map((item) => (
            <article
              key={item._id}
              className="dl-listing-card"
              onClick={() => {
                setSelectedItem(item);
                setSelectedImage(
                  item.images?.[0] ? `${BACKEND_URL}${item.images[0]}` : ""
                );
              }}
            >
              <div className="dl-image-wrapper">
                {item.images?.[0] ? (
                  <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                ) : (
                  <div className="dl-image-placeholder">No photo</div>
                )}
              </div>

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

        {/* Modal */}
    {selectedItem && (
      <div className="dl-modal-overlay" onClick={() => setSelectedItem(null)}>
        <div className="dl-modal-card" onClick={(e) => e.stopPropagation()}>

          <button className="dl-close-btn" onClick={() => setSelectedItem(null)}>×</button>

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
                        className={url === selectedImage ? "active" : ""}
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
                <div><strong>Location:</strong> {selectedItem.location}</div>
                <div><strong>Delivery:</strong> {selectedItem.deliveryOption}</div>
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
