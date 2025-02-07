import Header from "@/components/header/page";
import MarkdownNotes from "@/pages/mark-down-notes-app/page";

export default function MarkDown() {
  return (
    <div>
      <Header button={true} />
      <MarkdownNotes />
    </div>
  );
}
