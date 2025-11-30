import React, { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import SellerCreateListing from "./SellerCreateListing";
import Listings from "./Listings";
import AuthLogin from "./AuthLogin";
import "./App.css";
import HomePage from "./HomePage";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-title">UMass Marketplace</h1>
      <p className="home-subtitle">Backend says: {message}</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sell/new" element={<SellerCreateListing />} />
        <Route path="/auth" element={<AuthLogin />} />
      </Routes>
    </div>
  );
}

export default App;
