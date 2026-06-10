"use client";

import {
  MoveRight,
  Loader2,
  UserPen,
  MoveLeft,
  MoveRightIcon,
} from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useStores } from "@/hooks/useStores";
import { useState, useEffect, useMemo } from "react";
import { handleGetAttendants } from "@/lib/utils/api/apiHelper";
import { useUser } from "@/context/userContext";

interface Attendant {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  accountStatus: "ACTIVE" | "INACTIVE" | string;
}

const ITEMS_PER_PAGE = 5;

const MyStore = () => {
  const {
    stores,
    isLoading: storesLoading,
    error: storesError,
    refetch: refetchStores,
  } = useStores();
  const router = useRouter();
  const { canViewStoreInfo, isAttendant, canAddStock } = useUser();

  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [attendantsLoading, setAttendantsLoading] = useState(true);
  const [attendantsError, setAttendantsError] = useState<string | null>(null);

  const [storesPage, setStoresPage] = useState(1);

  const storesTotalPages = useMemo(
    () => Math.ceil((stores?.length || 0) / ITEMS_PER_PAGE) || 1,
    [stores?.length],
  );

  const paginatedStores = useMemo(() => {
    if (!stores) return [];
    const start = (storesPage - 1) * ITEMS_PER_PAGE;
    return stores.slice(start, start + ITEMS_PER_PAGE);
  }, [stores, storesPage]);

  useEffect(() => {
    if (storesPage > storesTotalPages) {
      setStoresPage(Math.max(1, storesTotalPages));
    }
  }, [storesTotalPages, storesPage]);

  const [attendantsPage, setAttendantsPage] = useState(1);

  const attendantsTotalPages = useMemo(
    () => Math.ceil(attendants.length / ITEMS_PER_PAGE) || 1,
    [attendants.length],
  );

  const paginatedAttendants = useMemo(() => {
    const start = (attendantsPage - 1) * ITEMS_PER_PAGE;
    return attendants.slice(start, start + ITEMS_PER_PAGE);
  }, [attendants, attendantsPage]);

  useEffect(() => {
    if (attendantsPage > attendantsTotalPages) {
      setAttendantsPage(Math.max(1, attendantsTotalPages));
    }
  }, [attendantsTotalPages, attendantsPage]);

  useEffect(() => {
    const fetchAttendants = async () => {
      setAttendantsLoading(true);
      setAttendantsError(null);
      try {
        const result = await handleGetAttendants();
        if (result?.data?.attendants) {
          setAttendants(result.data.attendants);
        } else {
          setAttendantsError("Failed to load attendants");
        }
      } catch {
        setAttendantsError("Failed to load attendants");
      } finally {
        setAttendantsLoading(false);
      }
    };

    fetchAttendants();
  }, []);

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

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 ${
            currentPage === i
              ? "bg-[#0A6DC0] text-white hover:bg-[#0A6DC0]"
              : ""
          }`}
          onClick={() => onChange(i)}
        >
          {i}
        </Button>,
      );
    }

    return (
      <div className="flex flex-row justify-between items-center mt-6 gap-4">
        <button
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
          className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-40"
        >
          <MoveLeft /> Previous
        </button>

        <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
          {pages}
        </div>

        <div className="flex items-center gap-8 lg:gap-10">
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onChange(currentPage + 1)}
            className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-40"
          >
            Next <MoveRightIcon />
          </button>

          <div className="hidden lg:block text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
            {Math.min(
              currentPage * ITEMS_PER_PAGE,
              totalPages * ITEMS_PER_PAGE,
            )}{" "}
            of {totalPages * ITEMS_PER_PAGE}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex lg:items-center lg:gap-0 gap-3 justify-between flex-col lg:flex-row mb-3">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            My Stores
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A]">
            Here are all the details about your stores
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canAddStock() && (
            <Button
              onClick={() => router.push("/inventory/create-store")}
              className="bg-[#0A6DC0] hover:bg-[#09599a] w-[50%] md:w-full text-[13px] md:text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6 text-white"
            >
              + Add New Store
            </Button>
          )}

          {!isAttendant && (
            <Button
              onClick={() => router.push("/inventory/add-attendant")}
              className="bg-[#0A2540] hover:bg-[#304c6a] w-[50%] md:w-full text-[13px] md:text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6 text-white"
            >
              + Add New Attendant
            </Button>
          )}
        </div>
      </div>

      <div className="md:p-6 lg:border border-[#E4E4E4]  font-dm-sans rounded-[20px] bg-white mb-3 md:mb-5">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold">
          My Stores ({stores?.length ?? 0})
        </h1>

        <div className="py-3 relative min-h-[300px]">
          {storesError ? (
            /* error state */
            <div className="py-20 px-4 flex flex-col items-center justify-center gap-4">
              <p className="text-red-600 dark:text-red-400 text-center">
                {storesError}
              </p>
              <Button
                onClick={refetchStores}
                className="bg-[#0A6DC0] hover:bg-[#085a9e]"
              >
                Retry Stores
              </Button>
            </div>
          ) : storesLoading ? (
            /* loading */
            <div className="py-20 px-4 flex flex-col items-center justify-center">
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
          ) : (stores?.length ?? 0) === 0 ? (
            /* empty */
            <div className="py-20 px-4 flex flex-col items-center justify-center space-y-4">
              <Image src="/store.svg" alt="No store" height={90} width={90} />
              <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                No store found
              </p>
              <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                Your store will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto lg:border border-[#E4E4E4] md:rounded-[20px] bg-white">
                <table className="w-full">
                  <thead className="border-b border-[#E6E6E6]">
                    <tr>
                      <th className="text-left py-3 md:pl-4 font-medium text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                        Store Name
                      </th>
                      <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                        Store Address
                      </th>
                      <th className="hidden md:table-cell ... font-medium">
                        Product Count
                      </th>
                      <th className="hidden md:table-cell ... font-medium">
                        Inventory Value
                      </th>
                      <th className="text-left py-3 ...font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedStores.map((store) => (
                      <tr
                        key={store.id}
                        className="hover:bg-gray-50 cursor-pointer ..."
                        onClick={() => {
                          if (!canViewStoreInfo()) return;
                          router.push(`/inventory/my-store/${store.id}`);
                        }}
                      >
                        <td className="py-4 md:pl-4 font-medium">
                          {store.name}
                        </td>
                        <td className="hidden md:table-cell py-4">
                          {store.address?.name || "—"}
                        </td>
                        <td className="hidden md:table-cell py-4">
                          {store.stock_count ?? 0}
                        </td>
                        <td className="hidden md:table-cell py-4">
                          ₦{(store.stock_value ?? 0).toLocaleString()}
                        </td>
                        <td className="py-4">
                          <MoveRight className="w-5 h-5 text-gray-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stores Pagination */}
              {renderPagination(storesPage, storesTotalPages, setStoresPage)}
            </>
          )}
        </div>
      </div>

      {!isAttendant && (
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
          <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold">
            My Attendants ({attendants.length})
          </h1>

          <div className="py-3 relative min-h-[300px]">
            {attendantsLoading ? (
              /* loading */
              <div className="py-20 px-4 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#0A6DC0]" />
                <p className="mt-4 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                  Loading attendants...
                </p>
              </div>
            ) : attendantsError ? (
              /* error */
              <div className="py-20 px-4 flex flex-col items-center justify-center gap-4">
                <p className="text-red-600 dark:text-red-400 text-center">
                  {attendantsError}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-[#0A6DC0] hover:bg-[#085a9e]"
                >
                  Retry
                </Button>
              </div>
            ) : attendants.length === 0 ? (
              /* empty */
              <div className="py-20 px-4 flex flex-col items-center justify-center space-y-4">
                <UserPen size={40} />
                <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                  No attendants found
                </p>
                <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                  Your attendants will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto lg:border border-[#E4E4E4] md:rounded-[20px] bg-white">
                  <table className="w-full">
                    <thead className="border-b border-[#E6E6E6]">
                      <tr>
                        <th className="text-left py-3 md:pl-4 ... font-medium">
                          Full Name
                        </th>
                        <th className="hidden md:table-cell ... font-medium">
                          Email
                        </th>
                        <th className="hidden md:table-cell ... font-medium">
                          Phone Number
                        </th>
                        <th className="hidden md:table-cell ... font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedAttendants.map((attendant) => (
                        <tr
                          key={attendant.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 ..."
                        >
                          <td className="py-4 md:pl-4 font-medium">
                            {attendant.fullname}
                          </td>
                          <td className="hidden md:table-cell py-4">
                            {attendant.email}
                          </td>
                          <td className="hidden md:table-cell py-4">
                            {attendant.phone}
                          </td>
                          <td className="hidden md:table-cell py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                attendant.accountStatus,
                              )}`}
                            >
                              {attendant.accountStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Attendants Pagination */}
                {renderPagination(
                  attendantsPage,
                  attendantsTotalPages,
                  setAttendantsPage,
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStore;
