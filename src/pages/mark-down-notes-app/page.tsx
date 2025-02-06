"use client";

import { useState, useEffect } from "react";
import { getNotes, addNote, updateNote, deleteNote } from "./actions";
import { createClient } from "utils/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // Syntax highlighting style
import { MdDeleteOutline } from "react-icons/md";
import { SlNote } from "react-icons/sl";

export default function MarkdownNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<{
    [key: string]: "raw" | "preview";
  }>({});
  const [updatedContent, setUpdatedContent] = useState<{
    [key: string]: string;
  }>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null); // Track the selected note ID

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
        const notes = await getNotes(user.id);

        // Sort notes by creation date (newest to oldest)
        const sortedNotes = notes.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNotes(sortedNotes);
      }
    };

    fetchUser();
  }, [notes]);

  const handleAddNote = async () => {
    if (!userId) return;

    const note = await addNote(userId, "Untitled");
    if (note) {
      setNotes([note, ...notes]);
      setSelectedNoteId(note.id); // Select the newly created note
    }
    alert("Added Note Successfully!");
  };

  const handleUpdateNote = async (noteId: string, newContent: string) => {
    if (!userId) return;

    const updatedNote = await updateNote(noteId, userId, newContent);
    if (updatedNote) {
      setNotes(notes.map((note) => (note.id === noteId ? updatedNote : note)));
    }
    alert("Updated Note Successfully!");
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!userId) return;

    const deletedNote = await deleteNote(noteId, userId);
    if (deletedNote) {
      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null); // Clear selection if the deleted note was selected
      }
    }
    alert("Deleted Note Successfully!");
  };

  const handleChange = (id: string, value: string) => {
    setUpdatedContent((prev) => ({ ...prev, [id]: value }));
  };

  const toggleViewMode = (noteId: string, mode: "raw" | "preview") => {
    setViewModes((prev) => ({ ...prev, [noteId]: mode }));
  };

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) || notes[0]; // Get the selected note

  return (
    <div className="h-screen flex flex-col items-center gap-8 w-full py-10 px-20">
      <h1 className="font-bold text-xl w-full text-start">Markdown Notes</h1>

      <div className="grid grid-cols-3 h-full w-full">
        {/* Sidebar */}
        <div className="col-span-1 flex flex-col items-start border-2 border-solid border-gray-100 py-3">
          <h1 className="p-5 font-bold text-2xl">Notes</h1>
          <div className="flex w-full justify-between px-5">
            <div></div>
            <div>
              <button
                onClick={handleAddNote}
                className="bg-blue-600 py-2 px-4 rounded text-white p-5 flex items-center gap-2"
              >
                Add Notes
                <SlNote />
              </button>
            </div>
          </div>
          <div className="py-5 w-full">
            {notes.map((note) => (
              <button
                className={`hover:bg-blue-300 py-3 px-5 w-full text-start ${
                  selectedNoteId === note.id ? "bg-blue-200" : ""
                }`}
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)} // Set the selected note ID
              >
                {note.content.split("\n")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full col-span-2 border-2 border-solid border-gray-100 p-3">
          {selectedNote ? (
            <div className="w-full mt-4">
              <div className="flex justify-between py-5 px-5">
                <div className="flex gap-2 ">
                  <button
                    onClick={() => toggleViewMode(selectedNote.id, "raw")}
                    className={`px-4 py-2 rounded ${
                      viewModes[selectedNote.id] === "raw" ||
                      viewModes[selectedNote.id] === undefined
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => toggleViewMode(selectedNote.id, "preview")}
                    className={`px-4 py-2 rounded  ${
                      viewModes[selectedNote.id] === "preview"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Preview
                  </button>
                </div>
                <div className="flex gap-2 ">
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="bg-red-600 py-2 px-4 rounded text-white"
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
              {viewModes[selectedNote.id] === "preview" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  className="prose markdown px-5"
                >
                  {updatedContent[selectedNote.id] || selectedNote.content}
                </ReactMarkdown>
              ) : (
                <pre className="p-2 bg-gray-100 rounded">
                  <div className="w-full">
                    <textarea
                      value={
                        updatedContent[selectedNote.id] || selectedNote.content
                      }
                      onChange={(e) =>
                        handleChange(selectedNote.id, e.target.value)
                      }
                      onBlur={() =>
                        handleUpdateNote(
                          selectedNote.id,
                          updatedContent[selectedNote.id] ||
                            selectedNote.content
                        )
                      }
                      className="p-2 border rounded w-full h-52"
                    />
                  </div>
                </pre>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select a note to view or edit.</p>
          )}
        </div>
      </div>
    </div>
  );
}
