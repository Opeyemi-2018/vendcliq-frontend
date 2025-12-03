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
    <div className="min-h-screen ">
      <div>
        <h1 className="text-[#2F2F2F] font-semibold font-clash text-[20px] md:text-[25px]">
          Send Money
        </h1>
        <p className="text-[#9E9A9A] font-dm-sans text-[16px] font-medium">
          send money to other accounts
        </p>
      </div>

      <div className="h-[calc(100vh-120px)] mt-5 ">
        <div className="flex justify-between gap-4 ">
          {/* LEFT PANEL - Utility Selector */}
          <Card className="py-6 px-4 md:w-[35%]  bg-white">
            <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold mb-2">
              Transfer Destination
            </h2>
            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />
            <div className="space-y-6 mt-6">
              {/* vendcliq */}
              <Label
                onClick={() => setSelectTransfer("vendcliq")}
                className={`
                      flex items-center justify-between py-5 px-4 rounded-2xl border-2 cursor-pointer transition-all relative
                      ${
                        selectTransfer === "vendcliq"
                          ? "border-[#0A6DC012] bg-[#0A6DC012]"
                          : "border-gray-200 bg-white"
                      }
                    `}
              >
                <Image src="/v-b.svg" width={20} height={20} alt="logo" />

                <h3
                  className={`text-[16px] font-dm-sans  font-medium ${
                    selectTransfer === "vendcliq"
                      ? "text-[#2F2F2F]"
                      : "text-[#9E9A9A]"
                  } `}
                >
                  Transfer to Vendcliq Account
                </h3>

                <div
                  className={`
                          w-6 h-6 rounded-full  flex items-center justify-center transition-all
                          ${
                            selectTransfer === "vendcliq"
                              ? "current-fill text-[#0A6DC0]"
                              : " bg-white"
                          }
                        `}
                >
                  {selectTransfer === "vendcliq" ? (
                    // <CircleCheck
                    //   className="w-4 h-4 text-[#0A6DC0] "
                    //   strokeWidth={3}
                    // />
                    <Image
                      src={"/checkbox.svg"}
                      alt="checkbox"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <Image
                      src={"/border.svg"}
                      alt="checkbox"
                      width={16}
                      height={16}
                    />
                  )}
                </div>
              </Label>

              {/* other transfer */}
              <Label
                onClick={() => setSelectTransfer("other")}
                className={`
                      flex items-center justify-between py-5 px-4 rounded-2xl border-2 cursor-pointer transition-all relative
                      ${
                        selectTransfer === "other"
                          ? "border-[#0A6DC012] bg-[#0A6DC012]"
                          : "border-gray-200 bg-white"
                      }
                    `}
              >
                <Landmark color="#9E9A9A" />

                <h3
                  className={`text-[16px] font-dm-sans  font-medium ${
                    selectTransfer === "other"
                      ? "text-[#2F2F2F]"
                      : "text-[#9E9A9A]"
                  } `}
                >
                  Transfer to Other Bank Account
                </h3>

                {selectTransfer === "other" ? (
                  <Image
                    src={"/checkbox.svg"}
                    alt="checkbox"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src={"/border.svg"}
                    alt="checkbox"
                    width={16}
                    height={16}
                  />
                )}
              </Label>
            </div>
          </Card>

          {/* RIGHT PANEL - Dynamic Flow */}
          <div className="md:w-[70%] ">
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
