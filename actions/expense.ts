"use server";
export async function getExpenses(token: string) {
  try {
    const response = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/expenses`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          errData.message ||
          `Failed to fetch expenses (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.statusCode !== 200 || !Array.isArray(json.data)) {
      return {
        success: false,
        error: json.message || "Invalid expenses response format",
      };
    }

    return {
      success: true,
      data: json.data,
      pagination: json.pagination,
    };
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return {
      success: false,
      error: "Network or server error while loading expenses",
    };
  }
}

export async function deleteExpenses(token: string, expenseId: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/expenses/${expenseId}`,
      {
        method: "DELETE",
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
        error: errorData.msg || "Failed to delete customer",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200 || data.statusCode === 204) {
      return {
        success: true,
        message: data.msg || "Customer deleted successfully",
      };
    }

    return { success: false, error: "Failed to delete customer" };
  } catch (err) {
    console.error("Delete customer error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}
