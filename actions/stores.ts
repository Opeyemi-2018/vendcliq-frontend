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


  try {
    const res = await fetch(`${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stores/${storeId}`, {
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


export async function getStoreStock(storeId: string, token: string) {
  try {
   
    const response = await fetch(`${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/${storeId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || `Failed to fetch stock (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.statusCode !== 200 || !Array.isArray(json.data)) {
      return {
        success: false,
        message: json.message || "Invalid stock response format",
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (error) {
    console.error("Fetch store stock error:", error);
    return {
      success: false,
      message: "Network or server error while loading stock",
    };
  }
}