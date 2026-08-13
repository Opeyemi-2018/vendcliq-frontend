"use client";

import { MoveLeft, Package } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UpdateStockModal } from "./chunks/UpdateDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { CreatePromoModal } from "./chunks/OfferModal";
import { useUser } from "@/context/userContext";
import { useStockDetail, useStoreStocks } from "@/hooks/useStores";
import { useState } from "react";
import { formatQty, formatPacks } from "@/lib/priceInput";
import StockConditionsPanel from "@/components/inventory/StockConditionsPanel";

const StockDetailPage = () => {
  const { canUpdateStock } = useUser();
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;
  const stockId = params.stockId as string;

  const { data: stock, isLoading, error, refetch } = useStockDetail(storeId, stockId);
  // Other stocks in this store are what a bundle condition can point at.
  const { data: storeStocks = [] } = useStoreStocks(storeId);
  const [promoModalOpen, setPromoModalOpen] = useState(false);

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handlePromoSuccess = () => {
    toast.info("Promo created — you may want to refresh stock stats");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ThreeDots height="80" width="80" color="#0A6DC0" visible={true} />
        <p className="mt-4 text-[#9E9A9A]">Loading stock details...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error?.message || "Stock not found"}</p>
        <button onClick={() => router.back()} className="mt-4 text-[#0A6DC0] underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      <div className="flex lg:items-center mb-3 md:mb-8 flex-col lg:flex-row justify-between gap-4">
        <div>
          <div className="flex gap-3 items-center font-clash text-[16px] md:text-[25px] font-semibold text-[#2F2F2F]">
            <h1>{stock.product.name}</h1>
            <span className="text-[#0A6DC0]">•</span>
            <p>{formatPacks(stock.quantity, stock.product?.items_per_pack)} in stock</p>
          </div>
          <p className="font-medium font-dm-sans text-[#9E9A9A] mt-1">
            This is all you need to know about this product
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center justify-between gap-2">
              Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => router.push(`/inventory/my-store/${storeId}/stock/${stockId}/history`)}
              className="cursor-pointer"
            >
              View Stock History
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const shareUrl = `https://checkout.vendcliq.com/checkout/${stockId}`;
                const message = `Check out ${stock.product.name} for ₦${parseFloat(
                  stock.selling_price,
                ).toLocaleString()} on Vendcliq!\n\n${shareUrl}`;
                navigator.clipboard.writeText(message);
                toast.success("Stock link copied to clipboard");
              }}
              className="cursor-pointer"
            >
              Share Stock Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick Stats Cards */}
      <div className="mb-4 flex gap-4 items-center overflow-x-auto lg:overflow-visible">
        <div className="min-w-[260px] flex-shrink-0 lg:min-w-0 lg:flex-1 bg-[url('/blue.svg')] bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6 text-white">
          <p className="text-[16px] font-dm-sans">Qty Sold</p>
          <p className="text-[20px] md:text-[24px] font-clash font-semibold">
            {formatPacks(stock.stats.qty_sold, stock.product?.items_per_pack)}
          </p>
        </div>
        <div className="min-w-[260px] flex-shrink-0 lg:min-w-0 lg:flex-1 bg-[url('/balance-bg.svg')] bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6 text-white">
          <p className="text-[16px] font-dm-sans">Total Sales</p>
          <p className="text-[20px] md:text-[24px] font-clash font-semibold">
            ₦{stock.stats.total_sales.toLocaleString()}
          </p>
        </div>
        <div className="min-w-[260px] flex-shrink-0 lg:min-w-0 lg:flex-1 bg-[url('/balance-bg.svg')] bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6 text-white">
          <p className="text-[16px] font-dm-sans">Qty Added</p>
          <p className="text-[20px] md:text-[24px] font-clash font-semibold">
            {formatPacks(stock.stats.qty_added, stock.product?.items_per_pack)}
          </p>
        </div>
      </div>

      <Card className="md:p-6">
        <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-56 md:h-64 w-full flex items-center justify-center p-4">
            {stock.product.image ? (
              <Image
                src={stock.product.image.startsWith("//") ? `https:${stock.product.image}` : stock.product.image}
                alt={stock.product.name}
                width={240}
                height={240}
                className="rounded-lg object-contain max-h-full"
                priority
              />
            ) : (
              <Package className="w-24 h-24 text-gray-400" />
            )}
          </div>
        </div>

        <div className="mt-6 text-[#2F2F2F] text-[13px] sm:text-[15px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
          <div><h2 className="font-bold font-dm-sans">Product Name</h2><p className="mt-1">{stock.product.name}</p></div>
          <div><h2 className="font-bold font-dm-sans">SKU</h2><p className="mt-1">{stock.sku}</p></div>
          <div><h2 className="font-bold font-dm-sans">Total Qty</h2><p className="mt-1">{formatPacks(stock.total_qty, stock.product?.items_per_pack)}</p></div>
          <div><h2 className="font-bold font-dm-sans">Content Qty</h2><p className="mt-1">{formatPacks(stock.quantity, stock.product?.items_per_pack)}</p></div>
          <div><h2 className="font-bold font-dm-sans">Empties Qty</h2><p className="mt-1">{formatQty(stock.empties_qty)}</p></div>
          <div><h2 className="font-bold font-dm-sans">Stock Value</h2><p className="mt-1">₦{parseFloat(stock.stock_value).toLocaleString()}</p></div>
          <div><h2 className="font-bold font-dm-sans">Cost Price</h2><p className="mt-1">₦{parseFloat(stock.cost_price).toLocaleString()}</p></div>
          <div><h2 className="font-bold font-dm-sans">Selling Price</h2><p className="mt-1">₦{parseFloat(stock.selling_price).toLocaleString()}</p></div>
          <div><h2 className="font-bold font-dm-sans">Price per piece</h2><p className="mt-1">{stock.selling_price_pieces ? `₦${parseFloat(stock.selling_price_pieces).toLocaleString()}` : "—"}</p></div>
          <div><h2 className="font-bold font-dm-sans">Empties Price</h2><p className="mt-1">{stock.empties_price && parseFloat(stock.empties_price) > 0 ? `₦${parseFloat(stock.empties_price).toLocaleString()}` : "—"}</p></div>
          <div><h2 className="font-bold font-dm-sans">Best Before Date</h2><p className="mt-1">{stock.exp_date || "Not set"}</p></div>
          <div><h2 className="font-bold font-dm-sans">Low Stock Alert</h2><p className="mt-1">{stock.stock_alert_no != null ? stock.stock_alert_no : "Not set"}</p></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button className="w-full py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#09599a]" onClick={() => setPromoModalOpen(true)}>
            Create Promo
          </Button>
          <CreatePromoModal stockId={stock.id} open={promoModalOpen} onOpenChange={setPromoModalOpen} onSuccess={handlePromoSuccess} />
          {canUpdateStock() && (
            <UpdateStockModal
              stockId={stock.id}
              productName={stock.product.name}
              initialData={{
                cost_price: parseFloat(stock.cost_price) || 0,
                selling_price: parseFloat(stock.selling_price) || 0,
                selling_price_pieces: parseFloat(stock.selling_price_pieces || "0") || 0,
                empties_price: parseFloat(stock.empties_price || "0") || 0,
                exp_date: stock.exp_date || "",
                stock_alert_no: stock.stock_alert_no || 0,
                sku: stock.sku || "",
              }}
              onSuccess={handleUpdateSuccess}
            />
          )}
        </div>
      </Card>

      <StockConditionsPanel
        stockId={String(stock.id)}
        productName={stock.product?.name}
        sellingPrice={parseFloat(stock.selling_price) || undefined}
        bundleOptions={storeStocks
          .filter((item: any) => String(item.id) !== String(stock.id))
          .map((item: any) => ({
            id: item.id,
            name: item.product?.name ?? "Product",
            image: item.product?.image,
            pack: item.product?.items_per_pack
              ? `Pack of ${item.product.items_per_pack}`
              : undefined,
          }))}
      />
    </div>
  );
};

export default StockDetailPage;