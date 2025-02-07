import Header from "@/components/header/page";
import PokemonReviewApp from "@/pages/pokemon-review-app/page";
import TodoList from "@/pages/todo-list/page";

export default function PokemonApp() {
  return (
    <div>
      <Header button={true} />
      <PokemonReviewApp />
    </div>
  );
}
