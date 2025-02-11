"use client";

import { useState } from "react";
import { login } from "../utils/actions/login";
import { signup } from "../utils/actions/signUp";
import { MdOutlineMail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { GoKey } from "react-icons/go";
import { TfiEmail } from "react-icons/tfi";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      if (result.error === "Email not confirmed") {
        setError("Please verify your email by checking your Gmail inbox.");
      }
      setMessage(null);
    } else {
      setError(null);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }

  async function handleSignup(formData: FormData) {
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setMessage(null);
    } else {
      setError(null);
      setMessage("Signup successful! Please verify your email now.");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white py-20 px-20 rounded-lg border-2 border-gray-200 w-fit">
        {isSignup ? (
          // Signup Form
          <form className="flex flex-col gap-5 w-[300px]">
            <h2 className="font-bold w-full text-center">Sign Up</h2>
            <div className="flex w-full gap-2 justify-center items-center">
              <input
                className="py-1 px-2 border-2 font-thin border-gray-200 rounded-lg w-full"
                id="email"
                name="email"
                type="email"
                placeholder="juan@delacruz.com"
                required
              />
            </div>
            <div className="flex  w-full gap-2 justify-center items-center">
              <input
                className="py-1 px-2 border-2 border-gray-200 rounded-lg w-full"
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            {error && (
              <p className="font-thin" style={{ color: "red" }}>
                {error}
              </p>
            )}
            {message && <p style={{ color: "green" }}>{message}</p>}
            <div className="w-full flex items-center justify-center py-5">
              <button
                className="bg-blue-600 rounded-lg py-2 w-full font-semibold text-white"
                type="button"
                onClick={(e) =>
                  handleSignup(new FormData(e.currentTarget.form!))
                }
              >
                Sign up
              </button>
            </div>
            <p className="w-full text-center">
              Already have an account?{" "}
              <button
                className="font-medium text-blue-600"
                type="button"
                onClick={() => setIsSignup(false)}
              >
                Log in
              </button>
            </p>
          </form>
        ) : (
          // Login Form
          <form className="flex flex-col gap-5  w-[300px]">
            <h2 className="font-bold w-full text-center">Login</h2>
            <div className="flex w-full gap-2 justify-center items-center">
              <input
                className="py-1 px-2 border-2 font-thin border-gray-200 rounded-lg w-full"
                id="email"
                name="email"
                type="email"
                placeholder="juan@delacruz.com"
                required
              />
            </div>
            <div className="flex  w-full gap-2 justify-center items-center">
              <input
                className="py-1 px-2 border-2 border-gray-200 rounded-lg w-full"
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            {error && (
              <p className="font-thin" style={{ color: "red" }}>
                {error}
              </p>
            )}
            {message && <p style={{ color: "green" }}>{message}</p>}
            <div className="w-full flex items-center justify-center py-5">
              <button
                className="bg-blue-600 rounded-lg py-2 w-full font-semibold text-white"
                type="button"
                onClick={(e) =>
                  handleLogin(new FormData(e.currentTarget.form!))
                }
              >
                Log in
              </button>
            </div>
            <p className="w-full text-center">
              Don't have an account?{" "}
              <button
                className="font-medium text-blue-600"
                type="button"
                onClick={() => setIsSignup(true)}
              >
                Signup
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
