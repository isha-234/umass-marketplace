// src/Listings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Listings.css";
import ChatModal from "./ChatModal";
import { getAuth } from "firebase/auth";
import { useAuth } from "./AuthContext";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function Listings() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [conditionOptions, setConditionOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [saveStatus, setSaveStatus] = useState({});

  // Chat-related state
  const [conversationId, setConversationId] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Axios instance with Firebase auth header
  const getAuthAxios = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Not logged in");
    }

    const token = await user.getIdToken();

    return axios.create({
      baseURL: BACKEND_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Fetch categories once for the filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/listing/categories`);
        const cats = res.data?.categories ?? [];
        setCategoryOptions(cats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch conditions once for the filter dropdown
  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/listing/conditions`);
        const conds = res.data?.conditions ?? [];
        setConditionOptions(conds);
      } catch (err) {
        console.error("Error fetching conditions:", err);
      }
    };
    fetchConditions();
  }, []);

  // Fetch listings whenever filters/search/sort change
  useEffect(() => {
    let active = true;

    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/listing/all`, {
          params: {
            q: search || undefined,
            category: category || undefined,
            condition: condition || undefined,
            sort,
          },
        });
        if (!active) return;
        setItems(res.data);
        setError("");
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
  }, [search, category, condition, sort]);

  // Fetch saved items for the logged-in user
  useEffect(() => {
    let active = true;
    const fetchSaved = async () => {
      if (!user) {
        setSaveStatus({});
        return;
      }
      try {
        const ax = await getAuthAxios();
        const res = await ax.get("/saved-items");
        if (!active) return;
        const ids = res.data?.itemIds || [];
        const statusMap = {};
        ids.forEach((id) => {
          statusMap[id] = "saved";
        });
        setSaveStatus((prev) => ({ ...prev, ...statusMap }));
      } catch (err) {
        // not logged in or fetch failed; keep silent
      }
    };
    fetchSaved();
    return () => {
      active = false;
    };
  }, [user]);

  // Close modal on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openDetails = (item) => {
    setSelectedItem(item);
    setSelectedImage(
      item.images?.[0] ? `${BACKEND_URL}${item.images[0]}` : ""
    );
  };

  const handleSaveListing = async (item, e) => {
    if (e) e.stopPropagation();
    const listingId = item._id;
    const alreadySaved = saveStatus[listingId] === "saved";
    try {
      setSaveStatus((s) => ({ ...s, [listingId]: "saving" }));
      const ax = await getAuthAxios();
      if (alreadySaved) {
        await ax.delete("/saved-items", { data: { listingId } });
        setSaveStatus((s) => ({ ...s, [listingId]: "unsaved" }));
      } else {
        await ax.post("/saved-items", { listingId });
        setSaveStatus((s) => ({ ...s, [listingId]: "saved" }));
      }
    } catch (err) {
      console.error("Error saving item:", err);
      const detail = err.response?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d.detail).filter(Boolean).join("\n")
            : alreadySaved
              ? "Could not unsave. Please try again."
              : "Could not save. Please log in and try again.";
      alert(msg);
      setSaveStatus((s) => ({ ...s, [listingId]: "error" }));
    }
  };

  // Start or reuse a conversation for this listing
  const handleContactSeller = async (item, e) => {
    if (e) e.stopPropagation();

    try {
      const ax = await getAuthAxios();
      const res = await ax.post("/conversations/start", {
        listing_id: item._id,
      });

      // ensure selected item is set (used by ChatModal title)
      setSelectedItem(item);
      setConversationId(res.data.id);
      setChatOpen(true);
    } catch (err) {
      console.error("Error starting conversation:", err);

      let msg = "Could not start chat. Please make sure you are logged in.";
      if (err.message === "Not logged in") {
        msg = "Please log in to contact the seller.";
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      alert(msg);
    }
  };

  return (
    <div className="listings-page">
      {/* Hero */}
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

      {/* Filters + Grid */}
      <section className="listings-grid-section">
        <div className="filter-bar">
          <input
            type="search"
            placeholder="Search title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={category || ""}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Category</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={condition || ""}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Condition</option>
            {conditionOptions.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </div>

        {loading && <div className="muted">Loading listings…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="muted">No listings yet. Be the first to post!</div>
        )}

        <div className="listings-grid">
          {items.map((item) => (
            <article
              key={item._id}
              className="listing-card"
              onClick={() => openDetails(item)}
            >
              <button
                className={`save-btn ${saveStatus[item._id] === "saved" ? "saved" : ""}`}
                onClick={(e) => handleSaveListing(item, e)}
                title={saveStatus[item._id] === "saved" ? "Saved (click to unsave)" : "Save for later"}
              >
                {saveStatus[item._id] === "saved" ? "♥" : "♡"}
              </button>
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

                <div className="card-actions">
                  <button
                    className="btn-primary-sm"
                    onClick={(e) => handleContactSeller(item, e)}
                  >
                    Contact seller
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Details Modal */}
      {selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
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
                          className={url === selectedImage ? "active" : ""}
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

                <div className="modal-actions">
                  <button
                    className="btn-primary"
                    onClick={(e) => handleContactSeller(selectedItem, e)}
                  >
                    Contact seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {conversationId && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          conversationId={conversationId}
          listing={selectedItem}
        />
      )}
    </div>
  );
}
