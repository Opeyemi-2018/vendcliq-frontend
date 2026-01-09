"use client";

import { useEffect, useState, useCallback } from "react";
import { getCartData, updateCartItem, deleteCartItem } from "@/actions/cart";
import { handleCheckoutCart } from "@/lib/utils/api/apiHelper";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ClipLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { CartSkeletonCard } from "@/components/SkeletonLoader";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  product: {
    name: string;
    image: string;
  };
  price: number;
  quantity: number;
  delivery: boolean;
  attributes?: {
    address?: string;
  };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updatingQuantityId, setUpdatingQuantityId] = useState<string | null>(
    null
  );
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<string | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);

  const router = useRouter();

  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const fetchCart = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getCartData(token);
      if (result.success) {
        setCartItems(result.data || []);
      } else {
        toast.error(result.error || "Failed to load cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) return toast.error("Please log in");

      setUpdatingQuantityId(itemId);
      const result = await updateCartItem(token, itemId, {
        quantity: newQuantity,
      });

      if (result.success) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        toast.error(result.error || "Failed to update quantity");
      }
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingQuantityId(null);
    }
  };

  const handleToggleDelivery = async (itemId: string, current: boolean) => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) return toast.error("Please log in");

      setUpdatingDeliveryId(itemId);
      const result = await updateCartItem(token, itemId, {
        delivery: !current,
      });

      if (result.success) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, delivery: !current } : item
          )
        );
      } else {
        toast.error(result.error || "Failed to update delivery");
      }
    } catch {
      toast.error("Failed to update delivery");
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) return toast.error("Please log in");

      setDeletingId(itemId);
      const result = await deleteCartItem(token, itemId);

      if (result.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        setOpenDeleteDialog(null);
        toast.success("Item removed from cart");
      } else {
        toast.error(result.error || "Failed to remove item");
      }
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setCheckingOut(true);
      setError(null);

      const response = await handleCheckoutCart();

      if (response.statusCode === 201 && response.data) {
        const { id: invoiceId, total, items } = response.data;

        const totalQuantity = items.reduce(
          (sum: number, item: any) => sum + parseFloat(item.quantity),
          0
        );
        const totalCost = items.reduce(
          (sum: number, item: any) => sum + item.cost,
          0
        );

        const checkoutData = {
          invoiceId,
          total,
          cost: totalCost,
          quantity: Math.round(totalQuantity),
          itemsCount: items.length,
        };

        // Save to localStorage for the Pay page
        localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

        // Navigate to Pay page
        router.push("/dashboards/cart/pay");
      } else {
        setError("Checkout failed. Please try again.");
        toast.error("Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Network error. Please check your connection.");
      toast.error("Network error during checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-[#2F2F2F] text-[20px] md:text-[25px] font-clash font-semibold mb-6">
        My Cart ({cartItems.length} items)
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <CartSkeletonCard key={i} />
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <ShoppingCart size={60} className="text-gray-300" />
          <p className="font-bold text-[18px]">Your cart is empty</p>
          <p className="text-gray-500">Your recent carts will appear here</p>
          <Button
            onClick={() => router.push("/dashboards/market-place")}
            className="py-6 bg-[#0A6DC0] hover:bg-[#085a9e] text-[16px] font-bold w-full max-w-xs"
          >
            Shop Now
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="bg-white p-4 flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 border border-[#E3E3E3] bg-[#FAFAFA] rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      height={80}
                      width={80}
                      src={
                        item.product.image.startsWith("//")
                          ? `https:${item.product.image}`
                          : item.product.image
                      }
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[16px] text-[#2F2F2F] line-clamp-2">
                      {item.product.name}
                    </h3>
                    <p className="font-medium text-[16px]">
                      ₦{item.price.toLocaleString()} / unit
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {item.attributes?.address || "No address"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-6 border border-[#D8D8D866] p-1 rounded-full w-fit">
                    <button
                      disabled={updatingQuantityId === item.id}
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 rounded-full hover:bg-[#0A6DC0] hover:text-white transition"
                    >
                      <Plus size={18} />
                    </button>
                    <span className="font-semibold min-w-8 text-center">
                      {updatingQuantityId === item.id ? (
                        <div className="w-5 h-5 border-2 border-t-blue-600 border-gray-300 rounded-full animate-spin" />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      disabled={
                        updatingQuantityId === item.id || item.quantity <= 1
                      }
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 rounded-full hover:bg-[#0A6DC0] hover:text-white transition disabled:opacity-50"
                    >
                      <Minus size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Delivery ({item.delivery ? "Yes" : "No"})
                      </span>
                      {updatingDeliveryId === item.id ? (
                        <ClipLoader size={16} color="#0A6DC0" />
                      ) : (
                        <Switch
                          checked={item.delivery}
                          onCheckedChange={() =>
                            handleToggleDelivery(item.id, item.delivery)
                          }
                          className="data-[state=checked]:bg-[#0A6DC0]"
                        />
                      )}
                    </div>

                    <AlertDialog
                      open={openDeleteDialog === item.id}
                      onOpenChange={(open) =>
                        !open && setOpenDeleteDialog(null)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={() => setOpenDeleteDialog(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={20} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this item from your
                            cart.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deletingId === item.id ? (
                              <ClipLoader size={20} color="white" />
                            ) : (
                              "Remove"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Subtotal */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Subtotal</span>
              <span>₦{calculateSubtotal().toLocaleString()}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={checkingOut || cartItems.length === 0}
            className="w-full py-5 md:py-6  bg-[#0A6DC0] hover:bg-[#085a9e] disabled:opacity-70"
          >
            {checkingOut ? <>
               checking out ...
                <ClipLoader size={24} color="white" />
              </>: "Check Out"}
          </Button>
        </>
      )}
    </div>
  );
};

export default Cart;
