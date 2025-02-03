"use client";

import { useState } from "react";
import { createClient } from "utils/supabase/client";

export default function SignUpPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else if (data.user?.identities?.length === 0) {
      setErrorMsg("User already registered");
    } else {
      setSuccessMsg("Success! Please check your inbox.");
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button type="submit">Sign up</button>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
    </form>
  );
}
