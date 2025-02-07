import { redirect } from "next/navigation";

import { createClient } from "@/app/utils/supabase/server";
import { logout } from "../../app/utils/actions/logout";
import { deleteAccount } from "../../app/utils/actions/deleteAccount";
import Link from "next/link";
import { IoChevronBackOutline } from "react-icons/io5";

export default async function Header({ button }: { button: boolean }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div>
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
      {button === true && (
        <div className="py-10 px-10">
          <Link href={"/"}>
            <div className="flex justify-center items-center gap-5 w-fit border-2 border-gray-100 py-2 px-3 rounded-lg hover:bg-blue-600 hover:text-white">
              <IoChevronBackOutline size={20} />
              <span className="font-medium"> Back to Home</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
