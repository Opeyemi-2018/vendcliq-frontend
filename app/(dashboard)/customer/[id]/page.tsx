/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  handleGetCustomerById,
  handleReturnCustomerEmpties,
} from "@/lib/utils/api/apiHelper";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import { ThreeDots } from "react-loader-spinner";

interface EmptyRecord {
  id: string;
  quantity: number;
  created_at: string;
  stock: {
    sku: string;
    product: {
      name: string;
      image: string;
    };
  };
  attributes?: {
    originalQuantity: number;
    remainingQuantity: number;
    totalQuantityReturned: number;
  };
}

const getOriginalQty = (item: EmptyRecord) =>
  item.attributes?.originalQuantity ?? item.quantity;

const getReturnedQty = (item: EmptyRecord) =>
  item.attributes?.totalQuantityReturned ?? 0;

const getRemainingQty = (item: EmptyRecord) =>
  item.attributes?.remainingQuantity ?? item.quantity;

export default function CustomerEmptiesPage() {
  const params = useParams();
  const customerId = (params?.id ?? params?.customerId) as string;
  const router = useRouter();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedEmpty, setSelectedEmpty] = useState<EmptyRecord | null>(null);
  const [returnQty, setReturnQty] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    if (customerId) loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const res = await handleGetCustomerById(customerId);
      if (res?.statusCode === 200 && res?.data) {
        setCustomer(res.data);
      } else {
        toast.error(res?.error || "Failed to load customer details");
      }
    } catch (err: any) {
      toast.error(
        err?.message || err?.error || "Could not fetch customer data",
      );
    } finally {
      setLoading(false);
    }
  };

  const openReturnModal = (item: EmptyRecord) => {
    setSelectedEmpty(item);
    setReturnQty("");
    setNotes("");
    setReturnDialogOpen(true);
  };

  const handleSubmitReturn = async () => {
    if (!customerId || !selectedEmpty || !returnQty) return;

    const qty = parseInt(returnQty, 10);

    try {
      setIsSubmittingReturn(true);
      const res = await handleReturnCustomerEmpties(
        customerId,
        selectedEmpty.id,
        {
          quantityReturned: qty,
          notes: notes.trim() || "Customer returned empties",
        },
      );

      if ([200, 201].includes(res?.statusCode)) {
        toast.success("Empties returned successfully");
        setReturnDialogOpen(false);
        loadCustomer();
      } else {
        toast.error(res?.error || "Return failed");
      }
    } catch (err: any) {
      toast.error(err?.message || err?.error || "Error processing return");
    } finally {
      setIsSubmittingReturn(false);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center flex-col gap-4">
        <ThreeDots height="80" width="80" color="#0A6DC0" visible />
        <p className="text-muted-foreground">Loading empties data...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button variant="outline" onClick={() => router.back()}>
          ← Go Back
        </Button>
      </div>
    );
  }

  const empties: EmptyRecord[] = customer?.customer_empties ?? [];

  return (
    <div className="">
      <button onClick={() => router.back()}>
        <MoveLeft size={25} />
      </button>
      <div className="mb-8 flex items-center gap-4">
        <div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2F2F2F] font-clash">
              {customer.name}
            </h1>
            <p className="text-[#9E9A9A] font-medium">
              View {customer.name} empties details
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-72">Image & Product Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Qty Returned</TableHead>
              <TableHead>Qty Remaining</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md bg-muted animate-pulse shrink-0" />
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3 w-10 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3 w-10 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3 w-10 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : empties.length > 0 ? (
              empties.map((item) => {
                const remaining = getRemainingQty(item);
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.stock?.product?.image ? (
                          <Image
                            src={item.stock.product.image}
                            alt={item.stock?.product?.name || "product"}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-md border object-contain bg-white p-1 shrink-0"
                            onError={(e) =>
                              (e.currentTarget.src = "/placeholder-image.png")
                            }
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-medium leading-tight">
                            {item.stock?.product?.name || "Unknown Product"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.stock?.sku || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell>{getOriginalQty(item)}</TableCell>

                    <TableCell>{getReturnedQty(item)}</TableCell>

                    <TableCell
                      className={
                        remaining > 0
                          ? "font-semibold text-emerald-700"
                          : "text-muted-foreground"
                      }
                    >
                      {remaining}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      {remaining > 0 ? (
                        <Button
                          size="sm"
                          className="bg-[#0A6DC0] hover:bg-[#09599a] text-white"
                          onClick={() => openReturnModal(item)}
                        >
                          Return
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Fully returned
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-64 text-center text-muted-foreground"
                >
                  No empty records for this customer yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Return Modal — pre-filled from the clicked row, no select */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Return Empties</DialogTitle>
            <DialogDescription>
              {selectedEmpty?.stock?.product?.name || "Product"} —{" "}
              {customer.name}
            </DialogDescription>
          </DialogHeader>

          {selectedEmpty && (
            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                {selectedEmpty.stock?.product?.image ? (
                  <Image
                    src={selectedEmpty.stock.product.image}
                    alt={selectedEmpty.stock?.product?.name || "product"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md border object-contain bg-white p-1 shrink-0"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-image.png")
                    }
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                    No img
                  </div>
                )}
                <div>
                  <p className="font-medium leading-tight">
                    {selectedEmpty.stock?.product?.name || "Unknown Product"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmpty.stock?.sku || "—"}
                  </p>
                </div>
              </div>

              {/* Qty breakdown */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/40 border text-center">
                  <p className="text-muted-foreground mb-0.5">Original</p>
                  <p className="font-semibold text-base">
                    {getOriginalQty(selectedEmpty)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border text-center">
                  <p className="text-muted-foreground mb-0.5">Returned</p>
                  <p className="font-semibold text-base">
                    {getReturnedQty(selectedEmpty)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-muted-foreground mb-0.5">Remaining</p>
                  <p className="font-semibold text-base text-emerald-700">
                    {getRemainingQty(selectedEmpty)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Quantity to Return
                </label>
                <input
                  type="number"
                  min={1}
                  max={getRemainingQty(selectedEmpty)}
                  value={returnQty}
                  onChange={(e) => setReturnQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6DC0] focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground">
                  Max returnable: {getRemainingQty(selectedEmpty)}
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Notes{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Returned during delivery"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setReturnDialogOpen(false)}
              disabled={isSubmittingReturn}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={!returnQty || isSubmittingReturn}
              className="bg-[#0A6DC0] hover:bg-[#09599a]"
            >
              {isSubmittingReturn ? "Submitting..." : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
