export const MarketSkeletonCard = () => (
  <div className="rounded-lg overflow-hidden animate-pulse">
    <div className="h-[153px] border border-[#E5E5EA] bg-gray-200"></div>
    <div className="px-3 py-2 flex flex-col justify-between h-[150px] bg-gray-300">
      <div>
        <div className="h-5 bg-gray-400 rounded mb-2 w-20"></div>
        <div className="h-4 bg-gray-400 rounded mb-2 w-full"></div>
        <div className="h-3 bg-gray-400 rounded w-24"></div>
      </div>
      <div className="h-10 bg-gray-400 rounded"></div>
    </div>
  </div>
);

// components/SkeletonLoader.tsx
import { Card } from "@/components/ui/card";

export const CartSkeletonCard = () => (
  <Card className="p-2 flex flex-col md:flex-row justify-between md:items-center gap-4 animate-pulse">
    {/* Left side: Image + Details */}
    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
      {/* Image placeholder */}
      <div className="w-20 h-20 bg-gray-300 rounded-xl flex-shrink-0" />

      <div className="space-y-3 flex-1">
        <div className="h-5 bg-gray-300 rounded w-64" /> 
        <div className="h-4 bg-gray-300 rounded w-40" /> 
        <div className="h-3 bg-gray-200 rounded w-80 max-w-full" />{" "}
      </div>
    </div>

    {/* Right side: Controls */}
    <div className="flex flex-col gap-5">
      {/* Quantity */}
      <div className="flex items-center gap-6 border border-gray-200 p-1 rounded-full w-fit">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="w-12 h-6 bg-gray-300 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
      </div>

      {/* Delivery + Delete */}
      <div className="flex justify-between items-center gap-10">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="w-14 h-7 bg-gray-300 rounded-full" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  </Card>
);
