import React from "react";

export default function LoginForm() {
  return (
    <form>
      <h1>Sign in</h1>
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      <a href="#">Forgot your password?</a>
      <button type="submit">Sign In</button>
    </form>
  );
}
