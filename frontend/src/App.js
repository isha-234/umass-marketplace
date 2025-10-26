import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerForm from "./components/SellerForm";

function App() {
  const [message, setMessage] = useState("");
  const [item, setItem] = useState(null);

  // Fetch message from backend root endpoint
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error("Backend not reachable:", err));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>UMass Marketplace POC</h1>

      {/* Backend connection check */}
      <p>Backend says: {message}</p>

      {/* Display item details after successful form submission */}
      {item && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#f5f5f5",
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            width: 350,
          }}
        >
          <h3>✅ Item Successfully Added:</h3>
          <p><strong>Name:</strong> {item.name}</p>
          <p><strong>Category:</strong> {item.category}</p>
          <p><strong>Price:</strong> ${item.price}</p>
          <p><strong>Description:</strong> {item.description}</p>
        </div>
      )}

      {/* Seller Form */}
      <div style={{ marginTop: 40 }}>
        <SellerForm onItemAdded={setItem} />
      </div>
    </div>
  );
}

export default App;
