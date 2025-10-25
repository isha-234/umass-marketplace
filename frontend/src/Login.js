import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await axios.post("http://127.0.0.1:8000/login", new URLSearchParams({
      username: form.email,
      password: form.password
    }));
    localStorage.setItem("token", res.data.access_token);
    alert("Login successful!");
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 40 }}>
      <h2>Login</h2>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <button type="submit">Login</button>
    </form>
  );
}
