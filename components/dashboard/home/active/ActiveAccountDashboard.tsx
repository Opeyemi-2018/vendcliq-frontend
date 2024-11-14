import { SearchInput } from "@/components/ui/SearchInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useMemo, useState } from "react";

import { DashboardCard } from "./DashboardCard";
import { TransactionListItem } from "./TransactionListItem";
import TransactionSummary from "./TransactionSummary";
import LoanTransactionTable from "./LoanTransactionTable";
import LoanLimitCard from "./LoanLimitCard";
import FilterSortDropdown from "@/components/ui/FilterSortDropdown";

import CopyToClipboard from "@/components/ui/CopyToClipboard";

export const ActiveAccountDashboard: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Sample transactions data
  const [transactions] = useState([
    {
      date: "7 Mar 2024 | 17:38:00",
      description: "OUTWARD TRANSFER (N) 2334647 To",
      recipientInfo: "WEMA BANK | EBUBE DRINKS LIMITED",
      transactionId: "/00003883383364YTHD647749904",
      amount: -5000000,
      isOutgoing: true,
    },
    {
      date: "8 Mar 2024 | 12:30:00",
      description: "INWARD TRANSFER (N) 5463747 From",
      recipientInfo: "GTBANK | CHUKWUDI FOODS",
      transactionId: "/00003453453345YTHD754560123",
      amount: 1500000,
      isOutgoing: false,
    },
    {
      date: "9 Mar 2024 | 15:45:00",
      description: "OUTWARD TRANSFER (N) 8765421 To",
      recipientInfo: "ZENITH BANK | AYOMIDE STORES",
      transactionId: "/00005675675674YTHD839458304",
      amount: -250000,
      isOutgoing: true,
    },
    {
      date: "10 Mar 2024 | 09:15:00",
      description: "INWARD TRANSFER (N) 3647534 From",
      recipientInfo: "ACCESS BANK | JIDE ENTERPRISE",
      transactionId: "/00008374747484YTHD846464848",
      amount: 300000,
      isOutgoing: false,
    },
    {
      date: "11 Mar 2024 | 10:20:00",
      description: "OUTWARD TRANSFER (N) 2334667 To",
      recipientInfo: "UBA | OLA MARKET",
      transactionId: "/00003883383364YTHD647749905",
      amount: -1000000,
      isOutgoing: true,
    },
  ]);

  // Memoized filtered and sorted data
  const filteredAndSortedTransactions = useMemo(() => {
    let data = [...transactions];

    // Apply filter
    if (filter) {
      data = data.filter((transaction) => {
        if (filter === "incoming") return !transaction.isOutgoing;
        if (filter === "outgoing") return transaction.isOutgoing;
        return true;
      });
    }

    // Apply sorting by amount
    if (sortOrder) {
      data.sort((a, b) => {
        if (sortOrder === "asc") return a.amount - b.amount;
        if (sortOrder === "desc") return b.amount - a.amount;
        return 0;
      });
    }

    return data;
  }, [transactions, filter, sortOrder]);

  // Handle Filter and Sort selection
  const handleFilterChange = (newFilter: string) => setFilter(newFilter);
  const handleSortChange = (newSortOrder: "asc" | "desc") =>
    setSortOrder(newSortOrder);
  const text = "904567892"; // Account number
  const bankName = "Providus Bank"; // Bank name
  const accountHolder = "Chukwudi & Sons"; // Account holder
  return (
    <div className="h-screen">
      <div className="py-5 px-5 lg:px-10  h-full">
        <h1 className="text-black font-medium text-xl">Hi Godwin</h1>
        <div className="flex md:flex-row flex-row  text-xs md:text-md mt-3 bg-white items-center text-md text-black w-full md:w-fit gap-2 md:gap-5 py-1 md:px-5 p-2 font-sans border border-border rounded-lg">
          <p className="text-nowrap">{text}</p>
          <p className="border-x border-border text-nowrap px-3">{bankName}</p>
          <p className="text-nowrap">
            {" "}
            {accountHolder?.length > 10
              ? `${accountHolder.slice(0, 5)}...`
              : accountHolder}
          </p>
          <CopyToClipboard
            text={text}
            bankName={bankName}
            accountHolder={accountHolder}
          />
        </div>
        <div className="flex flex-col md:flex-row my-5 gap-10 h-full lg:h-[390px]">
          <div className="flex-1 flex flex-col h-full gap-5">
            <DashboardCard
              title="Active loan"
              amount="NGN4,000,000"
              nextPaymentDate="20-05-2023"
            />
            <DashboardCard
              title="Wallet balance"
              amount="NGN20,000,000.00"
              showButtons
              onSendMoney={() => alert("Send Money Clicked")}
              onFundWallet={() => alert("Fund Wallet Clicked")}
            />
          </div>

          <LoanLimitCard />
        </div>

        <div className="bg-white w-full font-sans mt-12">
          <Tabs defaultValue="account" className="w-full p-5">
            <TabsList className="bg-white h-fit border-b border-border w-full pb-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="flex gap-5 md:flex-row flex-col">
                <TabsTrigger value="account">Payment Transactions</TabsTrigger>
                <TabsTrigger value="password">Loan Transactions</TabsTrigger>
              </div>
              <div className="flex gap-5 flex-col md:flex-row">
                <SearchInput className="w-full md:w-64 lg:w-80 rounded-sm" />
                <FilterSortDropdown
                  onFilterChange={handleFilterChange}
                  onSortChange={handleSortChange}
                />
              </div>
            </TabsList>

            <TabsContent value="account">
              <div className="flex flex-col md:flex-row gap-5 md:px-3">
                {/* Transaction List */}
                <div className="flex-1 w-full md:w-[60%]">
                  {filteredAndSortedTransactions.map((transaction, index) => (
                    <TransactionListItem
                      key={index}
                      date={transaction.date}
                      description={transaction.description}
                      recipientInfo={transaction.recipientInfo}
                      transactionId={transaction.transactionId}
                      amount={`${transaction.isOutgoing ? "-" : "+"} ${Math.abs(
                        transaction.amount
                      ).toLocaleString()} NGN`}
                      isOutgoing={transaction.isOutgoing}
                    />
                  ))}
                </div>
                {/* Transaction Summary */}
                <div className="w-full md:w-[40%]">
                  <TransactionSummary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <LoanTransactionTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ActiveAccountDashboard;
