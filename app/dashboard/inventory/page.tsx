"use client";

import { parseCookies } from "nookies";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const cookies = parseCookies();
    const Token = cookies.authToken;
    // console.log(Token);
    if (Token) {
      window.location.href = `https://erp.vendcliq.com/main?page=Dashboard&email=${cookies.email}`;
    }
  }, []);
  return (
    <div>
      <p className="text-2xl p-10">Redirecting to Inventory...</p>
    </div>
  );
};

export default Page;
