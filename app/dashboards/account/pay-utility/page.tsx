"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import AirtimeFlow from "./chunks/AirtimeFlow";
import DataFlow from "./chunks/DataFlow";
import { Separator } from "@/components/ui/separator";
import { Check, CircleCheck } from "lucide-react";
import Image from "next/image";
const PayUtility = () => {
  const [selectedUtility, setSelectedUtility] = useState<"airtime" | "data">(
    "airtime"
  );
  return (
    <div className="min-h-screen ">
      <div>
        <h1 className="text-[#2F2F2F] font-semibold font-clash text-[20px] md:text-[25px]">
          Buy Utilities
        </h1>
        <p className="text-[#9E9A9A] font-dm-sans text-[16px] font-medium">
          Buy airtime or data with your vendcliq account
        </p>
      </div>

      <div className="h-[calc(100vh-120px)] mt-5 ">
        <div className="flex justify-between gap-4 ">
          {/* LEFT PANEL - Utility Selector */}
          <Card className="py-6 px-4 md:w-[35%]  bg-white">
            <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold mb-2">
              Utility Type
            </h2>
            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />
            <div className="space-y-6 mt-6">
              {/* AIRTIME */}
              <Label
                onClick={() => setSelectedUtility("airtime")}
                className={`
                      flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all relative
                      ${
                        selectedUtility === "airtime"
                          ? "border-[#0A6DC012] bg-[#0A6DC012]"
                          : "border-gray-200 bg-white"
                      }
                    `}
              >
                <div className="flex-1">
                  <h3
                    className={`text-[16px] font-dm-sans  font-medium ${
                      selectedUtility === "airtime"
                        ? "text-[#2F2F2F]"
                        : "text-[#9E9A9A]"
                    } `}
                  >
                    Airtime
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`
                          w-6 h-6 rounded-full  flex items-center justify-center transition-all
                          ${
                            selectedUtility === "airtime"
                              ? "current-fill text-[#0A6DC0]"
                              : " bg-white"
                          }
                        `}
                  >
                    {selectedUtility === "airtime" ? (
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
                </div>
              </Label>

              {/* DATA */}
              <Label
                onClick={() => setSelectedUtility("data")}
                className={`
                      flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all relative
                      ${
                        selectedUtility === "data"
                          ? "border-[#0A6DC012] bg-[#0A6DC012]"
                          : "border-gray-200 bg-white"
                      }
                    `}
              >
                <div className="flex-1">
                  <h3
                    className={`text-[16px] font-dm-sans  font-medium ${
                      selectedUtility === "data"
                        ? "text-[#2F2F2F]"
                        : "text-[#9E9A9A]"
                    } `}
                  >
                    Data
                  </h3>
                </div>
                {selectedUtility === "data" ? (
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
            {selectedUtility === "airtime" ? <AirtimeFlow /> : <DataFlow />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayUtility;
