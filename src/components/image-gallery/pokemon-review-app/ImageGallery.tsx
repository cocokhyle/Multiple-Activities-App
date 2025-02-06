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
import { HiDotsVertical } from "react-icons/hi";

const supabase = await createClient();

const ImageGallery = () => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [images, setImages] = useState<
    { url: string; name: string; path: string; timestamp: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageToUpdate, setImageToUpdate] = useState<string | null>(null); // Image to update
  const [uploadImageButton, setUploadImageButton] = useState(false);
  const [reviews, setReviews] = useState<
    Record<string, { id: string; user_email: string; review: string }[]>
  >({});

  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const [editingReview, setEditingReview] = useState<Record<string, string>>(
    {}
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{ url: string; name: string }[]>(
    []
  );
  const [openImageMenuId, setOpenImageMenuId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const toggleImageMenu = (id: string) => {
    setOpenImageMenuId(openImageMenuId === id ? null : id); // Ensure both are strings
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id); // Ensure both are strings
  };
  const startEditing = (id: string) => {
    setEditingReviewId(id);

    setOpenMenuId(null); // Close menu when editing starts
  };

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
          bucket: "pokemon-review-app", // The storage bucket name
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
        .from("pokemon-review-app")
        .list();

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      // Fetch image URLs and names
      const imagesData = data.map((file) => {
        const url = supabase.storage
          .from("pokemon-review-app")
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

  //fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("pokemon_reviews")
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
        .from("pokemon_reviews")
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
        .from("pokemon_reviews")
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
        .from("pokemon_reviews")
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
    const { error: deleteError } = await supabase
      .from("pokemon_reviews")
      .delete()
      .like("image_name", `%${imageName.replace(/_/g, " ")}%`); // Ensure "imageUrl" is the correct column name

    alert("Deleted Successfully!");

    if (deleteError) {
      console.error("Error deleting reviews:", deleteError);
    }
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
      "pokemon-review-app"
    );

    if (error) {
      console.error("Error updating image:", error);
    } else {
      // After successful update, immediately update the state with the new image URL
      const updatedImageUrl = supabase.storage
        .from("pokemon-review-app")
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

      const { data, error } = await supabase
        .from("pokemon_reviews")
        .update({ image_name: selectedImage.name })
        .match({ image_name: imageToUpdate.replace(/_/g, " ") });

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
    <div className="min-h-screen flex flex-col gap-8 w-full py-10 px-20">
      {/* upload images */}
      <h1 className="font-bold text-xl">Pokemon Review App</h1>
      {uploadImageButton && (
        <div className="w-full py-32 flex flex-col gap-5 items-center justify-center ">
          <h1 className="font-bold">Select Images</h1>
          <div className="w-fit h-fit rounded-lg border-2 border-dashed border-gray-600 p-2">
            {imageUrls.length === 0 ? (
              <div className="bg-gray-100 w-[500px] h-[300px] rounded-md flex justify-center items-center ">
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
            onClick={() => setUploadImageButton(false)}
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
              onClick={() => setImageToUpdate(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Conten starting here */}
      {!uploadImageButton && !imageToUpdate && (
        <div className="flex flex-col gap-5">
          <div className="flex  gap-5 justify-between items-center w-full">
            <div className="flex  gap-5">
              <input
                type="text"
                placeholder="Search..."
                className="px-2 border rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex justify-center  gap-4 w-fit h-full">
                <h1>Sort by:</h1>
                <button
                  onClick={() => setSortBy("name")}
                  className={`py-1 px-4 rounded ${
                    sortBy === "name"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy("date")}
                  className={`py-1 px-4 rounded ${
                    sortBy === "date"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  Date
                </button>
              </div>
            </div>
            <button
              className="bg-blue-600 py-1 px-4 rounded-md text-white"
              onClick={(e) => setUploadImageButton(true)}
            >
              Upload Image
            </button>
          </div>

          {/* Contents */}
          <div className="flex flex-col  gap-4 justify-center items-center">
            {sortedImages.map(({ url, name, path }) => (
              <div
                key={path}
                className="grid grid-cols-2 items-center bg-gray-100 p-5 rounded-lg w-full"
              >
                <div className="flex flex-col  relative h-full">
                  <div className="w-full flex justify-start items-center gap-5 ">
                    <button className="" onClick={() => toggleImageMenu(name)}>
                      <HiDotsVertical size={20} />
                    </button>
                    <span className="w-full text-start">{name}</span>
                  </div>
                  {openImageMenuId === name && (
                    <div className="absolute left-3 py-1 mt-10 flex flex-col bg-white shadow-lg  rounded-md">
                      <button
                        onClick={() => handleDelete(url)}
                        className="  py-1 px-3  hover:bg-gray-100"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setImageToUpdate(path)}
                        className="  py-1 px-3  rounded hover:bg-gray-100"
                      >
                        Update
                      </button>
                    </div>
                  )}
                  <div className="w-full h-full flex justify-center items-center">
                    <Image src={url} width={200} height={0} alt={name} />
                  </div>
                </div>

                {/* Display reviews under the image */}
                <div>
                  <div className="mt-2 w-full px-2 py-5 border rounded bg-white h-[200px] overflow-auto">
                    <h3 className="font-semibold">Reviews:</h3>
                    {reviews[name]?.length > 0 ? (
                      reviews[name].map(({ id, user_email, review }) => (
                        <div key={id} className="p-1  border-b">
                          <p className="text-sm text-gray-600">{user_email}</p>
                          {userEmail !== user_email && (
                            <p className="text-gray-800">{review}</p>
                          )}
                          {userEmail === user_email && (
                            <div>
                              <div className="relative flex">
                                <div className="flex justify-between w-full items-center">
                                  <div>
                                    {editingReviewId === id ? (
                                      <>
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
                                        <div className="flex gap-5">
                                          <button
                                            onClick={() => {
                                              handleUpdateReview(id, name);
                                              setEditingReviewId(null);
                                            }}
                                            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
                                          >
                                            Update
                                          </button>
                                          <button
                                            onClick={() =>
                                              setEditingReviewId(null)
                                            }
                                            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-gray-800">{review}</p>
                                    )}
                                  </div>
                                  {editingReviewId !== id && (
                                    <button
                                      onClick={() => toggleMenu(id)}
                                      className="font-bold text-[20px]"
                                    >
                                      <HiDotsVertical />
                                    </button>
                                  )}
                                </div>

                                {openMenuId === id && ( // Show menu only for the selected review
                                  <div className="absolute right-0 flex flex-col mt-10 bg-white shadow-lg  rounded-md z-20">
                                    <button
                                      onClick={() => startEditing(id)}
                                      className="hover:bg-gray-100 py-2 px-5"
                                    >
                                      Update
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteReview(id, name)
                                      }
                                      className="hover:bg-gray-100 py-2 px-5"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
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
                  <div className="flex gap-5 w-full justify-center items-center">
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
                      className="bg-blue-600 text-white py-1 px-3 mt-2 h-fit rounded"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Image */}
    </div>
  );
};

export default ImageGallery;
