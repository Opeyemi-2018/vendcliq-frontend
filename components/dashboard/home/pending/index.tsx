import { WarningAlert } from "@/components/ui/WarningAlert";
import React from "react";
import RequestCard from "../RequestCard";
import { Landmark } from "lucide-react";

export const PendingAccountDashboard = () => {
  return (
    <div>
      <WarningAlert />
      <div className="py-5 px-10">
        <h1 className="text-black font-medium text-2xl font-sans">
          Let’s get you started
        </h1>

        <div className="flex space-x-4 mt-5">
          <RequestCard
            title="Request Loan"
            description="Buy more with Vera Africa, request loan for your business and pay small small"
            buttonText="Request loan"
            icon={<Landmark size={44} />}
            primaryColor="bg-primary"

            // onRequestLoan={() => console.log("Loan Requested")}
          />

          <RequestCard
            title="Receive Money"
            description="Create your business account and receive money from your customers"
            buttonText="Receive money"
            icon={<Landmark size={44} />}
            primaryColor="bg-primary"

            // onRequestLoan={() => console.log("Loan Requested")}
          />
        </div>
      </div>
    </div>
  );
};
