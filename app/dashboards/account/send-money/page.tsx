"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import VendCliqTransfer from "./chunks/VendCliqTransfer";
import OtherTransfer from "./chunks/OtherTransfer";
import { Landmark } from "lucide-react";

const SendMoney = () => {
  const [selectTransfer, setSelectTransfer] = useState<"vendcliq" | "other">(
    "vendcliq"
  );

  return (
    <div className="min-h-screen">
      <div>
        <h1 className="text-[#2F2F2F] font-semibold font-clash text-[20px] lg:text-[25px]">
          Send Money
        </h1>
        <p className="text-[#9E9A9A] font-dm-sans text-[16px] font-medium">
          send money to other accounts
        </p>
      </div>

      <div className="mt-5">
        {/* Mobile Tabs + Desktop Sidebar */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
          {/* Selector Panel */}
          <Card className="py-6 px-4 w-full lg:w-[35%] bg-white">
            <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold mb-2">
              Transfer Destination
            </h2>
            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />

            {/* Mobile: Horizontal tabs | Desktop: Vertical list */}
            <div className="mt-6">
              {/* Mobile Tabs */}
              <div className="flex lg:hidden gap-8 justify-between border-b border-gray-200">
                <button
                  onClick={() => setSelectTransfer("vendcliq")}
                  className={`flex  items-center gap-2 pb-4 transition-all ${
                    selectTransfer === "vendcliq"
                      ? "text-[#0A6DC0] font-semibold border-b-4 border-[#0A6DC0]"
                      : "text-[#9E9A9A] font-medium"
                  }`}
                >
                  <Image src="/v-b.svg" width={24} height={24} alt="Vendcliq" />
                  <span className="text-[14px]">Vendcliq Transfer</span>
                </button>

                <button
                  onClick={() => setSelectTransfer("other")}
                  className={`flex  items-center gap-2 pb-4 transition-all ${
                    selectTransfer === "other"
                      ? "text-[#0A6DC0] font-semibold border-b-4 border-[#0A6DC0]"
                      : "text-[#9E9A9A] font-medium"
                  }`}
                >
                  <Landmark size={24} color="#9E9A9A" />
                  <span className="text-[14px]">Other Bank</span>
                </button>
              </div>

              {/* Desktop: Original vertical list (hidden on mobile) */}
              <div className="hidden lg:flex lg:flex-col gap-6">
                <Label
                  onClick={() => setSelectTransfer("vendcliq")}
                  className={`
                    flex items-center justify-between py-5 px-4 rounded-2xl border-2 cursor-pointer transition-all
                    ${
                      selectTransfer === "vendcliq"
                        ? "border-[#0A6DC012] bg-[#0A6DC012]"
                        : "border-gray-200 bg-white"
                    }
                  `}
                >
                  <Image src="/v-b.svg" width={20} height={20} alt="logo" />
                  <div
                    className={`text-[16px] font-dm-sans font-medium flex-1 ml-4 ${
                      selectTransfer === "vendcliq"
                        ? "text-[#2F2F2F]"
                        : "text-[#9E9A9A]"
                    }`}
                  >
                    Transfer to Vendcliq Account
                  </div>
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center transition-all
                      ${
                        selectTransfer === "vendcliq"
                          ? "text-[#0A6DC0]"
                          : "bg-white"
                      }
                    `}
                  >
                    {selectTransfer === "vendcliq" ? (
                      <Image
                        src="/checkbox.svg"
                        width={20}
                        height={20}
                        alt="checked"
                      />
                    ) : (
                      <Image
                        src="/border.svg"
                        width={16}
                        height={16}
                        alt="unchecked"
                      />
                    )}
                  </div>
                </Label>

                <Label
                  onClick={() => setSelectTransfer("other")}
                  className={`
                    flex items-center justify-between py-5 px-4 rounded-2xl border-2 cursor-pointer transition-all
                    ${
                      selectTransfer === "other"
                        ? "border-[#0A6DC012] bg-[#0A6DC012]"
                        : "border-gray-200 bg-white"
                    }
                  `}
                >
                  <Landmark color="#9E9A9A" className="flex-shrink-0" />
                  <div
                    className={`text-[16px] font-dm-sans font-medium flex-1 ml-4 ${
                      selectTransfer === "other"
                        ? "text-[#2F2F2F]"
                        : "text-[#9E9A9A]"
                    }`}
                  >
                    Transfer to Other Bank Account
                  </div>
                  {selectTransfer === "other" ? (
                    <Image
                      src="/checkbox.svg"
                      width={20}
                      height={20}
                      alt="checked"
                    />
                  ) : (
                    <Image
                      src="/border.svg"
                      width={16}
                      height={16}
                      alt="unchecked"
                    />
                  )}
                </Label>
              </div>
            </div>
          </Card>

          {/* Form Panel */}
          <div className="w-full lg:w-[70%]">
            {selectTransfer === "vendcliq" ? (
              <VendCliqTransfer />
            ) : (
              <OtherTransfer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
