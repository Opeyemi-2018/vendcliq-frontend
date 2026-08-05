/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleGetItemTrackingStatus } from "@/lib/utils/api/apiHelper";
import { GET_ITEM_TRACKING_STATUS } from "@/url/api-url";
import { useQuery } from "@tanstack/react-query";

export interface TrackingResponse {
  status: string;
  lastUpdated: string;
  events: any[];
}

export function useTrackingStatus(itemId: string) {
  console.log("useTrackingStatus called with:", itemId); // ← add this

  return useQuery({
    queryKey: ["tracking", itemId],
    queryFn: async () => {
      console.log("Making request with itemId:", itemId); // ← add this
      const url = GET_ITEM_TRACKING_STATUS(itemId);
      console.log("URL being called:", url); // ← add this
      const res = await handleGetItemTrackingStatus(itemId);
      console.log("Response:", res); // ← add this
      return res as any;
    },
    enabled: !!itemId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}
