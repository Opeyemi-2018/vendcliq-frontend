import { useQuery } from "@tanstack/react-query";
import { handleDashboard } from "@/lib/utils/api/apiHelper";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: handleDashboard,
  });
};
