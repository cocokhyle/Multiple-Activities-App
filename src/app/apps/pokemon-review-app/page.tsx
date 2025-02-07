import Header from "@/components/header/page";
import PokemonReviewApp from "@/components/pokemon-review-app/page";
import TodoList from "@/components/todo-list/page";

export default function PokemonApp() {
  return (
    <div>
      <Header button={true} />
      <PokemonReviewApp />
    </div>
  );
}
