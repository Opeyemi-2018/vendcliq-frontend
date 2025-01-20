"use client";
import { PageTitle } from "@/components/ui/pageTitle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { handleGetAccount } from "@/lib/utils/api/apiHelper";
import FormatCurrency from "@/components/ui/FormatCurrency";
import Link from "next/link";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";

const Page = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["account"],
    queryFn: handleGetAccount,
  });

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        Error loading accounts
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <ClipLoader color="#000" size={50} />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="py-5 px-5 md:px-10 space-y-5 h-full">
        <PageTitle className="border-b border-border" title="Account" />

        <div className="border font-sans bg-white rounded-lg">
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Bank</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Total Transaction Count</TableHead>
                  <TableHead>Account Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.accounts?.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.bankName}
                    </TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>
                      <p className="md:max-w-52">{account.accountName}</p>
                    </TableCell>
                    <TableCell>{account.transactionCount}</TableCell>
                    <TableCell>
                      <FormatCurrency amount={account.accountBalance} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/account/${account.id}`}
                        className="text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        </div>
      </div>
    </div>
  );
};

export default Page;
