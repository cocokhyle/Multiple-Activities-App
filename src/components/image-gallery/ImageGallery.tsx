"use client";

import { useEffect, useState } from "react";
import { createClient } from "utils/supabase/client";

const supabase = createClient();

const ImageGallery = () => {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from("google-drive-lite")
        .list();

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      const imagesWithNames = data.map((file) => ({
        name: file.name, // Get the file name
        url: supabase.storage.from("google-drive-lite").getPublicUrl(file.name)
          .data.publicUrl,
      }));

      setImages(imagesWithNames);
    };

    fetchImages();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(({ name, url }, index) => (
        <div key={index} className="text-center">
          <img src={url} alt={name} className="w-full h-auto rounded-lg" />
          <p className="font-semibold">{name}</p> {/* Display Image Name */}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
