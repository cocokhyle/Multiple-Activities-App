import Link from "next/link";

export default function Menu() {
  return (
    <div className=" flex justify-center w-full">
      <div className="w-[500px] h-[500px] grid grid-cols-2 gap-3 mt-28">
        <Link
          href={"/apps/to-do-app"}
          className=" font-medium bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-gray-200 flex justify-center items-center"
        >
          ToDo List App
        </Link>
        <Link
          href={"/apps/google-drive-lite"}
          className="font-medium bg-gray-100 hover:bg-gray-200 rounded-lg flex  border-2 border-gray-200 justify-center items-center"
        >
          Google Drive Lite App
        </Link>
        <Link
          href={"/apps/food-review-app"}
          className="bg-gray-100 font-medium hover:bg-gray-200 rounded-lg flex border-2 border-gray-200 justify-center items-center"
        >
          Food Review App
        </Link>
        <Link
          href={"/apps/pokemon-review-app"}
          className="bg-gray-100 font-medium hover:bg-gray-200 rounded-lg flex border-2 border-gray-200 justify-center items-center"
        >
          Pokemon Review App
        </Link>
        <Link
          href={"/apps/markdown-notes-app"}
          className="bg-gray-100 font-medium hover:bg-gray-200 rounded-lg flex border-2 border-gray-200 justify-center items-center col-span-2"
        >
          Markdown Notes App
        </Link>
      </div>
    </div>
  );
}
