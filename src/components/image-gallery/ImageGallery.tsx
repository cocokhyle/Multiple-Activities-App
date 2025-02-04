"use client";

import { useEffect, useState } from "react";
import { createClient } from "utils/supabase/client";
import { deleteImage, updateImage } from "utils/supabase/storage/client"; // Import the update function

const supabase = await createClient();

const ImageGallery = () => {
  const [images, setImages] = useState<
    { url: string; name: string; path: string; timestamp: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageToUpdate, setImageToUpdate] = useState<string | null>(null); // Image to update

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

        // Assuming the filename contains a timestamp (e.g., 1645012312-image-name.png)
        const timestamp = parseInt(file.name.split("-")[0], 10) || 0; // Extract timestamp from filename

        return {
          url,
          name: file.name,
          path: file.name, // File path
          timestamp, // Add timestamp for sorting by date
        };
      });

      setImages(imagesData);
    };

    fetchImages();
  }, [images]); // Adding `images` as a dependency will trigger re-fetching when images state changes.

  const handleDelete = async (imageUrl: string) => {
    console.log("Attempting to delete image with URL:", imageUrl);

    // Ensure you pass the full URL to deleteImage
    const { data, error } = await deleteImage(imageUrl);

    if (error) {
      console.error("Error deleting image:", error);
    } else {
      setImages(images.filter((image) => image.url !== imageUrl));
    }
  };

  const handleUpdate = async () => {
    if (!selectedImage || !imageToUpdate) {
      console.error("No image selected for update.");
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
    <div className="min-h-screen flex justify-center items-center flex-col gap-8">
      <input
        type="text"
        placeholder="Search by photo name"
        className="mb-4 p-2 border rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setSortBy("name")}
          className={`py-1 px-4 rounded ${
            sortBy === "name" ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          Sort by Name
        </button>
        <button
          onClick={() => setSortBy("date")}
          className={`py-1 px-4 rounded ${
            sortBy === "date" ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          Sort by Date
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sortedImages.map(({ url, name, path }) => (
          <div key={path} className="flex flex-col items-center">
            <img src={url} alt={name} className="w-full h-auto rounded-lg" />
            <span>{name}</span>
            <button
              onClick={() => handleDelete(url)}
              className="bg-red-600 text-white py-1 px-3 mt-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => setImageToUpdate(path)} // Set image for update
              className="bg-yellow-500 text-white py-1 px-3 mt-2 rounded"
            >
              Update
            </button>
          </div>
        ))}
      </div>

      {/* Update Image */}
      {imageToUpdate && (
        <div className="mt-4">
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
            className="ml-4 bg-green-600 text-white py-1 px-3 rounded"
          >
            Update Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
