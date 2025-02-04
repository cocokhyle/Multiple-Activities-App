import Image from "next/image";
import LoginPage from "./login/page";

import { createClient } from "utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/header/page";
import TodoList from "@/pages/todo-list/page";
import GoogleDriveLite from "@/pages/google-drive/page";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div>
      <Header />
      <GoogleDriveLite />
    </div>
  );
}
