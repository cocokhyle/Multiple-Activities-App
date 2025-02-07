"use client";

import { useState, useEffect } from "react";
import { getTodos, addTodo, updateTodo, deleteTodo } from "./actions";
import { createClient } from "@/app/utils/supabase/client";

export default function TodoList() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [updatedTitle, setUpdatedTitle] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        setUserId(user.id);
        const todos = await getTodos(user.id);

        // Sort todos by creation date (newest to oldest)
        const sortedTodos = todos.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setTodos(sortedTodos);
      }
    };

    fetchUser();
  }, [newTodo]);

  console.log(todos);

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    if (!userId) return;
    const todo = await addTodo(userId, newTodo);
    if (todo) {
      setTodos([...todos, ...todo]);
    }
    alert("Added ToDo Successfully!");
    setNewTodo("");
  };

  const handleUpdateTodo = async (id: string, title: string) => {
    const currentTodo = todos.find((todo) => todo.id === id);
    if (currentTodo?.title === title) {
      alert("There is nothing to update.");
      return;
    }
    if (window.confirm("Are you sure you want to update this to-do?")) {
      const updatedTodo = await updateTodo(id, title);
      if (updatedTodo) {
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo[0] : todo)));
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this to-do?")) {
      await deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const handleChange = (id: string, value: string) => {
    setUpdatedTitle((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 w-full py-10 px-20">
      {/* upload images */}
      <h1 className="font-bold text-xl">TO-DO List</h1>
      <div className="w-[600px]">
        <div className="flex gap-5">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new to-do"
            className="p-2 border rounded w-full"
          />
          <button
            onClick={handleAddTodo}
            className="bg-blue-600 py-2 px-4 rounded h-fit text-white"
          >
            Add
          </button>
        </div>
        <ul className="py-10">
          {todos.map((todo) => (
            <li key={todo.id} className="flex gap-4 items-center">
              <div className="flex w-full gap-4 py-2">
                <input
                  type="text"
                  value={updatedTitle[todo.id] || todo.title} // Use updated value or fallback to todo.title
                  onChange={(e) => handleChange(todo.id, e.target.value)} // Update state on input change
                  className="p-2 border rounded flex-grow h-fit"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleUpdateTodo(
                        todo.id,
                        updatedTitle[todo.id] || todo.title
                      )
                    } // Call handleUpdateTodo on button click
                    className="bg-blue-600 py-2 px-4 rounded text-white"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="bg-red-600 py-2 px-4 rounded text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
