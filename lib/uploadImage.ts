/**
 * Two-step image upload: ask our route for a presigned URL, then PUT the file
 * straight to S3. Raw bytes never pass through the app server.
 */
export const uploadImage = async (
  file: File,
  prefix = "uploads/gifts",
): Promise<string> => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${prefix}/${Date.now()}-${safeName}`;

  const presignRes = await fetch("/api/presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, type: file.type }),
  });

  const presign = await presignRes.json();
  if (!presignRes.ok) {
    throw new Error(presign?.error ?? "Could not prepare the upload");
  }

  const { url, publicUrl, key: returnedKey, bucket } = presign?.data ?? {};
  if (!url) throw new Error("Upload service did not return a signed URL");

  // The signed URL is itself the credential — no Authorization header here.
  const put = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type, "x-amz-acl": "public-read" },
    body: file,
  });

  if (!put.ok) {
    throw new Error(`Upload failed (${put.status})`);
  }

  if (publicUrl) return publicUrl;
  // Documented fallback when publicUrl is absent.
  return `https://${bucket}.nyc3.cdn.digitaloceanspaces.com/${returnedKey ?? key}`;
};

/** Signed URLs expire in minutes, and the gateway only accepts these types. */
export const UPLOAD_ACCEPT = "image/jpeg,image/png,image/svg+xml";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
