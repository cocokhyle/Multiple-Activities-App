"use client";

import { uploadImage } from "utils/supabase/storage/food-review-app/client";
import { ChangeEvent, useRef, useState, useTransition } from "react";
import { convertBlobUrlToFile } from "@/lib/utils";
import Image from "next/image";
import ImageGallery from "@/components/image-gallery/food-review-app/ImageGallery";

export default function FoodReviewApp() {
  const [imageUrls, setImageUrls] = useState<{ url: string; name: string }[]>(
    []
  );

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Create an array of objects containing the file's URL and name
      const filesWithNames = filesArray.map((file) => ({
        url: URL.createObjectURL(file), // Blob URL for preview
        name: file.name, // Capture the original file name here
      }));

      // Set the file URLs and names in state
      setImageUrls(filesWithNames);
    }
  };

  const [isPending, startTransition] = useTransition();

  const handleClickUploadImagesButton = async () => {
    startTransition(async () => {
      let urls = [];

      // Iterate over the image URLs and original file names
      for (const { url, name } of imageUrls) {
        // Pass the original file name and the Blob URL to convertBlobUrlToFile
        const imageFile = await convertBlobUrlToFile(url, name);

        const { imageUrl, error } = await uploadImage({
          file: imageFile,
          bucket: "food-review-app", // The storage bucket name
        });

        if (error) {
          console.error(error);
          return;
        }

        // Push the uploaded image URL to the array
        urls.push(imageUrl);
      }

      setImageUrls([]); // Clear the images after upload
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-8">
      <input
        type="file"
        hidden
        multiple
        ref={imageInputRef}
        onChange={handleImageChange}
        disabled={isPending}
      />

      <button
        className="bg-slate-600 py-2 w-40 rounded-lg"
        onClick={() => imageInputRef.current?.click()}
        disabled={isPending}
      >
        Select Images
      </button>

      <div className="flex gap-4">
        {imageUrls.map(({ url, name }, index) => (
          <div key={index} className="flex flex-col items-center">
            <Image src={url} width={300} height={300} alt={`img-${index}`} />
            <span>{name}</span> {/* Display the original file name */}
          </div>
        ))}
      </div>

      <button
        onClick={handleClickUploadImagesButton}
        className="bg-slate-600 py-2 w-40 rounded-lg"
        disabled={isPending}
      >
        {isPending ? "Uploading..." : "Upload Images"}
      </button>
      <h1 className="text-2xl font-bold mb-4">Image Gallery</h1>
      <ImageGallery />
    </div>
  );
}
