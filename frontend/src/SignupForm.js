import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function SignupForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Enforce campus-only accounts up front.
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
      // Create user first; Firebase will return structured errors for common cases.
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Require email verification before first login; send link then sign out.
      await sendEmailVerification(cred.user, {
        url: process.env.REACT_APP_EMAIL_VERIFICATION_REDIRECT ||
             "http://localhost:3000/auth",
        handleCodeInApp: false,
      });

      await signOut(auth); // clear session until verification is complete
      setMessage("Verification Link Sent! Check your email to verify.");
      setTimeout(() => navigate("/auth"), 1200);

    } catch (err) {
      let errorMessage = "Signup failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email already registered. Try signing in instead.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Choose a stronger password.";
      }
      setMessage(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
