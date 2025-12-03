import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ✅ Add this

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();                // ✅ Initialize

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.type === "email" ? "email" : "password"]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/login",
        new URLSearchParams({
          username: form.email,
          password: form.password,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      setMessage("Successfully Logged in!");

      // ✅ Redirect to homepage after 1 second
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      let errorMessage = "Invalid Credentials or Server Error";
      if (err.response) {
        const detail = err.response.data?.detail;
        if (detail === "User not found") {
          errorMessage = "User not Found. Sign up first!";
        } else if (detail === "Incorrect password") {
          errorMessage = "Incorrect password. Please try again.";
        }
      }
      setMessage(errorMessage);
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      <input
        type="email"
        placeholder="Email"
        required
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder="Password"
        required
        onChange={handleChange}
      />
      <button type="submit">Sign In</button>
      <p>{message}</p>
    </form>
  );
}
