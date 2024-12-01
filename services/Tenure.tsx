import { GetTenuresResponse } from "@/types";
import { handleGetTenures } from "@/lib/utils/api/apiHelper";

export const getTenures = async (): Promise<string[]> => {
  try {
    const response = await handleGetTenures();
    if (response.status === "success" && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching tenures:", error);
    return [];
  }
};
