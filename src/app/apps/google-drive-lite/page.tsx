import Header from "@/components/header/page";
import GoogleDriveLite from "@/pages/google-drive/page";

export default function GoogleDrive() {
  return (
    <div>
      <Header button={true} />
      <GoogleDriveLite />
    </div>
  );
}
