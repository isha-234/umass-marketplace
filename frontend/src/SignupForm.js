import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const key = name || (type === "email" ? "email" : type === "password" ? "password" : "name");
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.email.toLowerCase().endsWith("@umass.edu")) {
      setMessage("Please use your UMass email address.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Send verification email with redirect back to auth screen.
      const verificationSettings = {
        url: process.env.REACT_APP_EMAIL_VERIFICATION_REDIRECT || "http://localhost:3000/auth",
        handleCodeInApp: false,
      };
      await sendEmailVerification(cred.user, verificationSettings);
      // Sign out immediately so the session isn't treated as logged in before verification.
      await signOut(auth);
      setMessage("Verification Link Sent! Check your email to verify, then log in.");
      setTimeout(() => navigate("/auth"), 1200);
    } catch (err) {
      let errorMessage = "Signup failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email already registered. Try signing in instead.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Choose a stronger password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid UMass email.";
      }
      setMessage(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Account</h1>
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        value={form.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        value={form.password}
        onChange={handleChange}
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Re-enter Password"
        required
        value={form.confirmPassword}
        onChange={handleChange}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Verify Email"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
