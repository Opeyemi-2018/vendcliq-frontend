"use client";

import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.location.href = "https://erp.vendcliq.com/";
  }, []);

  return (
    <div>
      <p className="text-2xl p-10">Redirecting to Inventory...</p>
    </div>
  );
};

export default Page;
