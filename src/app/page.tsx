import Image from "next/image";
import LoginPage from "./login/page";

import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/header/page";
import TodoList from "@/components/todo-list/page";
import GoogleDriveLite from "@/components/google-drive/page";
import FoodReviewApp from "@/components/food-review-app/page";
import PokemonReviewApp from "@/components/pokemon-review-app/page";
import MarkdownNotes from "@/components/mark-down-notes-app/page";
import Menu from "@/components/menu/page";

export default function Home() {
  return (
    <div>
      <Header button={false} />
      <Menu />
    </div>
  );
}
