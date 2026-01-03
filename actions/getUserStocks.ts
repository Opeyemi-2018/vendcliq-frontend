"use server";

export async function getStoreStock(token: string, storeId: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/${storeId}`,
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
        error: errorData.msg || "Failed to fetch store stock",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data, // array of stock items
        pagination: data.pagination,
      };
    }

    return { success: false, error: "Failed to load store stock" };
  } catch (err) {
    console.error("Store stock fetch error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}