"use client";

import { uploadImage } from "utils/supabase/storage/client";
import { ChangeEvent, useRef, useState, useTransition } from "react";
import { convertBlobUrlToFile } from "@/lib/utils";
import Image from "next/image";
import ImageGallery from "@/components/image-gallery/google-drive-lite/ImageGallery";

export default function GoogleDriveLite() {
  return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-8">
      <ImageGallery />
    </div>
  );
}
