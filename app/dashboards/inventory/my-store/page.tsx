"use client";

import { Card } from "@/components/ui/card";
import { MoveRight, Loader2, UserPen } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useStores } from "@/hooks/useStores";
import { useState, useEffect } from "react";
import { getAttendants } from "@/actions/getAttendant";

interface Attendant {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  accountStatus: "ACTIVE" | "INACTIVE" | string;
}

const MyStore = () => {
  const {
    stores,
    isLoading: storesLoading,
    error: storesError,
    refetch: refetchStores,
  } = useStores();
  const router = useRouter();

  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [attendantsLoading, setAttendantsLoading] = useState(true);
  const [attendantsError, setAttendantsError] = useState<string | null>(null);

  // Fetch attendants when token is available
  useEffect(() => {
    const fetchAttendants = async () => {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        setAttendantsError("No authentication token found. Please log in.");
        setAttendantsLoading(false);
        return;
      }

      setAttendantsLoading(true);
      setAttendantsError(null);

      const result = await getAttendants(token);

      if (result.success) {
        setAttendants(result.data || []);
      } else {
        setAttendantsError(result.message || "Failed to load attendants");
      }

      setAttendantsLoading(false);
    };

    fetchAttendants();
  }, []);

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "INACTIVE":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800";
    }
  };

  if (storesError) {
    return (
      <div className="p-5 flex items-center justify-center flex-col gap-3">
        <p className="text-red-600 text-center">{storesError}</p>
        <Button
          onClick={refetchStores}
          className="mt-4 bg-[#0A6DC0] hover:bg-[#085a9e]"
        >
          Retry Stores
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex md:items-center md:gap-0 gap-3 justify-between flex-col md:flex-row">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F] ">
            My Stores
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] ">
            Here are all the details about your stores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/dashboards/inventory/create-store")}
            className="bg-[#0A6DC0] hover:bg-[#09599a] w-[50%] md:w-full text-[13px] md:text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6 text-white"
          >
            + Add New Store
          </Button>
          <Button
            onClick={() => router.push("/dashboards/inventory/add-attendant")}
            className="bg-[#0A2540] hover:bg-[#304c6a] w-[50%] md:w-full text-[13px] md:text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6 text-white"
          >
            + Add New Attendant
          </Button>
        </div>
      </div>

      {/* Stores Table */}
      <Card className="md:p-5">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold">
          My Stores ({stores.length})
        </h1>
        <Card className="mt-3 py-5 relative">
          {storesLoading || stores.length === 0 ? (
            <div className="py-20 px-4">
              {storesLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <ThreeDots
                    height="80"
                    width="80"
                    color="#0A6DC0"
                    visible={true}
                  />
                  <p className="mt-4 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                    Loading stores...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Image
                    src="/store.svg"
                    alt="No store"
                    height={90}
                    width={90}
                  />
                  <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                    No store found
                  </p>
                  <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                    Your store will appear here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] ">
                <thead className="border-b border-[#E6E6E6]">
                  <tr>
                    <th className="text-left pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Store Name
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Store Address
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Product Count
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Inventory Value
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stores.map((store) => (
                    <tr
                      key={store.id}
                      className="hover:bg-gray-50  cursor-pointer transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                      onClick={() =>
                        router.push(
                          `/dashboards/inventory/my-store/${store.id}`
                        )
                      }
                    >
                      <td className="py-4 pl-4 font-medium">{store.name}</td>
                      <td className="py-4">{store.address.name}</td>
                      <td className="py-4">{store.stock_count}</td>
                      <td className="py-4">
                        ₦{store.stock_value.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <MoveRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Card>

      {/* Attendants Table - same style */}
      <Card className="md:p-5">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold">
          My Attendants ({attendants.length})
        </h1>
        <Card className="mt-3 py-5 relative">
          {attendantsLoading ? (
            <div className="py-20 px-4 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#0A6DC0]" />
              <p className="mt-4 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                Loading attendants...
              </p>
            </div>
          ) : attendantsError ? (
            <div className="py-20 px-4 flex flex-col items-center justify-center gap-4">
              <p className="text-red-600 dark:text-red-400 text-center">
                {attendantsError}
              </p>
              <Button
                onClick={() => {
                  setAttendantsLoading(true);
                  setAttendantsError(null);
                  // Re-trigger fetch by changing dependency or calling again
                  window.location.reload(); // simple retry - improve later
                }}
                className="bg-[#0A6DC0] hover:bg-[#085a9e]"
              >
                Retry
              </Button>
            </div>
          ) : attendants.length === 0 ? (
            <div className="py-20 px-4 flex flex-col items-center justify-center space-y-4">
            <UserPen size={40} />
              {/* change icon if needed */}
              <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                No attendants found
              </p>
              <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                Your attendants will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-[#E6E6E6]">
                  <tr>
                    <th className="text-left pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Full Name
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Email
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Phone Number
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Status
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendants.map((attendant) => (
                    <tr
                      key={attendant.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                      // Optional: make row clickable if you have detail page
                      // onClick={() => router.push(`/dashboards/attendants/${attendant.id}`)}
                    >
                      <td className="py-4 pl-4 font-medium">
                        {attendant.fullname}
                      </td>
                      <td className="py-4">{attendant.email}</td>
                      <td className="py-4">{attendant.phone}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            attendant.accountStatus
                          )}`}
                        >
                          {attendant.accountStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        <MoveRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Card>
    </div>
  );
};

export default MyStore;
