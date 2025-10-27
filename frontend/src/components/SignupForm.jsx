import React, { useState } from "react";
import axios from "axios";

export default function SignupForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.type === "email"
        ? "email"
        : e.target.type === "password"
        ? "password"
        : "name"]: e.target.value,
    });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page refresh
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/signup", // your FastAPI endpoint
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("✅ Signup successful! You can now log in.");
      console.log(res.data);
    } catch (err) {
      let errorMessage = "❌ Signup failed. Please try again."; // default message

      if (err.response) {
        const detail = err.response.data?.detail;
        if (detail === "User already exists") {
          errorMessage = "User already exists. Go to Sign-in Page.";
        } else if (detail === "UMass email required") {
          errorMessage = "UMass email required. Please enter your UMass email.";
        } else if (detail === "Password too short") {
          errorMessage = "Password too short. Must be at least 6 characters.";
        } else if (detail === "Invalid email format") {
          errorMessage = "Invalid email format. Please enter a valid email.";
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
