/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { getCartData, updateCartItem, deleteCartItem } from "@/actions/cart";
import { Plus, Minus, Trash2 } from "lucide-react";
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

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingQuantityId, setUpdatingQuantityId] = useState<string | null>(
    null
  );
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<string | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);

  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
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
        setCartItems(result.data);
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
      if (!token) {
        toast.error("Authentication required");
        return;
      }

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
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingQuantityId(null);
    }
  };

  const handleToggleDelivery = async (
    itemId: string,
    currentStatus: boolean
  ) => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      setUpdatingDeliveryId(itemId);
      const result = await updateCartItem(token, itemId, {
        delivery: !currentStatus,
      });
      if (result.success) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, delivery: !currentStatus } : item
          )
        );
      } else {
        toast.error(result.error || "Failed to update delivery");
      }
    } catch (error) {
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
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      setDeletingId(itemId);
      const result = await deleteCartItem(token, itemId);
      if (result.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        setOpenDeleteDialog(null);
        toast.success("Item removed");
      } else {
        toast.error(result.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setOpenDeleteDialog(itemId);
  };
  {
    cartItems.length === 0 && (
      <div className="text-center py-20 text-gray-500">Your cart is empty.</div>
    );
  }

  return (
    <div className="">
      <h1 className="text-[#2F2F2F] text-[20px] md:text-[25px] font-clash font-semibold mb-2">
        My Cart ({cartItems.length} items)
      </h1>
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <CartSkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {cartItems.map((item) => (
            <Card
              key={item.id}
              className="bg-white p-4  flex flex-col md:flex-row  justify-between md:items-center md:gap-0 gap-2"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="md:w-20 h-20 border border-[#E3E3E3] p-3 bg-[#FAFAFA] rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    height={100}
                    width={100}
                    src={
                      item.product.image.startsWith("//")
                        ? `https:${item.product.image}`
                        : item.product.image
                    }
                    alt={item.product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 font-dm-sans">
                  <h3 className="text-[#2F2F2F] font-bold text-[16px] leading-tight">
                    {item.product.name}
                  </h3>
                  <p className="text-[#2F2F2F] font-medium text-[16px]">
                    ₦{item.price.toLocaleString()} / unit
                  </p>
                  <p className="text-gray-400 text-xs mb-1 line-clamp-1">
                    {item.attributes?.address}
                  </p>
                </div>
              </div>

              {/* right side */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-6 border border-[#D8D8D866] p-1 rounded-full w-fit">
                  <button
                    disabled={updatingQuantityId === item.id}
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    className="hover:bg-[#0A6DC0] hover:text-white duration-200 rounded-full p-1"
                  >
                    <Plus size={18} />
                  </button>
                  <span className="font-semibold min-w-[20px] text-center">
                    {updatingQuantityId === item.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
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
                    className="hover:bg-[#0A6DC0] hover:text-white duration-200 rounded-full p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={18} />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      Delivery ({item.delivery ? "yes" : "no"})
                    </span>
                    <div className="flex items-center gap-2">
                      {updatingDeliveryId === item.id ? (
                        <div className="flex items-center justify-center w-12">
                          <ClipLoader
                            size={16}
                            color="#0A6DC0"
                            speedMultiplier={0.8}
                          />
                        </div>
                      ) : (
                        <Switch
                          checked={item.delivery}
                          onCheckedChange={() =>
                            handleToggleDelivery(item.id, item.delivery)
                          }
                          disabled={updatingDeliveryId === item.id}
                          className={`data-[state=checked]:bg-[#0A6DC0] ${
                            updatingDeliveryId === item.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <AlertDialog
                    open={openDeleteDialog === item.id}
                    onOpenChange={(open) => {
                      if (!open) setOpenDeleteDialog(null);
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full duration-200"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="">
                      <AlertDialogHeader className="text-left">
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          remove this item from your cart.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-row items-center justify-end">
                        <AlertDialogCancel disabled={deletingId === item.id}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-[#E33629] hover:bg-[#c72b1f] min-w-[80px] h-[40px] flex items-center justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(item.id);
                          }}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? (
                            <ClipLoader size={20} color="white" />
                          ) : (
                            "Continue"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}

          <div className="px-4">
            <div className="flex justify-between items-center">
              <p className="font-dm-sans font-medium text-[#9E9A9A] text-[14px] md:text-[16px]">
                calculateSubtotal
              </p>
              <span className="font-dm-sans text-[#2F2F2F] font-medium">
                {calculateSubtotal()}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Button className=" py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#085a9e] text-[16px] font-bold w-full">
          Make Payment
        </Button>
      </div>
    </div>
  );
};

export default Cart;
