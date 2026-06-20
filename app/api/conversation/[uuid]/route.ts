// app/api/conversation/[uuid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Get messages from a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const response = await fetch(
      `https://vendcliq.cloud/ai/v1/chat/conversations/${uuid}/messages`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-platform": "web",
          "x-app-identifier": "com.vendcliq.mobile",
          "x-app-version": "1.0.0",
        },
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", items: [] },
      { status: 500 },
    );
  }
}

// Delete a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `https://vendcliq.cloud/ai/v1/chat/conversations/${uuid}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-platform": "web",
          "x-app-identifier": "com.vendcliq.mobile",
          "x-app-version": "1.0.0",
        },
      },
    );

    // Return success for 200 or 204 even with empty body
    if (response.ok) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}