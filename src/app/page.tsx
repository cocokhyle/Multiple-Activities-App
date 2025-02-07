import Image from "next/image";
import LoginPage from "./login/page";

import { createClient } from "utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/header/page";
import TodoList from "@/pages/todo-list/page";
import GoogleDriveLite from "@/pages/google-drive/page";
import FoodReviewApp from "@/pages/food-review-app/page";
import PokemonReviewApp from "@/pages/pokemon-review-app/page";
import MarkdownNotes from "@/pages/mark-down-notes-app/page";
import Menu from "@/components/menu/page";

export default function Home() {
  return (
    <div>
      <Header button={false} />
      <Menu />
    </div>
  );
}
