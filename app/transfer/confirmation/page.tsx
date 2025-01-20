"use client"; // Marks this page as a client component

import TransferConfirmation from "@/components/dashboard/transfer/TransferConfirmation";
import React from "react";

const TransferPage: React.FC = () => {
  const handlePinSubmit = () => {
    // console.log("Entered PIN:", pin);
    // Handle transfer confirmation logic here
  };

  return (
    <div className="min-h-screen px-5 flex justify-center">
      <TransferConfirmation
        account="Chukwudi & Sons"
        accountName="Erik Ten Hag"
        accountNumber="0193459024"
        amount="NGN5,000,000"
        date="20 May 2024"
        charges="NGN0.00"
        onPinSubmit={handlePinSubmit}
      />
    </div>
  );
};

export default TransferPage;
