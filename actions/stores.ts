"use server";

export async function getStores(token: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stores`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.msg || "Failed to fetch stores",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data, // This is the stores array
        pagination: data.pagination,
      };
    }

    return { success: false, error: "Failed to load stores" };
  } catch (err) {
    console.error("Stores fetch error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}