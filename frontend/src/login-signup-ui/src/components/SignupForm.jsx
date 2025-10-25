import React from "react";

export default function SignupForm() {
  return (
    <form>
      <h1>Create Account</h1>
      <input type="text" placeholder="Name" required />
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}