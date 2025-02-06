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
    <div className="flex py-5 px-10 justify-between border-2 border-gray-100 font-medium">
      <p className="">Hello {data.user.email}</p>
      <div className="flex gap-5">
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded-lg"
          onClick={logout}
        >
          Logout
        </button>
        <button
          className="px-3 py-2 bg-red-600 text-white rounded-lg"
          onClick={deleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
