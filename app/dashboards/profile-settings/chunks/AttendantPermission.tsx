"use client";

import { useState, useEffect } from "react";
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
import { getAttendants } from "@/actions/getAttendant";
import { handleAssignAttendantPermissions } from "@/lib/utils/api/apiHelper"; // ← your helper
import { Separator } from "@/components/ui/separator";
import { ClipLoader } from "react-spinners";

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

  const [permissions, setPermissions] = useState({
    can_buy: true,
    can_sell: true,
    can_update_stock: true,
    can_move_stock: false,
    can_add_stock: true,
    can_market_place: true,
    can_push_to_market: false,
    can_view_store_info: true,
    can_reporting: true,
    can_expenses: false,
  });

  useEffect(() => {
    const fetchAttendants = async () => {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      setIsLoadingAttendants(true);
      const result = await getAttendants(token);

      if (result.success) {
        setAttendants(result.data || []);
      } else {
        toast.error(result.message || "Failed to load attendants");
      }

      setIsLoadingAttendants(false);
    };

    fetchAttendants();
  }, []);

  const togglePermission = (key: keyof typeof permissions) => {
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

    const payload = {
      attendant_id: parseInt(selectedAttendantId),
      ...permissions,
    };

    try {
      const res = await handleAssignAttendantPermissions(payload);

      if (res.statusCode === 201) {
        toast.success("Permissions assigned successfully!");
        setSelectedAttendantId(""); // reset selection
      } else {
        const errorMsg =
          res.error || res.message || "Failed to assign permissions";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Error assigning permissions"
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
            <SelectTrigger className="w-full py-6">
              <SelectValue placeholder="Choose an attendant" />
            </SelectTrigger>
            <SelectContent>
              {attendants.map((att) => (
                <SelectItem
                  key={att.id}
                  value={att.id.toString()}
                  className="space-y-2"
                >
                  {att.fullname} ({att.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Permissions Switches */}
      <div className="space-y-2 mb-10">
        {permissionList.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between py-2 border-b border-[#D8D8D866]"
          >
            <Label htmlFor={key} className="text-base cursor-pointer">
              {label}
            </Label>
            <Switch
              id={key}
              checked={permissions[key as keyof typeof permissions]}
              onCheckedChange={() =>
                togglePermission(key as keyof typeof permissions)
              }
              className="data-[state=checked]:bg-[#0A6DC0] data-[state=unchecked]:bg-gray-300"
            />
          </div>
        ))}
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={isSubmitting || !selectedAttendantId}
        className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white py-6 text-lg font-medium transition disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            Assigning...
            <ClipLoader size={24} color="white" />
          </>
        ) : (
          "Update Permission for Attendant"
        )}
      </Button>
    </div>
  );
};

export default AssignAttendantPermissions;
