"use client";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IRequestCardProps } from "@/types";

export default function RequestCard({
  title = "Request Loan",
  description = "Buy more with our service, request a loan for your business",
  buttonText = "Request loan",
  icon,
  primaryColor = "bg-yellow-400",
  onRequestLoan = () => {},
}: IRequestCardProps) {
  return (
    <Card className="w-full sm:w-[350px] md:w-[350px] px-5 py-3 sm:py-5 space-y-3 rounded-sm  sm:space-y-5 text-black bg-white border border-gray-400">
      <CardHeader className="space-y-4 sm:space-y-6">
        {icon && <div className="text-primary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-[20px] sm:text-2xl font-[600]  tracking-tight">
            {title}
          </h2>
          <p className="text-[16px] sm:text-lg text-[#3F3F3F] max-w-[280px] sm:max-w-80 font-sans">
            {description}
          </p>
        </div>
        <Button
          className={`${primaryColor} flex py-5 mt-3 sm:mt-5 w-fit h-fit sm:h-8 font-sans rounded-md items-center px-4 sm:px-5 text-[12px] sm:text-[14px] text-black hover:${primaryColor} hover:brightness-90`}
          onClick={onRequestLoan}
        >
          {buttonText}
          <ArrowRight className="ml-0 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
