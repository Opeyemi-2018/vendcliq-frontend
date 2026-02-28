/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ClipLoader } from "react-spinners";
import {
  handleGetAttendants,
  handleGetAttendantPermissions,
  handleAssignAttendantPermissions,
  handleUpdateAttendantPermissions,
} from "@/lib/utils/api/apiHelper";

interface Attendant {
  id: number;
  fullname: string;
  email: string;
}

const AssignAttendantPermissions = () => {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>("");
  const [isLoadingAttendants, setIsLoadingAttendants] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // Permissions state — starts empty, filled only after selection
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  // Load attendants list
  useEffect(() => {
    const fetchAttendants = async () => {
      setIsLoadingAttendants(true);
      try {
        const result = await handleGetAttendants();
        if (result?.data?.attendants) {
          setAttendants(result.data.attendants);
        } else {
          toast.error("Failed to load attendants");
        }
      } catch {
        toast.error("Error loading attendants");
      } finally {
        setIsLoadingAttendants(false);
      }
    };

    fetchAttendants();
  }, []);

  // Fetch permissions when attendant is selected
  useEffect(() => {
    if (!selectedAttendantId) {
      setPermissions({}); // Clear when deselected
      return;
    }

    const loadPermissions = async () => {
      setIsLoadingPermissions(true);
      try {
        const response =
          await handleGetAttendantPermissions(selectedAttendantId);
        const data = response?.data;

        if (data && typeof data === "object") {
          setPermissions({
            can_buy: !!data.can_buy,
            can_sell: !!data.can_sell,
            can_update_stock: !!data.can_update_stock,
            can_move_stock: !!data.can_move_stock,
            can_add_stock: !!data.can_add_stock,
            can_market_place: !!data.can_market_place,
            can_push_to_market: !!data.can_push_to_market,
            can_view_store_info: !!data.can_view_store_info,
            can_reporting: !!data.can_reporting,
            can_expenses: !!data.can_expenses,
          });
        } else {
          // No permissions exist → all false
          setPermissions({
            can_buy: false,
            can_sell: false,
            can_update_stock: false,
            can_move_stock: false,
            can_add_stock: false,
            can_market_place: false,
            can_push_to_market: false,
            can_view_store_info: false,
            can_reporting: false,
            can_expenses: false,
          });
        }
      } catch {
        // Error or 404 → all false
        setPermissions({
          can_buy: false,
          can_sell: false,
          can_update_stock: false,
          can_move_stock: false,
          can_add_stock: false,
          can_market_place: false,
          can_push_to_market: false,
          can_view_store_info: false,
          can_reporting: false,
          can_expenses: false,
        });
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [selectedAttendantId]);

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleConfirm = async () => {
    if (!selectedAttendantId) {
      toast.error("Please select an attendant");
      return;
    }

    setIsSubmitting(true);

    // Always include ALL required fields — fallback to false if missing
    const payload = {
      attendant_id: parseInt(selectedAttendantId),
      can_buy: permissions.can_buy ?? false,
      can_sell: permissions.can_sell ?? false,
      can_update_stock: permissions.can_update_stock ?? false,
      can_move_stock: permissions.can_move_stock ?? false,
      can_add_stock: permissions.can_add_stock ?? false,
      can_market_place: permissions.can_market_place ?? false,
      can_push_to_market: permissions.can_push_to_market ?? false,
      can_view_store_info: permissions.can_view_store_info ?? false,
      can_reporting: permissions.can_reporting ?? false,
      can_expenses: permissions.can_expenses ?? false,
    };

    try {
      const res = await handleAssignAttendantPermissions(payload);

      if (res.statusCode === 201) {
        toast.success("Permissions assigned successfully!");
        setSelectedAttendantId("");
        return;
      }

      const errorMsg =
        res.error ||
        res.message ||
        (res as any).msg ||
        "Failed to assign permissions";

      if (
        typeof errorMsg === "string" &&
        (errorMsg.toLowerCase().includes("already exists") ||
          errorMsg.toLowerCase().includes("use update instead"))
      ) {
        const updateRes = await handleUpdateAttendantPermissions(payload);

        if (updateRes.statusCode === 200) {
          toast.success("Permissions updated successfully!");
        } else {
          toast.error(
            updateRes.error ||
              updateRes.message ||
              "Failed to update permissions",
          );
        }
      } else {
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error saving permissions",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const permissionList = [
    { key: "can_buy", label: "Can Buy" },
    { key: "can_sell", label: "Can Sell" },
    { key: "can_update_stock", label: "Can Update Stock" },
    { key: "can_move_stock", label: "Can Move Stock" },
    { key: "can_add_stock", label: "Can Add Stock" },
    { key: "can_market_place", label: "Can Access Marketplace" },
    { key: "can_push_to_market", label: "Can Push to Market" },
    { key: "can_view_store_info", label: "Can View Store Info" },
    { key: "can_reporting", label: "Can View Reports" },
    { key: "can_expenses", label: "Can Manage Expenses" },
  ];

  return (
    <div className="">
      <div className="mb-4">
        <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
          Attendant Permission
        </h1>
        <Separator
          orientation="horizontal"
          className="h-[1px] mt-3"
          style={{ background: "#E0E0E0" }}
        />
        <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
          Control what features your sales attendants can access. Protect
          sensitive business data/actions.
        </p>
      </div>

      {/* Attendant Dropdown */}
      <div className="mb-8">
        <Label className="text-base font-medium mb-2 block">
          Select Attendant
        </Label>

        {isLoadingAttendants ? (
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading attendants...
          </div>
        ) : attendants.length === 0 ? (
          <p className="text-red-600">No attendants found</p>
        ) : (
          <Select
            value={selectedAttendantId}
            onValueChange={setSelectedAttendantId}
          >
            <SelectTrigger className="w-full py-5 md:py-6">
              <SelectValue placeholder="Choose an attendant" />
            </SelectTrigger>
            <SelectContent>
              {attendants.map((att) => (
                <SelectItem
                  key={att.id}
                  value={att.id.toString()}
                  className="space-y-2"
                >
                  {att.fullname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Permissions Switches - ONLY VISIBLE AFTER SELECTION */}
      {selectedAttendantId && (
        <div className="space-y-2 mb-5 md:mb-10">
          {isLoadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <ClipLoader size={24} color="#0A6DC0" />
              <span className="ml-3 text-gray-600">Loading permissions...</span>
            </div>
          ) : (
            permissionList.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-[#D8D8D866]"
              >
                <Label htmlFor={key} className="text-base cursor-pointer">
                  {label}
                </Label>
                <Switch
                  id={key}
                  checked={permissions[key] ?? false}
                  onCheckedChange={() => togglePermission(key)}
                  className="data-[state=checked]:bg-[#0A6DC0] data-[state=unchecked]:bg-gray-300"
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={isSubmitting || !selectedAttendantId || isLoadingPermissions}
        className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white py-5 md:py-6 transition disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            Processing...
            <ClipLoader size={24} color="white" className="ml-2" />
          </>
        ) : (
          "Save Attendant Permissions"
        )}
      </Button>
    </div>
  );
};

export default AssignAttendantPermissions;
