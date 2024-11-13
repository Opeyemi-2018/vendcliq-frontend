import { PageTitle } from "@/components/ui/pageTitle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import React from "react";

const page = () => {
  const accountDetails = [
    {
      id: 1,
      bank: "Providus",
      accountNumber: "012348764",
      accuountName: "Chukwudi and Sons Limited Liability Company",
      totalTransactionCount: "Fifty (50)",
      accountBalance: "5,000,000.00",
    },
    {
      id: 2,
      bank: "Wema",
      accountNumber: "012348764",
      accuountName: "Chukwudi and Sons Limited Liability Company",
      totalTransactionCount: "Fifty (50)",
      accountBalance: "5,000,000.00",
    },
  ];

  return (
    <div className="h-screen">
      <div className="py-5 px-5 md:px-10 space-y-5 h-full">
        <PageTitle className="border-b border-border" title="Account" />

        <div className="border font-sans bg-white ">
          <Table className="">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Bank</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Total Transaction Count</TableHead>
                <TableHead>Account Balance (NGN)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountDetails.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.bank}</TableCell>
                  <TableCell>{item.accountNumber}</TableCell>
                  <TableCell>
                    <p className="md:max-w-52">{item.accuountName}</p>
                  </TableCell>
                  <TableCell>{item.totalTransactionCount}</TableCell>
                  <TableCell>{item.accountBalance}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/account/${item.id}`}
                      className="w-fit h-fit"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-row items-center justify-end gap-20 md:pr-10 font-sans border-b pt-3 pb-10 border-border">
          <p>Total</p>
          <p className="text-2xl font-semibold">10,000,000.00</p>
        </div>
      </div>
    </div>
  );
};

export default page;
