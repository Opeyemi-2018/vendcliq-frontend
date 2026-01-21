"use server";

import { PlansApiResponse } from "@/types/plans";



export async function fetchPricingPlans(token: string) {
  try {
    const response = await fetch(
      `${process.env.VERA_INVENTORY_API_BASE_URL}inventory/plans?page=1&limit=10&all=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }

    const data: PlansApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    throw error;
  }
}
