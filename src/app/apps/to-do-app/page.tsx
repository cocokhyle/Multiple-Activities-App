import Header from "@/components/header/page";
import TodoList from "@/pages/todo-list/page";

export default function ToDoApp() {
  return (
    <div>
      <Header button={true} />
      <TodoList />
    </div>
  );
}
