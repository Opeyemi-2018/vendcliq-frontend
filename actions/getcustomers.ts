// actions/getCustomers.ts
'use server';

export async function getCustomers(token: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/customers`,
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
        error: errorData.msg || "Failed to fetch customers",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
      };
    }

    return { success: false, error: "Failed to load customers" };
  } catch (err) {
    console.error("Customers fetch error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}