import { redirect } from "next/navigation";

import { createClient } from "utils/supabase/server";
import { logout } from "../actions/logout";
import { deleteAccount } from "../actions/deleteAccount";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div>
      <p>Hello {data.user.email}</p>
      <button onClick={logout}>Logout</button>
      <button onClick={deleteAccount}>Delete Account</button>
    </div>
  );
}
