import { redirect } from "next/navigation";

import { createClient } from "utils/supabase/server";
import Logout from "../logout/page";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div>
      <p>Hello {data.user.email}</p>
      <Logout />
    </div>
  );
}
