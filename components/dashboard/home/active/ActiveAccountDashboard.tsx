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
import { useDashboardData } from "@/services/home/home";
import { useGetProfile } from "@/services/profile/Profile";

export const ActiveAccountDashboard: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data } = useDashboardData();
  const { profile } = useGetProfile();
  console.log("dashboardData", data?.data);
  console.log("profile", profile);
  // Sample transactions data
  const account = data?.data.account;
  const customer = data?.data.customer;

  const nextPaymentDate = data?.data.nextRepayment;

  const loanTransactions = [
    {
      id: "#0056757",
      amount: 5000000.0,
      maturityAmount: 6500000.0,
      date: "02/May/2024",
      dueDate: "02/June/2024",
      status: "Active",
    },
    {
      id: "#0056757",
      amount: 5000000.0,
      maturityAmount: 6500000.0,
      date: "02/May/2024",
      dueDate: "02/June/2024",
      status: "Active",
    },
    {
      id: "#0056757",
      amount: 5000000.0,
      maturityAmount: 6500000.0,
      date: "02/May/2024",
      dueDate: "02/June/2024",
      status: "Active",
    },
    {
      id: "#0056757",
      amount: 5000000.0,
      maturityAmount: 6500000.0,
      date: "02/May/2024",
      dueDate: "02/June/2024",
      status: "Active",
    },
  ];

  const [transactions] = useState([
    {
      date: "7 Mar 2024 | 17:38:00",
      description: "OUTWARD TRANSFER (N) 2334647 To",
      recipientInfo: "WEMA BANK | EBUBE DRINKS LIMITED",
      transactionId: "/00003883383364YTHD647749904",
      amount: 5000000,
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
      amount: 250000,
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
      amount: 1000000,
      isOutgoing: true,
    },
  ]);

  // Transformation to include additional required properties
  const transformedTransactions = transactions.map((transaction, index) => ({
    ...transaction,
    id: index.toString(), // Generate an id if not available
    maturityAmount: 0, // Placeholder for maturity amount
    dueDate: "", // Placeholder for due date
    status: "completed", // Placeholder status
  }));

  // Memoized filtered, sorted, and searched data
  const filteredAndSortedTransactions = useMemo(() => {
    let data = [...transformedTransactions];

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

    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      data = data.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(lowerCaseQuery) ||
          transaction.recipientInfo.toLowerCase().includes(lowerCaseQuery) ||
          transaction.transactionId.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return data;
  }, [transformedTransactions, filter, sortOrder, searchQuery]);

  const handleFilterChange = (newFilter: string) => setFilter(newFilter);
  const handleSortChange = (newSortOrder: "asc" | "desc") =>
    setSortOrder(newSortOrder);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  const text = "904567892";
  const bankName = "Providus Bank";
  const accountHolder = "Chukwudi & Sons";

  return (
    <div className="h-screen">
      <div className="py-5 px-5 lg:px-10 h-full">
        <h1 className="text-black font-medium text-xl">
          Hi {customer?.firstname}
        </h1>
        <div className="flex md:flex-row flex-row text-xs md:text-md mt-3 bg-white items-center text-md text-black w-full md:w-fit gap-2 md:gap-5 py-1 md:px-5 p-2 font-sans border border-border rounded-lg">
          <p className="text-nowrap">{text}</p>
          <p className="border-x border-border text-nowrap px-3">{bankName}</p>
          <p className="text-nowrap">
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
        <div className="flex flex-col md:flex-row my-5 md:gap-10 h-fit md:h-full lg:h-full md:max-h-96">
          <div className=" w-full flex md:justify-between flex-col h-full gap-5 ">
            <DashboardCard
              title="Active loan"
              amount={`NGN0.00`}
              nextPaymentDate={nextPaymentDate || ""}
            />
            <DashboardCard
              title="Wallet balance"
              amount={`NGN${account?.balance || "0.00"}`}
              showButtons
              onSendMoney={() => alert("Send Money Clicked")}
              onFundWallet={() => alert("Fund Wallet Clicked")}
            />
          </div>
          <div className="hidden md:flex">
            <LoanLimitCard limit={profile?.business.creditLimit || 0} />
          </div>
        </div>
        <div className="flex md:hidden mb-5">
          <LoanLimitCard limit={profile?.business.creditLimit || 0} />
        </div>
        <div className="bg-white w-full font-sans  md:mt-12">
          <Tabs defaultValue="account" className="w-full p-5">
            <TabsList className="bg-white h-fit border-b border-border w-full pb-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="flex gap-5 md:flex-row flex-col">
                <TabsTrigger value="account">Payment Transactions</TabsTrigger>
                <TabsTrigger value="password">Loan Transactions</TabsTrigger>
              </div>
              <div className="flex gap-5 flex-col md:flex-row">
                <SearchInput
                  className="w-full md:w-64 lg:w-80 rounded-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
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
                      amount={`${transaction.isOutgoing ? "-" : "+"} ${
                        transaction.amount
                      }`}
                      isOutgoing={transaction.isOutgoing}
                    />
                  ))}
                </div>
                <div className="w-full md:w-[40%]">
                  <TransactionSummary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="md:w-full md:h-full w-full">
                <LoanTransactionTable
                  transactions={loanTransactions}
                  searchQuery={searchQuery}
                  filter={filter}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
