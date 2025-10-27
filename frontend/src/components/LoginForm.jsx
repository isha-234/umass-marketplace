import React, { useState } from "react";
import axios from "axios";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.type === "email" ? "email" : "password"]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/login", // or "/api/login" if proxy is set
        new URLSearchParams({
          username: form.email,
          password: form.password,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      //Token: ${res.data.access_token}
      setMessage(`Succesfully Logged in! `); //
    } catch (err) {
      let errorMessage = "Invalid Credentials or Server Error."; // default message

      if (err.response) {
        const detail = err.response.data?.detail;
        if (detail === "User not found") {
          errorMessage = "User not Found. Sign up first!";
        } else if (detail === "Incorrect password") {
          errorMessage = "Incorrect password. Please try again!";
        } 
      }

      setMessage(errorMessage);
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      <input type="email" placeholder="Email" required onChange={handleChange} />
      <input type="password" placeholder="Password" required onChange={handleChange} />
      <a href="#">Forgot your password?</a>
      <button type="submit">Sign In</button>
      <p>{message}</p>
    </form>
  );
}
