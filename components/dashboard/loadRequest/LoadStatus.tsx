import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/services/profile/Profile";
import Link from "next/link";
import React from "react";

const LoanStatus: React.FC = () => {
  const { profile } = useGetProfile();

  console.log("email", profile?.email.email);
  const email = profile?.email.email;
  return (
    <div className="flex bg-white p-6">
      <div className=" w-full  mx-auto">
        <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
          Loan Status
        </h3>
        {/* Loan Status Steps */}
        <div className="flex items-center gap-4 mb-6">
          <Step number={1} title="Processing" active />
          <Step number={2} title="Approved" />
        </div>

        {/* Application Status */}
        <h2 className="text-lg font-semibold mb-4">Application Status</h2>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
          <h3 className="text-md font-semibold mb-2">Congratulations</h3>
          <p className="text-sm text-gray-700">
            Your loan is currently under review. <br />
            An email will be sent to <strong>{email}</strong> on the status of
            your application, usually within 24–48hrs. Go to your loan dashboard
            to monitor your loans.
          </p>
        </div>

        <Link href={"/dashboard/loans"}>
          <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-md text-center font-semibold">
            Go to Loan Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Step Component for Loan Status Steps
const Step: React.FC<{ number: number; title: string; active?: boolean }> = ({
  number,
  title,
  active,
}) => (
  <div
    className={`flex items-center px-4 py-2 rounded-full ${
      active ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    <div className="flex items-center justify-center w-6 h-6 rounded-full mr-2 font-semibold">
      {number}
    </div>
    <span className="text-sm font-medium">{title}</span>
  </div>
);

export default LoanStatus;
