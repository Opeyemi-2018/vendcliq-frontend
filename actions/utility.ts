"use server";

export async function getNetworkProvider(token: string, phone: string) {
  if (!token) {
    return { success: false, error: "Authentication token is required" };
  }

  if (!phone || phone.length !== 11) {
    return { success: false, error: "Phone number must be exactly 11 digits" };
  }

  try {
    const cleanPhone = phone.startsWith("0")
      ? phone
      : `0${phone.replace(/^\+234/, "0")}`;

    const res = await fetch(
      `${process.env.VERA_API_BASE_URL}/client/v2/payments/network?phone=${cleanPhone}`,
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
      if (res.status === 401) {
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      }
      return {
        success: false,
        error:
          errorData.msg ||
          errorData.message ||
          errorData.error ||
          `HTTP ${res.status}`,
      };
    }

    const result = await res.json();

    // Updated path to match your actual response structure
    const innerData = result?.data?.data?.data; // Go deeper: data → data → data

    if (result.status === "success" && innerData?.network) {
      const network = innerData.network.trim().toUpperCase();
      return {
        success: true,
        network, // "MTN", "AIRTEL", etc.
      };
    }

    return {
      success: false,
      error: result.msg || "Failed to detect network provider",
    };
  } catch (err) {
    console.error("Network provider fetch error:", err);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}



export async function fetchDataPlans(token: string, phone: string) {
  if (!token) {
    return { success: false, error: "Authentication token is required" };
  }

  if (!phone || phone.length !== 11) {
    return { success: false, error: "Phone number must be exactly 11 digits" };
  }

  try {
    const cleanPhone = phone.startsWith("0")
      ? phone
      : `0${phone.replace(/^\+234/, "0")}`;

    const res = await fetch(
      `${process.env.VERA_API_BASE_URL}/client/v2/payments/data-plans?phone=${cleanPhone}`,
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
      if (res.status === 401) {
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      }
      return {
        success: false,
        error:
          errorData.msg ||
          errorData.message ||
          errorData.error ||
          `HTTP ${res.status}`,
      };
    }

    const result = await res.json();

    // Navigate the nested structure (data → data → data)
    const innerData = result?.data?.data?.data;

    if (result.status === "success" && Array.isArray(innerData)) {
      return {
        success: true,
        plans: innerData, // array of plans
      };
    }

    return {
      success: false,
      error: result.msg || "Failed to retrieve data plans",
    };
  } catch (err) {
    console.error("Data plans fetch error:", err);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}