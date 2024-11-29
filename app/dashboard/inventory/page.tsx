"use client";
import { cookies } from "next/headers";
import { parseCookies } from "nookies";
import React, { useEffect } from "react";

const page = () => {
  useEffect(() => {
    const cookies = parseCookies();
    const Token = cookies.authToken;
    console.log(Token);
    if (Token) {
      window.location.href = `https://erp.vendcliq.com/version-test/main?&page=Dashboard&token=${Token}`;
    }
  }, []);
  return (
    <div>
      <p className="text-2xl p-10">Redirecting to Inventory...</p>
    </div>
  );
};

export default page;
