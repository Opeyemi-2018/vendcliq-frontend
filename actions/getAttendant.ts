// actions/attendants.ts
"use server";

export async function getAttendants(token: string) {
  try {
    

    const response = await fetch(`${process.env.VERA_API_BASE_URL}/client/v2/attendants`, {
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
        message: errData.msg || errData.message || `Failed to fetch attendants (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.status !== "success" || !Array.isArray(json.data?.attendants)) {
      return {
        success: false,
        message: json.msg || "Invalid response format",
      };
    }

    return {
      success: true,
      data: json.data.attendants,
      total: json.data.totalCount || json.data.attendants.length,
    };
  } catch (error) {
    console.error("Fetch attendants error:", error);
    return {
      success: false,
      message: "Network or server error while loading attendants",
    };
  }
}

export async function getAttendantPermissions(attendantId: number, token: string) {
  try {
    const response = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/attendant-permissions/attendant/${attendantId}`,
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
        message: errData.msg || errData.message || `Failed to fetch permissions (HTTP ${response.status})`,
      };
    }

    const json = await response.json();

    if (json.statusCode !== 200 || !json.data) {
      return {
        success: false,
        message: json.message || "Invalid permissions response",
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (error) {
    console.error("Fetch attendant permissions error:", error);
    return {
      success: false,
      message: "Network or server error while loading permissions",
    };
  }
}

