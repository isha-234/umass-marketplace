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
      [e.target.type === "email" ? "email" : "password"]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      // Refresh user to pick up newly verified status after clicking email link.
      await cred.user.reload();
      const refreshedUser = auth.currentUser;
      if (!refreshedUser?.emailVerified) {
        // Ensure verification email exists; resend to be safe.
        await sendEmailVerification(cred.user);
        await signOut(auth);
        setMessage("Please verify your email. Check your inbox for the link, then sign in again.");
        return;
      }
      // Force fresh ID token with updated emailVerified claim.
      await refreshedUser.getIdToken(true);
      setMessage("Successfully logged in!");
      setTimeout(() => navigate("/home"), 600);
    } catch (err) {
      let errorMessage = "Invalid credentials or server error.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "User not found. Sign up first.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Enter a valid email.";
      }
      setMessage(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
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
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p>{message}</p>
    </form>
  );
}
