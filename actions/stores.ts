"use server";

import { StoreDetailResponse } from "@/types/store";

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
        data: data.data, 
        pagination: data.pagination,
      };
    }

    return { success: false, error: "Failed to load stores" };
  } catch (err) {
    console.error("Stores fetch error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}

export async function getStoreById(storeId: string, token: string): Promise<StoreDetailResponse | null> {
  if (!token) return null;

  const baseUrl = process.env.VERA_INVENTORY_API_BASE_URL;

  try {
    const res = await fetch(`${baseUrl}inventory/stores/${storeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch store:", res.status);
      return null;
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return data as StoreDetailResponse;
    }

    return null;
  } catch (error) {
    console.error("Error fetching store by ID:", error);
    return null;
  }
}