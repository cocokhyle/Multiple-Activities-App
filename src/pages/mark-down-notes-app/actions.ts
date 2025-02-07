import { createClient } from "@/app/utils/supabase/client";

export const addNote = async (userId: string, content: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notes")
    .insert([{ user_id: userId, content }])
    .single();

  if (error) {
    console.error("Error adding note:", error);
    return null;
  }

  return data;
};

export const updateNote = async (
  noteId: string,
  userId: string,
  newContent: string
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notes")
    .update({ content: newContent })
    .eq("id", noteId)
    .eq("user_id", userId) // Ensure the user can only update their own note
    .single();

  if (error) {
    console.error("Error updating note:", error);
    return null;
  }

  return data;
};

export const deleteNote = async (noteId: string, userId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId) // Ensure the user can only delete their own note
    .single();

  if (error) {
    console.error("Error deleting note:", error);
    return null;
  }

  return data;
};

export const getNotes = async (userId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId) // Fetch notes that belong to the authenticated user
    .order("created_at", { ascending: false }); // Sort notes by creation date, newest first

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  return data;
};
