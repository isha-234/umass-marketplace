import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Books",
  "Clothing",
  "Appliances",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function SellerCreateListing(props) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    condition: "Good",
    description: "",
    location: "",
    deliveryOption: "Pickup", 
    contactEmail: "",
    contactPhone: "",
    images: [], 
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelect = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);

    const chosen = files.slice(0, 10);
    setFormData((prev) => ({ ...prev, images: chosen }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = "Item name is required.";
    if (formData.price === "" || isNaN(Number(formData.price))) errors.price = "Valid price is required.";
    if (Number(formData.price) < 0) errors.price = "Price cannot be negative.";
    if (!formData.category) errors.category = "Please choose a category.";
    if (!formData.contactEmail && !formData.contactPhone) {
      errors.contact = "Provide at least one contact method (email or phone).";
    }
    if (formData.contactPhone && !/^\d{10}$/.test(formData.contactPhone)) {
      errors.contactPhone = "Phone must be 10 digits (numbers only).";
    }
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = "Enter a valid email.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage("");

    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("price", String(formData.price));
      fd.append("category", formData.category);
      fd.append("condition", formData.condition);
      fd.append("description", formData.description.trim());
      fd.append("location", formData.location.trim());
      fd.append("deliveryOption", formData.deliveryOption);
      fd.append("contactEmail", formData.contactEmail.trim());
      fd.append("contactPhone", formData.contactPhone.trim());
      formData.images.forEach((file, idx) => fd.append("images", file, file.name || `image_${idx}.jpg`));

      // TODO: adjust to your backend route
      const url = "http://localhost:5050/listing/insert";
      const res = await axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200 || res.status === 201) {
        setServerMessage("Listing created successfully.");
        navigate("/my-listings");
      } else {
        setServerMessage("Unexpected response from server.");
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setServerMessage("Invalid listing input or duplicate. Please check your fields.");
            break;
          case 401:
            setServerMessage("You must be logged in to create a listing.");
            break;
          case 413:
            setServerMessage("Images too large. Try smaller files.");
            break;
          case 500:
            setServerMessage("Server error. Please try again later.");
            break;
          default:
            setServerMessage("An unknown error occurred.");
        }
      } else {
        setServerMessage("Error: Could not connect to the server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const mainImageURL = formData.images?.[0] ? URL.createObjectURL(formData.images[0]) : require('./Imagetosell.png');

  return (
    <div className="container mt-4" style={{ maxWidth: "980px" }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <h2 className="m-0">Create a Listing</h2>
        <span className="badge text-bg-secondary">Seller</span>
      </div>

      {serverMessage && (
        <div className="alert alert-info" role="alert">
          {serverMessage}
        </div>
      )}

      <div className="row g-4">
        {/* Form column */}
        <div className="col-12 col-lg-7">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Item Name</label>
              <input
                type="text"
                id="title"
                className={`form-control ${formErrors.title ? "is-invalid" : ""}`}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Study Table"
              />
              {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6">
                <label htmlFor="price" className="form-label">Price (USD)</label>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  className={`form-control ${formErrors.price ? "is-invalid" : ""}`}
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 120"
                />
                {formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
              </div>
              <div className="col-12 col-sm-6">
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  className={`form-select ${formErrors.category ? "is-invalid" : ""}`}
                  value={formData.category}
                  onChange={handleSelect}
                >
                  <option value="">Choose…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {formErrors.category && <div className="invalid-feedback">{formErrors.category}</div>}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6">
                <label htmlFor="condition" className="form-label">Condition</label>
                <select id="condition" className="form-select" value={formData.condition} onChange={handleSelect}>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label htmlFor="deliveryOption" className="form-label">Delivery Option</label>
                <select id="deliveryOption" className="form-select" value={formData.deliveryOption} onChange={handleSelect}>
                  <option value="Pickup">Pickup</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location (meetup)</label>
              <input
                type="text"
                id="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Campus Center, Library, ISB"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                rows={4}
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Key details, dimensions, accessories, defects, etc."
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6">
                <label htmlFor="contactEmail" className="form-label">Contact Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  className={`form-control ${formErrors.contactEmail ? "is-invalid" : ""}`}
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="netid@umass.edu"
                />
                {formErrors.contactEmail && <div className="invalid-feedback">{formErrors.contactEmail}</div>}
              </div>
              <div className="col-12 col-sm-6">
                <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  id="contactPhone"
                  className={`form-control ${formErrors.contactPhone ? "is-invalid" : ""}`}
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="10 digits"
                />
                {formErrors.contactPhone && <div className="invalid-feedback">{formErrors.contactPhone}</div>}
              </div>
            </div>

            {formErrors.contact && (
              <div className="alert alert-warning py-2" role="alert">{formErrors.contact}</div>
            )}

            <div className="mb-3">
              <label htmlFor="images" className="form-label">Photos </label>
              <input
                type="file"
                id="images"
                className="form-control"
                accept="image/*"
                multiple
                onChange={handleImages}
              />
              <div className="form-text">First image will be used as the cover photo.</div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Publishing…" : "Publish Listing"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Preview column */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <img src={mainImageURL} className="card-img-top" alt={formData.title || "Preview"} />
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="card-title mb-0">{formData.title || "Listing title"}</h5>
                <span className="badge text-bg-success">{formData.price ? `$${Number(formData.price).toFixed(2)}` : "$0.00"}</span>
              </div>
              <p className="text-muted mb-2">
                {formData.category || "Category"} • {formData.condition}
              </p>
              <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                {formData.description || "Your description will appear here."}
              </p>
              <p className="text-muted small mb-0">
                {formData.location ? `Meet at: ${formData.location}` : "Set a meetup location"}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          {formData.images?.length > 1 && (
            <div className="mt-3 d-flex flex-wrap gap-2">
              {formData.images.slice(0, 10).map((f, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(f)}
                  alt={`thumb-${i}`}
                  style={{ width: 86, height: 64, objectFit: "cover", borderRadius: 8 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
