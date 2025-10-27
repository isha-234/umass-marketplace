import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import "./App.css";

export default function App() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className={`container ${isSignUp ? "right-panel-active" : ""}`}>

      <div className="form-container sign-up-container">
        <SignupForm />
      </div>


      <div className="form-container sign-in-container">
        <LoginForm />
      </div>


      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>Please login with your UMass email</p>
            <button className="ghost" onClick={() => setIsSignUp(false)}>
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Welcome to UMass Marketplace!</h1>
            <p>Enter your UMass email to get started!</p>
            <button className="ghost" onClick={() => setIsSignUp(true)}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}