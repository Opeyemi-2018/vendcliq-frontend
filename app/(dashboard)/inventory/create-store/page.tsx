"use client";

import { useState } from "react";
import Store from "./chunks/Store";
import Stock from "./chunks/Stock";

const CreateStorePage = () => {
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);

  const handleStoreCreated = (storeId: string) => {
    setCreatedStoreId(storeId);
    setShowStockForm(true);
  };

 

  return (
    <div className="min-h-screen">
      <div className="mb-6 md:mb-10">
        <h1 className="text-[#2F2F2F] font-semibold font-clash text-[20px] md:text-[25px]">
          {showStockForm ? "Add Stock to Store" : "Create Store"}
        </h1>
        <p className="text-[#9E9A9A] font-dm-sans text-[16px] font-medium">
          {showStockForm
            ? "Add products to your new store to start managing inventory."
            : "Let's get your store up and running — just a few quick details to start."}
        </p>
      </div>

      {showStockForm && createdStoreId ? (
        <Stock storeId={createdStoreId} />
      ) : (
        <Store onCreateStore={handleStoreCreated} />
      )}
    </div>
  );
};

export default CreateStorePage;
