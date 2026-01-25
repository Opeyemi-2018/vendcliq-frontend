"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const PaymentSubscription = () => {
  const router = useRouter();
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
      <div className="bg-[url('/balance-bg.svg')] space-y-2 font-dm-sans text-white my-6 bg-cover bg-no-repeat bg-center  rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <p className="font-medium">Your Current Plan</p>
          <Button
            onClick={() => router.push("/dashboards/plans")}
            variant={"outline"}
            className=" font-bold text-[#0A6DC0]"
          >
            Upgrade Plan
          </Button>
        </div>

        <div className="">
          <h1 className="font-semibold text-[20px] md:text-[35px] font-clash">
            {" "}
            Smart Vendor
          </h1>
          <p className="font-bold">₦3,000/month</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="border-b"
            onClick={() => router.push("/dashboards/plans")}
          >
            View usage
          </button>
          <Button className=" font-bold bg-[#0A6DC0] hover:bg-[#085a9e]">
            29 days remaining
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSubscription;
