import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Listings() {
  const [items, setItems] = useState([]);
  const BACKEND_URL = "http://127.0.0.1:8000"; 

  useEffect(() => {
    axios.get(`${BACKEND_URL}/listing/all`)
      .then(res => setItems(res.data))
      .catch(err => console.error("Error fetching listings:", err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">All Listings</h2>
      <div className="row g-4">
        {items.map(item => (
          <div key={item._id} className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-sm">
              {/* Cover image */}
              {item.images?.[0] ? (
                <img
                  src={`${BACKEND_URL}${item.images[0]}`}
                  className="card-img-top"
                  alt={item.title}
                  style={{ height: 200, objectFit: "cover" }}
                />
              ) : (
                <div style={{ height: 200, backgroundColor: "#f0f0f0" }} />
              )}

              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{item.title}</h5>
                  <span className="badge text-bg-success">${item.price}</span>
                </div>

                <p className="text-muted mb-1">{item.category} • {item.condition}</p>
                <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{item.description}</p>

                {/* Thumbnails */}
                {item.images?.length > 1 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {item.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={`${BACKEND_URL}${img}`}
                        alt={`thumb-${idx}`}
                        style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
