"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div>
      <p>Something went wrong!</p>
      <Link href={"/login"}>Back to login</Link>
    </div>
  );
}
