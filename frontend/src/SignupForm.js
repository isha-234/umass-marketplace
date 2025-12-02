import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // ✅ Add this

export default function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();               // ✅ Initialize

  const handleChange = (e) => {
    const { type, value } = e.target;
    setForm({
      ...form,
      [type === "email" ? "email" : type === "password" ? "password" : "name"]:
        value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/signup",
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage("Signup successful! Redirecting...");

      // ✅ Redirect to homepage after signup success
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      let errorMessage = "Signup failed. Please try again.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (detail === "User already exists") {
          errorMessage = "User already exists. Go to Sign-in Page.";
        } else if (detail === "UMass email required") {
          errorMessage = "Please use your UMass email.";
        }
      }
      setMessage(errorMessage);
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Account</h1>
      <input
        type="text"
        placeholder="Name"
        required
        value={form.name}
        onChange={handleChange}
      />
      <input
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={form.password}
        onChange={handleChange}
      />
      <button type="submit">Sign Up</button>
      {message && <p>{message}</p>}
    </form>
  );
}
