/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// For streaming chat messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a confirm request
    if (body.confirm_id) {
      return handleConfirm(request, body);
    }

    // Otherwise, handle chat message
    return handleChat(request, body);
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function handleChat(request: NextRequest, body: any) {
  const { message, conversation_uuid } = body;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: any = { message };
  if (conversation_uuid) {
    payload.conversation_uuid = conversation_uuid;
  }

  const response = await fetch("https://vendcliq.cloud/ai/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
      "x-platform": "web",
      "x-app-identifier": "com.vendcliq.mobile",
      "x-app-version": "1.0.0",
    },
    body: JSON.stringify(payload),
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function handleConfirm(request: NextRequest, body: any) {
  const { confirm_id } = body;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch("https://vendcliq.cloud/ai/v1/chat/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "x-platform": "web",
      "x-app-identifier": "com.vendcliq.mobile",
      "x-app-version": "1.0.0",
    },
    body: JSON.stringify({ confirm_id }),
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
