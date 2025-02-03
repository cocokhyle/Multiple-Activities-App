import { redirect } from "next/navigation";

import { createClient } from "utils/supabase/server";
import { logout } from "../../app/actions/logout";
import { deleteAccount } from "../../app/actions/deleteAccount";

export default async function Header() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex py-5 px-10 justify-between shadow-lg">
      <p>Hello {data.user.email}</p>
      <div className="flex gap-5">
        <button onClick={logout}>Logout</button>
        <button onClick={deleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}
