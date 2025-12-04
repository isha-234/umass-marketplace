import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./SellerCreateListing.css";

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

export default function SellerCreateListing() {
  const navigate = useNavigate();
  const { user, idToken } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    condition: "Good",
    description: "",
    location: "",
    deliveryOption: "Pickup",
    contactEmail: "",
    images: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        contactEmail: prev.contactEmail || user.email,
      }));
    }
  }, [user]);

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

    if (formData.price === "" || isNaN(Number(formData.price))) {
      errors.price = "Valid price is required.";
    } else if (Number(formData.price) < 0) {
      errors.price = "Price cannot be negative.";
    }

    if (!formData.category) errors.category = "Please choose a category.";

    if (!formData.contactEmail?.trim()) {
      errors.contactEmail = "Contact email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())
    ) {
      errors.contactEmail = "Enter a valid email.";
    }

    return errors;
  };

  // AI Assist: send current description + images to backend/LLM
  const handleAIAssist = async () => {
    const fd = new FormData();
    fd.append("description", formData.description);
    formData.images.forEach((file) => fd.append("images", file));

    try {
      const url = "http://127.0.0.1:8000/ai-assist";
      const res = await axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        setFormData((prev) => ({ ...prev, description: res.data.summary }));
      } else {
        setServerMessage("Failed to get AI Assist response.");
      }
    } catch (error) {
      setServerMessage("Error connecting to AI Assist service.");
    }
  };

  const handleSubmit = async (status) => {
    setServerMessage("");

    if (status === "published") {
      const errors = validate();
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }

    try {
      if (!idToken) {
        setServerMessage("You need to be signed in to create a listing.");
        return;
      }

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
      fd.append("status", status);

      formData.images.forEach((file, idx) =>
        fd.append("images", file, file.name || `image_${idx}.jpg`)
      );

      const url = "http://127.0.0.1:8000/listing/insert";
      const res = await axios.post(url, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (res.status === 200 || res.status === 201) {
        if (status === "draft") {
          setServerMessage("Draft saved.");
          navigate("/draft-listings");
        } else {
          setServerMessage("Listing published.");
          navigate("/my-listings");
        }
      } else {
        setServerMessage("Unexpected response from server.");
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setServerMessage(
              "Invalid listing input or duplicate. Please check your fields."
            );
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

  const mainImageURL = formData.images?.[0]
    ? URL.createObjectURL(formData.images[0])
    : require("./Imagetosell.png");

  return (
    <div className="seller-page">
      <div className="seller-layout">
        {/* LEFT: Header + Form */}
        <section className="seller-form-panel">
          <div className="seller-header">
            <div>
              <h2 className="mb-1">Create a Listing</h2>
              <small className="text-muted">
                Fill in the details for your item.
              </small>
            </div>
            <span className="badge text-bg-secondary fs-6 px-3 py-2">
              Seller
            </span>
          </div>

          {serverMessage && (
            <div className="alert alert-info mt-3" role="alert">
              {serverMessage}
            </div>
          )}

          <form className="seller-form">
            {/* Item name */}
            <div>
              <label htmlFor="title" className="form-label">
                Item Name
              </label>
              <input
                type="text"
                id="title"
                className={`form-control ${
                  formErrors.title ? "is-invalid" : ""
                }`}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Study Table"
              />
              {formErrors.title && (
                <div className="invalid-feedback">{formErrors.title}</div>
              )}
            </div>

            {/* Price + Category */}
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <label htmlFor="price" className="form-label">
                  Price (USD)
                </label>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  className={`form-control ${
                    formErrors.price ? "is-invalid" : ""
                  }`}
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 120"
                />
                {formErrors.price && (
                  <div className="invalid-feedback">{formErrors.price}</div>
                )}
              </div>

              <div className="col-12 col-sm-6">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  className={`form-select ${
                    formErrors.category ? "is-invalid" : ""
                  }`}
                  value={formData.category}
                  onChange={handleSelect}
                >
                  <option value="">Choose…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <div className="invalid-feedback">{formErrors.category}</div>
                )}
              </div>
            </div>

            {/* Condition + Delivery */}
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <label htmlFor="condition" className="form-label">
                  Condition
                </label>
                <select
                  id="condition"
                  className="form-select"
                  value={formData.condition}
                  onChange={handleSelect}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6">
                <label htmlFor="deliveryOption" className="form-label">
                  Delivery Option
                </label>
                <select
                  id="deliveryOption"
                  className="form-select"
                  value={formData.deliveryOption}
                  onChange={handleSelect}
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            {/* Description + AI Assist */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="description" className="form-label mb-0">
                  Description
                </label>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleAIAssist}
                >
                  Use AI Assist
                </button>
              </div>

              <textarea
                id="description"
                rows={4}
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Key details, dimensions, accessories, defects, etc."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="form-label">
                Location (meetup)
              </label>
              <input
                type="text"
                id="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Campus Center, Library, ISB"
              />
            </div>

            {/* Contact */}
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="contactEmail" className="form-label">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  className={`form-control ${
                    formErrors.contactEmail ? "is-invalid" : ""
                  }`}
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="netid@umass.edu"
                />
                {formErrors.contactEmail && (
                  <div className="invalid-feedback">
                    {formErrors.contactEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            <div>
              <label htmlFor="images" className="form-label">
                Photos
              </label>
              <input
                type="file"
                id="images"
                className="form-control"
                accept="image/*"
                multiple
                onChange={handleImages}
              />
              <div className="form-text">
                First image will be used as the cover photo.
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={() => handleSubmit("published")}
              >
                {submitting ? "Publishing…" : "Publish Listing"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                disabled={submitting}
                onClick={() => handleSubmit("draft")}
              >
                Save Draft
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
        </section>

        {/* RIGHT: Preview */}
        <aside className="seller-preview-panel">
          <div className="card shadow-sm listing-preview-card">
            <img
              src={mainImageURL}
              className="card-img-top"
              alt={formData.title || "Preview"}
            />
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="card-title mb-0">
                  {formData.title || "Listing title"}
                </h5>
                <span className="badge text-bg-success">
                  {formData.price
                    ? `$${Number(formData.price).toFixed(2)}`
                    : "$0.00"}
                </span>
              </div>

              <p className="text-muted mb-2">
                {formData.category || "Category"} • {formData.condition}
              </p>

              <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                {formData.description || "Your description will appear here."}
              </p>

              <p className="text-muted small mb-0">
                {formData.location
                  ? `Meet at: ${formData.location}`
                  : "Set a meetup location"}
              </p>
            </div>
          </div>

          {formData.images?.length > 1 && (
            <div className="mt-3 d-flex flex-wrap gap-2">
              {formData.images.slice(0, 10).map((f, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(f)}
                  alt={`thumb-${i}`}
                  style={{
                    width: 86,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
