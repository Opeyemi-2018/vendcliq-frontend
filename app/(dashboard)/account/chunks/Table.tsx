/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpNarrowWide,
  Calculator,
  Calendar,
  ChevronDown,
  MoveRight,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { handleGetTransactions } from "@/lib/utils/api/apiHelper";
import type { Transaction } from "@/types/transactions";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

const Loans = [
  {
    id: "#005676",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
  {
    id: "#003746",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
  {
    id: "#008394",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
  {
    id: "#003748",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
];

const TransactionSkeleton = () => (
  <div className="border-b border-gray-200 pb-2 animate-pulse">
    <div className="flex items-center gap-2 mb-2">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <Separator orientation="vertical" className="h-4" />
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
      <div className="hidden sm:block w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="sm:w-[50%] space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const Table = () => {
  const tabs = ["Payment Transaction", "Loan Transactions"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // ← updated type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const { newTransactions, clearNewTransactions, isLiveConnected } =
    useWallet();

  // Merge real-time transactions from WebSocket
  useEffect(() => {
    if (newTransactions.length > 0) {
      setTransactions((prev) => {
        const existingIds = new Set(prev.map((tx) => tx.id));
        const uniqueNew = newTransactions.filter(
          (tx: any) => !existingIds.has(tx.id) && tx.amount !== undefined,
        );
        return uniqueNew.length > 0 ? [...uniqueNew, ...prev] : prev;
      });
      clearNewTransactions();
    }
  }, [newTransactions, clearNewTransactions]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await handleGetTransactions(currentPage);
        setTransactions(response.data.items); // ← was response.data.data
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setTransactions([]);
        } else {
          setError("Failed to load transactions. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "Payment Transaction") {
      fetchTransactions();
    }
  }, [activeTab, currentPage]);

  // Transaction stats for last 7 days
  const transactionStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent = transactions.filter((tx) => {
      const d = new Date(tx.createdAt);
      return d >= sevenDaysAgo && d <= now;
    });

    let totalTransactionValue = 0;
    let collectionsValue = 0;
    let transferValue = 0;

    recent.forEach((tx) => {
      const amount = tx.amount ?? 0;
      totalTransactionValue += amount;

      if (tx.direction === "CREDIT") collectionsValue += amount; // ← was transactionType === "CREDIT"
      if (tx.direction === "DEBIT") transferValue += amount; // ← was transactionType === "TRANSFER"
    });

    return { totalTransactionValue, collectionsValue, transferValue };
  }, [transactions]);

  const formatCurrency = (amount: number | undefined) =>
    `NGN ${(amount ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <div>
      <div className="flex justify-between flex-col items-start gap-2 lg:gap-0 lg:flex-row">
        <div className="flex gap-4 lg:gap-10">
          <button
            onClick={() => setActiveTab(tabs[0])}
            className={`text-[13px] lg:text-[16px] font-dm-sans ${
              activeTab === "Payment Transaction"
                ? "text-[#0A6DC0] font-bold border-b-2 border-[#0A6DC0]"
                : "text-[#2F2F2F] font-medium"
            }`}
          >
            Payment Transactions
          </button>
        </div>

        {activeTab === "Loan Transactions" && (
          <>
            <Input
              placeholder="Type to search"
              className="lg:w-[329px] bg-transparent border-2 border-[#E7EBED]"
            />
            <div className="hidden lg:flex gap-4 border-2 border-[#E7EBED] p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} /> filter <ChevronDown />
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <ArrowUpNarrowWide size={20} /> sort <ChevronDown />
              </div>
            </div>
          </>
        )}
      </div>

      {activeTab === "Payment Transaction" && (
        <div className="flex flex-col lg:flex-row mt-6 lg:gap-10 gap-4 justify-between">
          <div className="lg:w-[50%] space-y-4">
            {loading && (
              <>
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
              </>
            )}

            {error && (
              <div className="text-center py-8 text-red-500">{error}</div>
            )}

            {!loading && !error && transactions.length === 0 && (
              <div className="text-center py-8 text-[#2F2F2F] flex items-center justify-center flex-col mt-20">
                <Image src="/ts.svg" alt="ts" height={50} width={50} />
                <p className="font-bold font-dm-sans text-[16px]">
                  No transactions found
                </p>
                <p>Your recent transactions will appear here</p>
              </div>
            )}

            {!loading &&
              !error &&
              transactions.slice(0, 4).map((tx) => {
                const date = new Date(tx.createdAt);
                const formattedDate = date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });

                const isCredit = tx.direction === "CREDIT"; // ← was transactionType === "CREDIT"

                // For credits show sender; for debits show receiver
                const counterpartyName = isCredit
                  ? tx.sender?.name || "Unknown" // ← was senderAccount?.Name
                  : tx.receiver?.name || "Unknown"; // ← was beneficiaryAccount?.name

                const counterpartyBank = isCredit
                  ? tx.sender?.bankName || "" // ← was senderAccount?.Bank
                  : tx.receiver?.bankName || ""; // ← was beneficiaryAccount?.provider

                const amount = tx.amount ?? 0;
                const formattedAmount = isCredit
                  ? `+${amount.toLocaleString("en-NG")} NGN`
                  : `-${amount.toLocaleString("en-NG")} NGN`;
                return (
                  <div key={tx.id} className="border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-2 text-[14px] text-[#6F6F6F]">
                      <p className="whitespace-nowrap">{formattedDate}</p>
                      <Separator orientation="vertical" className="h-4" />
                      <p>{formattedTime}</p>
                    </div>
                    <div className="flex sm:items-center justify-between flex-col sm:flex-row">
                      <Image
                        src={isCredit ? "/in.svg" : "/out.svg"}
                        width={30}
                        height={30}
                        alt="wallet"
                        className="hidden sm:inline w-10 h-10"
                      />
                      <div className="sm:w-[50%]">
                        <h1 className="font-medium uppercase lg:font-bold text-[14px] font-dm-sans">
                          {counterpartyBank} {counterpartyName}
                        </h1>
                        <p className="text-[13px] text-[#797979]">
                          Ref: {tx.transactionReference}
                        </p>
                      </div>
                      <h1
                        className={`whitespace-nowrap text-[12px] lg:text-[16px] font-dm-sans font-medium ${
                          isCredit ? "text-[#00C53A]" : "text-[#FF6242]"
                        }`}
                      >
                        {formattedAmount}
                      </h1>
                    </div>
                  </div>
                );
              })}

            {transactions.length > 0 && (
              <button
                onClick={() => router.push("/account/transactionHistory")}
                className="text-[#39498C] font-medium font-dm-sans text-[14px] md:pt-4"
              >
                Show all
              </button>
            )}
          </div>

          <div className="xl:w-[45%] md:border border-[#E4E4E4] md:px-4 lg:px-7 py-5 bg-white rounded-2xl">
            <div className="flex items-center gap-2">
              <Calendar /> Last 7 days. <ChevronDown />
            </div>
            <Separator orientation="horizontal" className="mt-3" />
            <div className="space-y-4">
              {[
                {
                  label: "Total Transaction Value",
                  value: transactionStats.totalTransactionValue,
                },
                {
                  label: "Collections Value",
                  value: transactionStats.collectionsValue,
                },
                {
                  label: "Transfer Value",
                  value: transactionStats.transferValue,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="mt-4 border border-[#E4E4E4] px-4 lg:px-7 py-5 bg-white rounded-2xl"
                >
                  <div className="flex items-center gap-1">
                    <Calculator className="text-[#39498C]" />
                    <p className="font-medium text-[#39498C] text-[14px] font-dm-sans">
                      {label}
                    </p>
                  </div>
                  <p className="text-[14px] lg:text-[16px] font-clash text-[#292826] lg:font-semibold">
                    {formatCurrency(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Loan Transactions" && (
        <div className="overflow-x-auto mt-6 border-[#E4E4E4] border-2 bg-white rounded-2xl">
          <table className="w-full my-6">
            <thead>
              <tr>
                {[
                  "ID",
                  "Amount",
                  "Maturity Amount",
                  "Date",
                  "Due Date",
                  "Status",
                  "More",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {Loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-[#E4E4E4] border-b hover:bg-gray-200"
                >
                  <td className="text-left p-4 py-4 font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    {loan.id}
                  </td>
                  <td className="hidden md:table-cell py-4 font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    {loan.amount}
                  </td>
                  <td className="hidden md:table-cell py-4 font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    {loan.MaturityAmount}
                  </td>
                  <td className="hidden md:table-cell py-4 font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    {loan.date}
                  </td>
                  <td className="hidden md:table-cell py-4 font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    {loan.dueDate}
                  </td>
                  <td className="hidden md:table-cell">
                    <Button className="bg-[#E7F4EB] hover:bg-[#E7F4EB] md:font-bold py-0 text-[#003909] text-[12px] rounded-full">
                      <span className="bg-[#00C53A] h-2 w-2 rounded-full"></span>{" "}
                      {loan.status}
                    </Button>
                  </td>
                  <td className="py-4 font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    <MoveRight />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Table;
