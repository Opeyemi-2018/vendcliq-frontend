/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { useCustomerEmpties, useReturnCustomerEmpties } from "@/hooks/useCustomers";

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

  const { data: empties = [], customer, isLoading, error } = useCustomerEmpties(customerId);
  const returnEmpties = useReturnCustomerEmpties();

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedEmpty, setSelectedEmpty] = useState<EmptyRecord | null>(null);
  const [returnQty, setReturnQty] = useState<string>("");
  const [notes, setNotes] = useState("");

  const openReturnModal = (item: EmptyRecord) => {
    setSelectedEmpty(item);
    setReturnQty("");
    setNotes("");
    setReturnDialogOpen(true);
  };

  const handleSubmitReturn = async () => {
    if (!customerId || !selectedEmpty || !returnQty) return;

    const qty = parseInt(returnQty, 10);
    const remaining = getRemainingQty(selectedEmpty);

    if (qty > remaining) {
      toast.error(`Cannot return more than ${remaining} units`);
      return;
    }

    try {
      await returnEmpties.mutateAsync({
        customerId,
        emptiesId: selectedEmpty.id,
        payload: {
          quantityReturned: qty,
          notes: notes.trim() || "Customer returned empties",
        },
      });
      toast.success("Empties returned successfully");
      setReturnDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || err?.error || "Error processing return");
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold">Error loading customer</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={() => router.back()}>
          ← Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      <button onClick={() => router.back()}>
        <MoveLeft size={25} />
      </button>
      <div className="mb-8 flex items-center gap-4">
        <div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2F2F2F] font-clash">
              {customer?.name || "Customer"}
            </h1>
            <p className="text-[#9E9A9A] font-medium">
              View {customer?.name || "customer"} empties details
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
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
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
                  <TableCell><div className="h-3 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-3 w-10 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-3 w-10 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-3 w-10 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : empties.length > 0 ? (
              empties.map((item: EmptyRecord) => {
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
                    <TableCell className={remaining > 0 ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
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
                <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                  No empty records for this customer yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Return Modal */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Return Empties</DialogTitle>
            <DialogDescription>
              {selectedEmpty?.stock?.product?.name || "Product"} — {customer?.name}
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
                    onError={(e) => (e.currentTarget.src = "/placeholder-image.png")}
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

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/40 border text-center">
                  <p className="text-muted-foreground mb-0.5">Original</p>
                  <p className="font-semibold text-base">{getOriginalQty(selectedEmpty)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border text-center">
                  <p className="text-muted-foreground mb-0.5">Returned</p>
                  <p className="font-semibold text-base">{getReturnedQty(selectedEmpty)}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-muted-foreground mb-0.5">Remaining</p>
                  <p className="font-semibold text-base text-emerald-700">
                    {getRemainingQty(selectedEmpty)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity to Return</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Notes <span className="text-muted-foreground font-normal">(optional)</span>
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
              disabled={returnEmpties.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={!returnQty || returnEmpties.isPending}
              className="bg-[#0A6DC0] hover:bg-[#09599a]"
            >
              {returnEmpties.isPending ? "Submitting..." : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}