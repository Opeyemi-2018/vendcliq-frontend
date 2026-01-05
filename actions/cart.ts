"use server";

export async function getCartData(token: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/carts`,
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
        error: errorData.msg || "Failed to fetch cart data",
        data: null,
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        pagination: data.pagination,
      };
    }

    return { 
      success: false, 
      error: "Failed to load cart data",
      data: null,
    };
  } catch (err) {
    console.error("Cart fetch error:", err);
    return { 
      success: false, 
      error: "Network error. Try again.",
      data: null,
    };
  }
}

export async function updateCartItem(
  token: string,
  itemId: string,
  updates: { quantity?: number; delivery?: boolean }
) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/carts/${itemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.msg || "Failed to update cart item",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
      };
    }

    return { success: false, error: "Failed to update cart item" };
  } catch (err) {
    console.error("Update cart item error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}

export async function deleteCartItem(token: string, itemId: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/carts/${itemId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.msg || "Failed to delete cart item",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
      };
    }

    return { success: false, error: "Failed to delete cart item" };
  } catch (err) {
    console.error("Delete cart item error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}