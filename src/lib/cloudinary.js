import { createHash } from "crypto";

function hasValue(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isPlaceholder(value) {
  return typeof value === "string" && value.includes("<") && value.includes(">");
}

function isRemoteImageSource(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function buildSignature(params, apiSecret) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export function getCloudinaryPublicId(source) {
  if (!isRemoteImageSource(source)) {
    return null;
  }

  try {
    const url = new URL(source);

    if (!url.hostname.includes("cloudinary.com")) {
      return null;
    }

    const uploadIndex = url.pathname.indexOf("/upload/");

    if (uploadIndex < 0) {
      return null;
    }

    const uploadPath = url.pathname.slice(uploadIndex + "/upload/".length);
    const segments = uploadPath.split("/").filter(Boolean);

    if (!segments.length) {
      return null;
    }

    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicSegments = versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;

    if (!publicSegments.length) {
      return null;
    }

    const fileName = publicSegments.pop();

    if (!fileName) {
      return null;
    }

    publicSegments.push(fileName.replace(/\.[^.]+$/, ""));

    return publicSegments.join("/");
  } catch {
    return null;
  }
}

async function uploadUnsigned({ cloudName, source, uploadPreset }) {
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: new URLSearchParams({ file: source, upload_preset: uploadPreset }),
  });

  if (!response.ok) {
    throw new Error("Could not upload the product photo to Cloudinary.");
  }

  const data = await response.json();
  return data.secure_url;
}

async function uploadSigned({ cloudName, source, apiKey, apiSecret, folder }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signingPayload = hasValue(folder)
    ? `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    : `timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signingPayload).digest("hex");

  const params = new URLSearchParams({
    file: source,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  if (hasValue(folder)) {
    params.append("folder", folder);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: params,
  });

  if (!response.ok) {
    throw new Error("Could not upload the product photo to Cloudinary.");
  }

  const data = await response.json();
  return data.secure_url;
}

async function destroySigned({ cloudName, publicId, apiKey, apiSecret }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    invalidate: "true",
    public_id: publicId,
    timestamp: String(timestamp),
  };

  const signature = buildSignature(params, apiSecret);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
    invalidate: "true",
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error("Could not delete the product photo from Cloudinary.");
  }

  const data = await response.json();
  return data.result;
}

export async function uploadPhotoToCloudinary(source) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER;

  if (isRemoteImageSource(source)) {
    return source;
  }

  if (!hasValue(cloudName)) {
    return source;
  }

  if (hasValue(uploadPreset) && !isPlaceholder(uploadPreset)) {
    const result = await uploadUnsigned({ cloudName, source, uploadPreset });
    return result || source;
  }

  if (!hasValue(apiKey) || !hasValue(apiSecret)) {
    return source;
  }

  const result = await uploadSigned({ cloudName, source, apiKey, apiSecret, folder });
  return result || source;
}

export async function deletePhotoFromCloudinary(source) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const publicId = getCloudinaryPublicId(source);

  if (!publicId || !hasValue(cloudName) || !hasValue(apiKey) || !hasValue(apiSecret)) {
    return false;
  }

  const result = await destroySigned({ cloudName, publicId, apiKey, apiSecret });
  return result === "ok";
}

export function optimizeCloudinaryUrl(url) {
  if (typeof url !== "string" || !url.includes("cloudinary.com/")) {
    return url;
  }
  
  if (url.includes("/upload/f_auto,q_auto,w_600/")) {
    return url;
  }
  
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
}