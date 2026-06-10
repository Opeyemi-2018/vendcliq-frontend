"use server";

export type DeletionRequestPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; 
  message: string;
};

export type DeletionActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

export async function submitAccountDeletion(data: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}): Promise<DeletionActionResult> {
  const url = `${process.env.VERA_API_BASE_URL}/v1/inventory/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: ".",
        message: data.message,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage =
          errorBody.msg || errorBody.message || errorBody.error || errorMessage;
      } catch {
        errorMessage = (await response.text()) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return { success: true, data: result };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("[account-deletion]", err);
    return {
      success: false,
      error: err.message || "Failed to submit account deletion request",
    };
  }
}
