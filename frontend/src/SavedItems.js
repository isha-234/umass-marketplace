import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./Listings.css";
import { useAuth } from "./AuthContext";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function SavedItems() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <div className="listings-page">
      <section className="listings-hero">
        <div className="hero-content">
          <p className="eyebrow">Saved</p>
          <h1>Your saved items</h1>
          <p className="subtitle">Items you bookmarked for later.</p>
        </div>
      </section>

      <section className="listings-grid-section">
        {loading && <div className="muted">Loading saved items…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="muted">No saved items yet.</div>
        )}
        <div className="listings-grid">
          {items.map((item) => (
            <article key={item._id} className="listing-card">
              <div className="image-wrapper">
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
                <p className="meta">
                  {item.category} • {item.condition}
                </p>
                <p className="description">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
