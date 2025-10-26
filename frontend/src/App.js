import React, { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, Link } from "react-router-dom";
import SellerCreateListing from "./SellerCreateListing";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-3">UMass Marketplace POC</h1>
      <p className="mb-0">Backend says: {message}</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light border-bottom">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">UMass Marketplace</Link>
          <div className="ms-auto d-flex gap-2">
            <Link className="btn btn-outline-secondary" to="/">Home</Link>
            <Link className="btn btn-primary" to="/sell/new">Create Listing</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sell/new" element={<SellerCreateListing />} />
      </Routes>
    </div>
  );
}

export default App;