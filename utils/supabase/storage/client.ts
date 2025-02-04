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
  const bucketAndPathString = imageUrl.split("/storage/v1/object/public/")[1];
  const firstSlashIndex = bucketAndPathString.indexOf("/");

  const bucket = bucketAndPathString.slice(0, firstSlashIndex);
  const path = bucketAndPathString.slice(firstSlashIndex + 1);

  const storage = getStorage();

  const { data, error } = await storage.from(bucket).remove([path]);

  return { data, error };
};

export const updateImage = async (
  oldImageUrl: string,
  newFile: File,
  bucket: string
) => {
  await deleteImage(oldImageUrl); // Delete old image
  return await uploadImage({ file: newFile, bucket }); // Upload new image with same name
};
