"use client";

import { useEffect, useState } from "react";
import { createClient } from "utils/supabase/client";
import {
  deleteImage,
  updateImage,
} from "utils/supabase/storage/food-review-app/client"; // Import the update function

const supabase = await createClient();

const ImageGallery = () => {
  const [images, setImages] = useState<
    { url: string; name: string; path: string; timestamp: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageToUpdate, setImageToUpdate] = useState<string | null>(null); // Image to update
  const [reviews, setReviews] = useState<
    Record<string, { id: string; user_email: string; review: string }[]>
  >({});

  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const [editingReview, setEditingReview] = useState<Record<string, string>>(
    {}
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        if (user.email) {
          setUserEmail(user.email);
        }
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from("food-review-app")
        .list();

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      // Fetch image URLs and names
      const imagesData = data.map((file) => {
        const url = supabase.storage
          .from("food-review-app")
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
  }, [images]);

  //fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("food_reviews")
          .select("id, user_email, image_name, review");

        if (error) throw error;

        const reviewsMap: Record<
          string,
          { id: string; user_email: string; review: string }[]
        > = {};

        data.forEach(({ id, image_name, user_email, review }) => {
          if (!reviewsMap[image_name]) reviewsMap[image_name] = [];
          reviewsMap[image_name].push({ id, user_email, review });
        });

        setReviews(reviewsMap);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  //Handle Save Review
  const handleSaveReview = async (imageName: string) => {
    if (!reviewText[imageName]) {
      alert("Please enter a review before saving.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userEmail = user?.email;

      if (!userEmail) {
        alert("User not logged in!");
        return;
      }

      const { data, error } = await supabase
        .from("food_reviews")
        .insert([
          {
            user_email: userEmail,
            image_name: imageName,
            review: reviewText[imageName],
          },
        ])
        .select();

      if (error) throw error;

      setReviews((prevReviews) => ({
        ...prevReviews,
        [imageName]: [
          ...(prevReviews[imageName] || []),
          {
            id: data[0].id,
            user_email: userEmail,
            review: reviewText[imageName],
          },
        ],
      }));

      setReviewText((prev) => ({ ...prev, [imageName]: "" }));

      alert("Review saved successfully!");
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Error saving review");
    }
  };

  //Handle Update review
  const handleUpdateReview = async (reviewId: string, imageName: string) => {
    const updatedReview = editingReview[reviewId];
    if (!updatedReview.trim()) {
      alert("Review cannot be empty.");
      return;
    }

    try {
      const { error } = await supabase
        .from("food_reviews")
        .update({ review: updatedReview })
        .eq("id", reviewId);

      if (error) throw error;

      setReviews((prevReviews) => ({
        ...prevReviews,
        [imageName]: prevReviews[imageName].map((r) =>
          r.id === reviewId ? { ...r, review: updatedReview } : r
        ),
      }));

      setEditingReview((prev) => {
        const updatedState = { ...prev };
        delete updatedState[reviewId];
        return updatedState;
      });

      alert("Review updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Error updating review");
    }
  };

  //Handle delete reviews
  const handleDeleteReview = async (reviewId: string, imageName: string) => {
    try {
      const { error } = await supabase
        .from("food_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      setReviews((prevReviews) => ({
        ...prevReviews,
        [imageName]: prevReviews[imageName].filter((r) => r.id !== reviewId),
      }));

      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review");
    }
  };

  //Handle delete Image
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

  //Handle delete image
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
      "food-review-app"
    );

    if (error) {
      console.error("Error updating image:", error);
    } else {
      // After successful update, immediately update the state with the new image URL
      const updatedImageUrl = supabase.storage
        .from("food-review-app")
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

            {/* Display reviews under the image */}
            <div className="mt-2 w-full p-2 border rounded bg-gray-100">
              <h3 className="font-semibold">Reviews:</h3>
              {reviews[name]?.length > 0 ? (
                reviews[name].map(({ id, user_email, review }) => (
                  <div key={id} className="p-1 border-b">
                    <p className="text-sm text-gray-600">{user_email}</p>
                    {userEmail !== user_email && (
                      <p className="text-gray-800">{review}</p>
                    )}
                    {userEmail === user_email && (
                      <div>
                        <input
                          type="text"
                          defaultValue={review}
                          onBlur={(e) =>
                            setEditingReview({
                              ...editingReview,
                              [id]: e.target.value,
                            })
                          }
                          className="border rounded p-1 text-gray-800 w-full"
                        />
                        <div>
                          <button
                            onClick={() => handleUpdateReview(id, name)}
                            className="bg-blue-600 text-white py-1 px-3 mt-2 rounded"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteReview(id, name)}
                            className="bg-red-600 text-white py-1 px-3 mt-2 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              )}
            </div>

            {/* Review input field */}
            <textarea
              value={reviewText[name] || ""}
              onChange={(e) =>
                setReviewText({ ...reviewText, [name]: e.target.value })
              }
              placeholder="Write a review..."
              className="mt-2 p-2 border rounded w-full"
            />
            <button
              onClick={() => handleSaveReview(name)}
              className="bg-blue-600 text-white py-1 px-3 mt-2 rounded"
            >
              Save Review
            </button>

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
