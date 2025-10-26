import React, { useState } from "react";

function SellerForm({ onItemAdded }) {
  const [item_name, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("item_name", item_name);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("price", price);
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      const res = await fetch("http://127.0.0.1:8000/submit-item", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Item submitted successfully!");
        alert(data.status + " - " + data.item_name);

        // 🟢 Update parent (App.js)
        if (onItemAdded) {
          onItemAdded({
            name: data.item_name,
            category: data.category,
            price: data.price,
            description: data.description,
          });
        }

        // Reset form
        setItemName("");
        setCategory("");
        setDescription("");
        setPrice("");
        setImages([]);
      } else {
        setStatus("❌ Submission failed: " + data.status);
      }
    } catch (err) {
      console.error("Error submitting item:", err);
      setStatus("❌ Network or server error");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 10, width: 300 }}>
      <h2>Seller Form</h2>

      <input
        type="text"
        placeholder="Item Name"
        value={item_name}
        onChange={(e) => setItemName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <input
        type="file"
        multiple
        onChange={(e) => setImages(e.target.files)}
        required
      />
      <button type="submit" style={{ padding: "8px 12px", cursor: "pointer" }}>
        Submit Item
      </button>

      {status && <p>{status}</p>}
    </form>
  );
}

export default SellerForm;
