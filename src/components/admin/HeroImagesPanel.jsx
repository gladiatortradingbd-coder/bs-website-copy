"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { DEFAULT_HERO_IMAGE } from "@/data/hero";

const MAX_UPLOAD_BYTES = 1 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;

function prepareUploadFile(file) {
  if (file.size <= MAX_UPLOAD_BYTES) {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(`Could not prepare ${file.name} for upload.`));
            return;
          }

          const name = file.name.replace(/\.[^.]+$/, "") || "hero-image";
          resolve(new File([blob], `${name}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not read ${file.name}.`));
    };
    image.src = objectUrl;
  });
}

async function readResponse(response) {
  const body = await response.text();
  let data;

  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    throw new Error(
      response.status === 413
        ? "The selected images are too large to upload. Please choose smaller images."
        : body || `Upload failed with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    throw new Error(data.message || `Upload failed with status ${response.status}.`);
  }

  return data;
}

export default function HeroImagesPanel() {
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagesChanged, setImagesChanged] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetch("/api/hero-images")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load hero images.");
        if (!ignore) setImages(Array.isArray(data.images) && data.images.length ? data.images : [DEFAULT_HERO_IMAGE]);
      })
      .catch((error) => {
        if (!ignore) setMessage(error instanceof Error ? error.message : "Could not load hero images.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));

    if (!files.length) {
      setMessage("Please select image files.");
      return;
    }

    if (images.length + selectedFiles.length + files.length > 8) {
      setMessage("You can select up to 8 hero images.");
      return;
    }

    const nextPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((current) => [...current, ...files]);
    setPreviewUrls((current) => [...current, ...nextPreviewUrls]);
    setImagesChanged(true);
    setMessage("New images were added. Existing images will stay unless you delete them.");
  };

  const removeSelectedFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setPreviewUrls((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setImagesChanged(true);
  };

  const removeExistingImage = (index) => {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setImagesChanged(true);
    setMessage("Image removed from the rotation. Save rotation to confirm.");
  };

  const handleSave = async () => {
    if (!imagesChanged) {
      setMessage("Add an image or delete an existing image first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("existingImages", JSON.stringify(images));
      for (const file of selectedFiles) {
        const uploadFile = await prepareUploadFile(file);
        payload.append("photos", uploadFile, uploadFile.name);
      }

      const response = await fetch("/api/hero-images", { method: "POST", body: payload });
      const data = await readResponse(response);

      setImages(data.images);
      setSelectedFiles([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setImagesChanged(false);
      setMessage("Hero rotation updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save hero images.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-start gap-3 border-b border-neutral-100 pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
          <ImagePlus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hero images</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Homepage hero rotation</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select up to 8 images. They will rotate in the order shown here.</p>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-2xl border border-border-color bg-muted px-4 py-3 text-sm text-foreground">{message}</p> : null}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading hero images...</div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-color bg-muted">
                <Image src={image} alt={`Hero image ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">{index + 1}</span>
                <button type="button" onClick={() => removeExistingImage(index)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-black" aria-label={`Delete image ${index + 1}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {previewUrls.map((previewUrl, index) => (
              <div key={`${previewUrl}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-color bg-muted">
                <Image src={previewUrl} alt={`New hero image ${images.length + index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">{images.length + index + 1}</span>
                <button type="button" onClick={() => removeSelectedFile(index)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-black" aria-label={`Remove new image ${index + 1}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-neutral-300 bg-background px-5 py-3 text-sm font-medium text-muted-foreground hover:border-black hover:text-foreground dark:hover:border-white">
              <Upload className="h-4 w-4" />
              Choose hero images
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
            <Button type="button" variant="primary" className="justify-center" onClick={handleSave} disabled={saving || !imagesChanged}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Save rotation
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
