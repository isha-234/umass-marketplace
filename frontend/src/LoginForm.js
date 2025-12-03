import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.type]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);

      await cred.user.reload();
      const refreshed = auth.currentUser;

      if (!refreshed?.emailVerified) {
        await sendEmailVerification(cred.user);
        await signOut(auth);
        setMessage("Please verify your email. Check your inbox for the link.");
        return;
      }

      await refreshed.getIdToken(true);
      setMessage("Successfully logged in!");
      setTimeout(() => navigate("/home"), 600);

    } catch (err) {
      let errorMessage = "Invalid credentials.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "User not found. Sign up first.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
