"use client";

import Image from "next/image";
import { useEffect, useState, ChangeEvent, useRef, useTransition } from "react";
import { createClient } from "utils/supabase/client";
import {
  deleteImage,
  updateImage,
  uploadImage,
} from "utils/supabase/storage/client"; // Import the update function
import { convertBlobUrlToFile } from "@/lib/utils";

const supabase = await createClient();

const ImageGallery = () => {
  const [images, setImages] = useState<
    { url: string; name: string; path: string; timestamp: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageToUpdate, setImageToUpdate] = useState<string | null>(null); // Image to update
  const [uploadImageButton, setUploadImageButton] = useState(false);

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
          bucket: "google-drive-lite", // The storage bucket name
        });

        if (error) {
          console.error(error);
          return;
        }

        // Push the uploaded image URL to the array
        urls.push(imageUrl);
        alert("Succesfully Uploaded!");
      }

      setImageUrls([]); // Clear the images after upload
    });
  };

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from("google-drive-lite")
        .list();

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      // Fetch image URLs and names
      const imagesData = data.map((file) => {
        const url = supabase.storage
          .from("google-drive-lite")
          .getPublicUrl(file.name).data.publicUrl;

        const timestamp = parseInt(file.name.split("-")[0], 10) || 0;
        return {
          url,
          name: file.name.replace(/_/g, " "),
          path: file.name, // File path
          timestamp, // Add timestamp for sorting by date
        };
      });

      setImages(imagesData);
    };

    fetchImages();
  }, [images]);

  //Handle delete Image
  const handleDelete = async (imageUrl: string) => {
    // Extract the image name from the URL
    const urlParts = imageUrl.split("/");
    const imageName = urlParts[urlParts.length - 1]; // Get the last part of the URL

    if (!imageName) {
      console.error("Could not extract image name from URL");
      return;
    }

    // Delete the image from storage
    const { error: storageError } = await deleteImage(imageUrl);

    if (storageError) {
      console.error("Error deleting image:", storageError);
      return;
    }

    setImages(images.filter((image) => image.url !== imageUrl));

    // Delete all reviews that contain the image URL

    alert("Deleted Successfully!");
  };

  //Handle update image
  const handleUpdate = async () => {
    if (!selectedImage || !imageToUpdate) {
      console.error("No image selected for update.");
      alert("No image selected for update.");
      return;
    }

    const imageToDeleteUrl = images.find(
      (image) => image.path === imageToUpdate
    )?.url;

    if (!imageToDeleteUrl) {
      console.error("Image URL not found.");
      return;
    }

    const { error } = await updateImage(
      imageToDeleteUrl,
      selectedImage,
      "google-drive-lite"
    );

    if (error) {
      console.error("Error updating image:", error);
    } else {
      // After successful update, immediately update the state with the new image URL
      const updatedImageUrl = supabase.storage
        .from("google-drive-lite")
        .getPublicUrl(selectedImage.name).data.publicUrl;

      setImages((prevImages) =>
        prevImages.map((image) =>
          image.path === imageToUpdate
            ? {
                ...image,
                url: updatedImageUrl, // Set the updated image URL
                name: selectedImage.name, // Update the name
                path: selectedImage.name, // Update the path
              }
            : image
        )
      );

      alert("Updated Successfully!");

      if (error) {
        console.error("Error updating database:", error);
      }

      setImageToUpdate(null);
      setSelectedImage(null);
    }
  };

  // Function to handle sorting images
  const sortImages = (
    images: { url: string; name: string; path: string; timestamp: number }[]
  ) => {
    if (sortBy === "name") {
      return [...images].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "date") {
      return [...images].sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp
    }
    return images;
  };

  // Filter images by search query
  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get sorted images
  const sortedImages = sortImages(filteredImages);

  return (
    <div className="min-h-screen flex flex-col gap-8 w-full py-10  px-20">
      {/* upload images */}
      <h1 className="font-bold text-xl">Google Drive Lite</h1>
      {uploadImageButton && (
        <div className="w-full py-32 flex flex-col gap-5 items-center justify-center ">
          <h1 className="font-bold">Select Images</h1>
          <div className="w-fit h-fit rounded-lg border-2 border-dashed border-gray-600 p-2">
            {imageUrls.length === 0 ? (
              <div className="bg-slate-200 w-[500px] h-[300px] rounded-md flex justify-center items-center ">
                <input
                  type="file"
                  hidden
                  multiple
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  disabled={isPending}
                />

                <button
                  className="flex flex-col items-center justify-center"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isPending}
                >
                  <svg
                    className="w-8 h-8 mb-4 text-gray-700 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <span className="font-semibold">Click to upload</span>
                  <span>SVG, PNG, JPG or GIF</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center gap-4">
                {imageUrls.map(({ url, name }, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Image
                      src={url}
                      width={200}
                      height={0}
                      alt={`img-${index}`}
                    />
                    <span>{name}</span> {/* Display the original file name */}
                  </div>
                ))}
                <button
                  onClick={() => {
                    setUploadImageButton(false);
                    handleClickUploadImagesButton();
                  }}
                  className="bg-blue-600 py-2 w-40 rounded-lg text-white font-semibold"
                  disabled={isPending}
                >
                  {isPending ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}
          </div>
          <button
            className="bg-blue-600 py-2 px-4 rounded h-fit text-white"
            onClick={(e) => setUploadImageButton(false)}
          >
            Cancel
          </button>
        </div>
      )}
      {/* Update Image */}
      {imageToUpdate && (
        <div className="flex justify-center items-center">
          <div className=" flex gap-5 items-center">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files) {
                  setSelectedImage(e.target.files[0]);
                }
              }}
              className="p-2 border rounded"
            />
            <button
              onClick={handleUpdate}
              className="bg-blue-600 py-2 px-4 rounded h-fit text-white"
            >
              Update
            </button>
            <button
              className="bg-blue-600 py-2 px-4 rounded h-fit text-white"
              onClick={(e) => setUploadImageButton(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Conten starting here */}
      {!uploadImageButton && !imageToUpdate && (
        <div className="flex flex-col gap-5">
          <div className="flex gap-5 justify-between items-center w-full">
            <div className="flex gap-5">
              <input
                type="text"
                placeholder="Search..."
                className="mb-4 p-2 border rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex justify-center items-center gap-4 mb-4 w-fit">
                <h1>Sort by:</h1>
                <button
                  onClick={() => setSortBy("name")}
                  className={`py-1 px-4 rounded ${
                    sortBy === "name"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy("date")}
                  className={`py-1 px-4 rounded ${
                    sortBy === "date"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  Date
                </button>
              </div>
            </div>
            <button
              className="bg-blue-500 py-2 px-4 rounded h-fit text-white"
              onClick={(e) => setUploadImageButton(true)}
            >
              Upload Image
            </button>
          </div>

          <div className="grid grid-cols-3  gap-4">
            {sortedImages.map(({ url, name, path }) => (
              <div
                key={path}
                className="items-center bg-slate-200 py-8 px-5 rounded-lg"
              >
                <div className="flex flex-col gap-5 items-center justify-center">
                  <span className="w-full text-start">{name}</span>
                  <Image src={url} width={200} height={0} alt={name} />
                  <div className="flex gap-5">
                    <button
                      onClick={() => handleDelete(url)}
                      className="bg-red-600 text-white py-1 px-3 mt-2 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setImageToUpdate(path)}
                      className="bg-yellow-500 text-white py-1 px-3 mt-2 rounded"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
