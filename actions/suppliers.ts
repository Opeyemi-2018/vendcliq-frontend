"use server";
import { GetSuppliersResponse, Supplier } from "@/types/supplier";

export async function getSuppliers(
  token: string
): Promise<GetSuppliersResponse> {
  if (!token) {
    return {
      success: false,
      error: "No authentication token provided",
    };
  }

  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/suppliers`,
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
        error: errorData.msg || "Failed to fetch suppliers",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200 && Array.isArray(data.data)) {
      return {
        success: true,
        data: data.data as Supplier[],
      };
    }

    return {
      success: false,
      error: "Invalid response from server",
    };
  } catch (err) {
    console.error("Suppliers fetch error:", err);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function getSupplierStock(token: string, supplierId: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/suppliers/${supplierId}/stocks`,
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
        error: errorData.msg || "Failed to fetch supplier stock",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        pagination: data.pagination || null,
      };
    }

    return { success: false, error: "Failed to load supplier stock" };
  } catch (err) {
    console.error("Supplier stock fetch error:", err);
    return { success: false, error: "Network error. Please try again." };
  }
}
