// app/actions/marketPlaceStock.ts
"use server";

export async function getMarketplaceStocks(token: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks`,
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
        error: errorData.msg || "Failed to fetch marketplace stocks",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
      };
    }

    return { success: false, error: "Failed to load marketplace" };
  } catch (err) {
    console.error("Marketplace fetch error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}

export async function getMarketplaceStockDetail(
  token: string,
  stockId: string
) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/stocks/marketplace/${stockId}`,
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
        error: errorData.msg || "Failed to fetch stock detail",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        stock: data.data.stock,
        relatedStocks: data.data.relatedStocks,
      };
    }

    return { success: false, error: "Stock not found" };
  } catch (err) {
    console.error("Stock detail fetch error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}

export async function getMarketplaceOffers(token: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/offers`,
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
        error: errorData.msg || "Failed to fetch offers",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
      };
    }

    return { success: false, error: "Failed to load offers" };
  } catch (err) {
    console.error("Offers fetch error:", err);
    return { success: false, error: "Network error." };
  }
}

export async function getOfferDetail(token: string, offerId: string) {
  try {
    const res = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/offers/${offerId}`,
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
        error: errorData.msg || "Failed to fetch offer detail",
      };
    }

    const data = await res.json();

    if (data.statusCode === 200 && data.data) {
      // The API returns { offer: {...}, relatedOffers: [...] }
      return {
        success: true,
        offer: data.data.offer,
        relatedOffers: data.data.relatedOffers || [],
      };
    }

    return { success: false, error: "Offer not found" };
  } catch (err) {
    console.error("Offer detail fetch error:", err);
    return { success: false, error: "Network error." };
  }
}
