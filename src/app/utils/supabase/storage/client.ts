import { createClient } from "../client";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

function getStorage() {
  const { storage } = createClient();
  return storage;
}

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
};
export const uploadImage = async ({ file, bucket, folder }: UploadProps) => {
  // Replace spaces with underscores in the original file name

  let fileName = file.name.replace(/\s+/g, "_");
  const path = `${folder ? folder + "/" : ""}${fileName}`;

  try {
    // Compress the image file before uploading
    file = await imageCompression(file, { maxSizeMB: 1 });
  } catch (error) {
    console.error("Image compression failed", error);
    return { imageUrl: "", error: "Image compression failed" };
  }

  const storage = getStorage();

  // Ensure the file does not already exist to avoid conflicts
  await storage.from(bucket).remove([path]);

  // Upload the file with the original file name
  const { data, error } = await storage.from(bucket).upload(path, file, {
    upsert: true, // Allows overwrites to prevent renaming
  });

  if (error) {
    console.error("Image upload failed", error);
    return { imageUrl: "", error: "Image upload failed" };
  }

  // Construct and return the correct public URL for the image
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

  return { imageUrl, error: "" };
};

export const deleteImage = async (imageUrl: string) => {
  // Check if the imageUrl contains the expected substring
  const splitParts = imageUrl.split("/storage/v1/object/public/");

  if (splitParts.length < 2) {
    console.error("Error: Invalid image URL format", imageUrl);
    return { error: "Invalid image URL format" };
  }

  const bucketAndPathString = splitParts[1]; // Extract the bucket and path part
  const firstSlashIndex = bucketAndPathString.indexOf("/");

  if (firstSlashIndex === -1) {
    console.error("Error: No path found in image URL", imageUrl);
    return { error: "No path found in image URL" };
  }

  const bucket = bucketAndPathString.slice(0, firstSlashIndex);
  const path = bucketAndPathString.slice(firstSlashIndex + 1);

  const storage = getStorage();

  // Log the bucket and path for debugging
  // console.log("Bucket:", bucket, "Path:", path);

  const { data, error } = await storage.from(bucket).remove([path]);

  return { data, error };
};

export const updateImage = async (
  oldImageUrl: string,
  newFile: File,
  bucket: string
) => {
  try {
    // Delete the old image
    await deleteImage(oldImageUrl);

    // Upload the new image with the same name
    const { imageUrl, error } = await uploadImage({ file: newFile, bucket });

    if (error) {
      return { error: error };
    }

    return { imageUrl, error }; // return the imageUrl and error from the uploadImage function
  } catch (error) {
    console.error("Error updating image:", error);
    return { error: "Error updating image" };
  }
};
