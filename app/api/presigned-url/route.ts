import { NextResponse } from "next/server";

/**
 * Presigned upload URLs for gift images.
 *
 * The tools gateway authenticates with a static token, which must never reach
 * the browser — so the browser asks this route, and it forwards the request
 * with the token attached. The browser then PUTs the file straight to S3 using
 * the signed URL it gets back, so file bytes never pass through us.
 */
const TOOLS_BASE_URL =
  process.env.TOOLS_API_BASE_URL ?? "https://vendcliq.cloud/tools";
const TOOLS_API_TOKEN = process.env.TOOLS_API_TOKEN;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "application/pdf",
];

export async function POST(request: Request) {
  if (!TOOLS_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Image upload is not configured. Set TOOLS_API_TOKEN to enable it.",
      },
      { status: 501 },
    );
  }

  let body: { key?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { key, type } = body;

  if (!key || !type) {
    return NextResponse.json(
      { error: "Both key and type are required" },
      { status: 400 },
    );
  }

  // The gateway rejects other types, and an unsanitised key can escape the
  // intended prefix.
  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${type}` },
      { status: 415 },
    );
  }
  if (!/^[a-zA-Z0-9._\-/]+$/.test(key)) {
    return NextResponse.json(
      { error: "Key contains unsupported characters" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${TOOLS_BASE_URL}/presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOOLS_API_TOKEN}`,
      },
      body: JSON.stringify({ key, type }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not reach the upload service" },
      { status: 502 },
    );
  }
}
