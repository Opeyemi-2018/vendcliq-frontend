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
    <Card className="w-[400px] py-5 space-y-5 text-black bg-white border border-gray-400">
      <CardHeader className="space-y-6">
        {icon && <div className=" text-primary">{icon}</div>}
      </CardHeader>
      <CardContent className="">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-80 font-sans">
            {description}
          </p>
        </div>
        <Button
          className={`${primaryColor} flex mt-5 w-fit h-8 font-sans rounded-md items-center px-5 text-sm text-black hover:${primaryColor} hover:brightness-90`}
          action={() => onRequestLoan}
        >
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
