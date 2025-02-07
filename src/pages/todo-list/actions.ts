"use server";

import { createClient } from "@/app/utils/supabase/server";

export async function getTodos(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data;
}

export async function addTodo(userId: string, title: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .insert([{ user_id: userId, title }]);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTodo(id: string, title: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .update({ title })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return data;
}
