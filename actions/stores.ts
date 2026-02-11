"use server";

import { StoreDetailResponse, StoreStockDetail } from "@/types/store";

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
      },
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

export async function getStoreById(
  storeId: string,
  token: string,
): Promise<StoreDetailResponse | null> {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stores/${storeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

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
    const url = `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/${storeId}?limit=200&all=true`;

    const response = await fetch(url, {
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
        message:
          errData.message || `Failed to fetch stock (HTTP ${response.status})`,
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
      pagination: json.pagination || null,
    };
  } catch (error) {
    console.error("Fetch store stock error:", error);
    return {
      success: false,
      message: "Network or server error while loading stock",
    };
  }
}

export async function moveStock(
  targetStoreId: string,
  items: Array<{
    stock_id: string;
    quantity: number;
    selling_price: number;
  }>,
  token: string,
) {
  try {
    const response = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/move`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_store_id: targetStoreId,
          items,
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          errData.message || `Failed to move stock (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.statusCode !== 200) {
      return {
        success: false,
        message: json.message || "Failed to move stock",
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (error) {
    console.error("Move stock error:", error);
    return {
      success: false,
      message: "Network or server error while moving stock",
    };
  }
}

// export async function getStockDetail(stockId: string, storeId: string, token: string) {
//   try {
//     const response = await fetch(
//       `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/${stockId}/${storeId}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//         },
//         cache: "no-store",
//       }
//     );

//     if (!response.ok) {
//       const errData = await response.json().catch(() => ({}));
//       return {
//         success: false,
//         message: errData.message || `Failed to fetch stock details (HTTP ${response.status})`,
//       };
//     }

//     const json = await response.json();

//     if (json.statusCode !== 200 || !json.data) {
//       return {
//         success: false,
//         message: json.message || "Invalid stock detail response format",
//       };
//     }

//     return {
//       success: true,
//       data: json.data,
//     };
//   } catch (error) {
//     console.error("Fetch stock detail error:", error);
//     return {
//       success: false,
//       message: "Network or server error while loading stock details",
//     };
//   }
// }

export async function updateStock(
  stockId: string,
  data: {
    cost_price: number;
    selling_price: number;
    selling_price_pieces: number;
    empties_price: number;
    exp_date: string;
    stock_alert_no: number;
    sku: string;
    remark: string;
  },
  token: string,
) {
  try {
    const response = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/${stockId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          errData.message || `Failed to update stock (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.statusCode !== 200) {
      return {
        success: false,
        message: json.message || "Failed to update stock",
      };
    }

    return {
      success: true,
      data: json.data,
      message: "Stock updated successfully",
    };
  } catch (error) {
    console.error("Update stock error:", error);
    return {
      success: false,
      message: "Network or server error while updating stock",
    };
  }
}

export async function updateStockWithMovement(
  stockId: string,
  data: {
    action: "Added" | "Removed";
    quantity: number;
    empties_qty: number;
    remark: string;
  },
  token: string,
) {
  try {
    const response = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/${stockId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          errData.message ||
          `Failed to update stock movement (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.statusCode !== 200) {
      return {
        success: false,
        message: json.message || "Failed to record stock movement",
      };
    }

    return {
      success: true,
      data: json.data,
      message: json.message || "Stock movement recorded successfully",
    };
  } catch (error) {
    console.error("Update stock movement error:", error);
    return {
      success: false,
      message: "Network or server error while recording stock movement",
    };
  }
}

export async function getStockDetail(
  stockId: string,
  storeId: string,
  token: string,
): Promise<
  | { success: true; data: StoreStockDetail }
  | { success: false; message: string }
> {
  try {
    const response = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/${stockId}/${storeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          errData.message ||
          `Failed to fetch stock detail (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.statusCode !== 200 || !json.data) {
      return {
        success: false,
        message: json.message || "Invalid stock detail response format",
      };
    }

    return {
      success: true,
      data: json.data as StoreStockDetail,
    };
  } catch (error) {
    console.error("Fetch stock detail error:", error);
    return {
      success: false,
      message: "Network or server error while loading stock details",
    };
  }
}
