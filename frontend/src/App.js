// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function App() {
//   const [message, setMessage] = useState("");
//   const [item, setItem] = useState(null);

//   useEffect(() => {
//     axios.get("http://127.0.0.1:8000/")  // FastAPI base endpoint
//       .then(res => setMessage(res.data.message))
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>UMass Marketplace POC</h1>
//       <p>Backend says: {message}</p>
//       {item && <p>Inserted item: {item.name}</p>}
//     </div>
//   );
// }

// export default App;

// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, Link } from "react-router-dom";

// Import the seller page you added earlier
import SellerCreateListing from "./SellerCreateListing";

function Home() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/") // FastAPI base endpoint
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);
  return (
    <div className="container py-4">
      <h1 className="mb-3">UMass Marketplace POC</h1>
      <p className="mb-0">Backend says: {message || "…"}</p>
    </div>
  );
}

function App() {
  return (
    <>
      {/* Simple Navbar */}
      <nav className="navbar navbar-expand-lg bg-light border-bottom">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">UMass Marketplace</Link>
          <div className="ms-auto d-flex gap-2">
            <Link className="btn btn-outline-secondary" to="/">Home</Link>
            <Link className="btn btn-primary" to="/sell/new">Create Listing</Link>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sell/new" element={<SellerCreateListing />} />
      </Routes>
    </>
  );
}

export default App;

