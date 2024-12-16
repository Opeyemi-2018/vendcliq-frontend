import { WarningAlert } from "@/components/ui/WarningAlert";
import React from "react";
import RequestCard from "../RequestCard";
import { Landmark } from "lucide-react";
import { useRouter } from "next/navigation";

export const PendingAccountDashboard = () => {
  const router = useRouter();
  return (
    <div>
      <WarningAlert />
      <div className="py-5 px-4 sm:px-6 md:px-8 lg:px-10">
        <h1 className="text-black font-[500] line-height-[26.04px] text-[20px] sm:text-[24px] font-sans">
          Let&apos;s get you started
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 mt-5">
          <RequestCard
            title="Request Loan"
            description="Buy more with Vera Africa, request loan for your business and pay small small"
            buttonText="Request loan"
            icon={<Landmark size={44} />}
            primaryColor="bg-primary"
            onRequestLoan={() => router.push("/dashboard/request")}
          />

          <RequestCard
            title="Receive Money"
            description="Create your business account and receive money from your customers"
            buttonText="Receive money"
            icon={<Landmark size={44} />}
            primaryColor="bg-primary"
            onRequestLoan={() => router.push("/dashboard/receive")}
          />
        </div>
      </div>
    </div>
  );
};
