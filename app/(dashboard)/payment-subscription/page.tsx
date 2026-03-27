"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { handleGetMySubscription } from "@/lib/utils/api/apiHelper";
import { format } from "date-fns";
import { GetSubscriptionResponse } from "@/types/plans";
import { ClipLoader } from "react-spinners";

const PaymentSubscription = () => {
  const router = useRouter();

  const [subscription, setSubscription] = useState<
    GetSubscriptionResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await handleGetMySubscription();
        if (res.statusCode === 200 && res.data) {
          setSubscription(res.data);
        } else {
          toast.error("Failed to load subscription");
        }
      } catch (err) {
        toast.error("Error fetching subscription");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Calculate days remaining
  const daysRemaining = subscription?.next_billing_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.next_billing_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const planName = subscription?.plan?.name || "—";
  const amount = subscription?.amount
    ? `₦${Number(subscription.amount).toLocaleString()}`
    : "₦0";
  const billingType = subscription?.billing_type
    ? subscription.billing_type.charAt(0).toUpperCase() +
      subscription.billing_type.slice(1)
    : "—";
  const status = subscription?.status || "Unknown";
  const dueDate = subscription?.next_billing_date
    ? format(new Date(subscription.next_billing_date), "MMM dd, yyyy")
    : "—";

  const statusColor =
    status === "ACTIVE"
      ? "bg-[#0A6DC0]"
      : status === "GRACE"
        ? "bg-yellow-600 hover:bg-yellow-700"
        : "bg-red-600 hover:bg-red-700";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
          Payment and Subscriptions
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
          View your current subscription, manage your plan and upgrade when
          necessary.
        </p>
      </div>

      {/* Your existing card - unchanged */}
      <div className="bg-[url('/balance-bg.svg')] space-y-2 font-dm-sans text-white my-6 bg-cover bg-no-repeat bg-center rounded-2xl p-6 relative overflow-hidden">
        {loading ? (
          <>
            <Skeleton className="h-6 w-32 bg-white/20" />
            <Skeleton className="h-10 w-3/4 bg-white/20" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24 bg-white/20" />
              <Skeleton className="h-10 w-36 bg-white/20 rounded-md" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-medium">Your Current Plan</p>
              <Button
                onClick={() => router.push("/plans")}
                variant={"outline"}
                className="font-bold text-[#0A6DC0]"
              >
                Upgrade Plan
              </Button>
            </div>

            <div className="">
              <h1 className="font-semibold text-[20px] md:text-[35px] font-clash">
                {planName}
              </h1>
              <p className="font-bold">
                {amount}/{billingType.toLowerCase()}
              </p>
            </div>

            {/* <div className="flex items-center justify-between"> */}
            {/* <button
                className="border-b hover:opacity-80 transition-opacity"
                onClick={() => router.push("/plans")}
              >
                View usage
              </button> */}

            <Button
              className={`md:font-bold float-right ${statusColor}`}
              // disabled={status !== "ACTIVE"}
            >
              {daysRemaining > 0
                ? `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} remaining`
                : "Expired"}
            </Button>
            {/* </div> */}
          </>
        )}
      </div>

      {/* New table section - same style as your store table */}
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg bg-white mb-3 md:mb-5">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold">
          Subscription Details
        </h1>

        <div className="py-3 relative">
          {loading ? (
            <div className="py-20 px-4">
              <div className="flex flex-col items-center justify-center">
                <ClipLoader size={30} color="#0A6DC0" className="ml-2" />
                <p className="mt-4 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                  Loading subscription...
                </p>
              </div>
            </div>
          ) : !subscription ? (
            <div className="py-20 px-4 flex flex-col items-center justify-center space-y-4">
              <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                No subscription found
              </p>
              <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                Your subscription details will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto lg:border border-[#E4E4E4] md:rounded-lg bg-white">
              <table className="w-full">
                <thead className="border-b border-[#E6E6E6]">
                  <tr>
                    <th className="text-left py-3 md:pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Plan Name
                    </th>
                    <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Billing Type
                    </th>
                    <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Amount
                    </th>
                    <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Due Date
                    </th>
                    <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50 cursor-default transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200">
                    <td className="py-4 md:pl-4 font-medium">{planName}</td>
                    <td className="hidden md:table-cell py-4 capitalize">
                      {billingType}
                    </td>
                    <td className="hidden md:table-cell py-4">{amount}</td>
                    <td className="hidden md:table-cell py-4">{dueDate}</td>
                    <td className="py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold lowercase ${
                          status === "ACTIVE"
                            ? "bg-[#E7F4EB] text-[#003909]"
                            : status === "GRACE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSubscription;
