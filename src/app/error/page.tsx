"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div>
      <p>Please confirm your email before logging in!</p>
      <Link href={"/login"}>Back to login</Link>
    </div>
  );
}
