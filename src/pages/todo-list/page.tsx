"use client";

import { useState, useEffect } from "react";
import { getTodos, addTodo, updateTodo, deleteTodo } from "./actions";
import { createClient } from "utils/supabase/client";

export default function TodoList() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

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
        setTodos(todos);
      }
    };

    fetchUser();
  }, []);

  console.log(todos);

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    if (!userId) return;
    const todo = await addTodo(userId, newTodo);
    if (todo) {
      setTodos([...todos, ...todo]);
    }
    setNewTodo("");
  };

  const handleUpdateTodo = async (id: string, title: string) => {
    const currentTodo = todos.find((todo) => todo.id === id);
    if (currentTodo.title === title) {
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

  return (
    <div>
      <h1>TO-DO List</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add new to-do"
      />
      <button onClick={handleAddTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="text"
              value={todo.title}
              onChange={(e) => {
                const updatedTodos = todos.map((t) =>
                  t.id === todo.id ? { ...t, title: e.target.value } : t
                );
                setTodos(updatedTodos);
              }}
              onBlur={(e) => handleUpdateTodo(todo.id, e.target.value)}
            />
            <button onClick={() => handleUpdateTodo(todo.id, todo.title)}>
              Update
            </button>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
