export async function convertBlobUrlToFile(
  blobUrl: string,
  originalFileName: string
) {
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  // Use the original file name passed as an argument
  const mimeType = blob.type || "application/octet-stream";

  // Create the file with the original file name
  const file = new File([blob], originalFileName, {
    type: mimeType,
  });

  return file;
}
