import { logout } from "./actions";

export default function Logout() {
  return (
    <div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
