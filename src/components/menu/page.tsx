"use client";
import FoodReviewApp from "@/pages/food-review-app/page";
import GoogleDriveLite from "@/pages/google-drive/page";
import MarkdownNotes from "@/pages/mark-down-notes-app/page";
import PokemonReviewApp from "@/pages/pokemon-review-app/page";
import TodoList from "@/pages/todo-list/page";
import { useState } from "react";

export default function Menu() {
  const [view, setView] = useState("");

  return (
    <div className=" flex justify-center w-full">
      {view === "" ? (
        <div className="w-[500px] h-[500px] grid grid-cols-2 gap-3 mt-28">
          <button
            onClick={() => setView("todo")}
            className=" font-medium bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-gray-200 flex justify-center items-center"
          >
            ToDo List App
          </button>
          <button
            onClick={() => setView("google")}
            className="font-medium bg-gray-100 hover:bg-gray-200 rounded-lg flex  border-2 border-gray-200 justify-center items-center"
          >
            Google Drive Lite App
          </button>
          <button
            onClick={() => setView("food")}
            className="bg-gray-100 font-medium hover:bg-gray-200 rounded-lg flex border-2 border-gray-200 justify-center items-center"
          >
            Food Review App
          </button>
          <button
            onClick={() => setView("pokemon")}
            className="bg-gray-100 font-medium hover:bg-gray-200 rounded-lg flex border-2 border-gray-200 justify-center items-center"
          >
            Pokemon Review App
          </button>
          <button
            onClick={() => setView("markdown")}
            className="bg-gray-100 font-medium hover:bg-gray-200 rounded-lg flex border-2 border-gray-200 justify-center items-center col-span-2"
          >
            Markdown Notes App
          </button>
        </div>
      ) : view === "todo" ? (
        <TodoList />
      ) : view === "google" ? (
        <GoogleDriveLite />
      ) : view === "food" ? (
        <FoodReviewApp />
      ) : view === "pokemon" ? (
        <PokemonReviewApp />
      ) : view === "markdown" ? (
        <MarkdownNotes />
      ) : (
        <div>No content.</div>
      )}
    </div>
  );
}
