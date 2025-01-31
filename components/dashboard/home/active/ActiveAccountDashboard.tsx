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
import {
  handleGetLoan,
  handleGetTransactionHistory,
} from "@/lib/utils/api/apiHelper";
import { useQuery } from "@tanstack/react-query";
import FormatCurrency from "@/components/ui/FormatCurrency";

export const ActiveAccountDashboard: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data } = useDashboardData();

  const { profile } = useGetProfile();

  const { data: loanData } = useQuery({
    queryKey: ["loans"],
    queryFn: handleGetLoan,
  });

  const [currentPage] = useState(1);

  const {
    data: allTransactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactionHistory", currentPage],
    queryFn: () => handleGetTransactionHistory(currentPage),
  });

  const loanTransactions = loanData?.data?.data || [];
  console.log(loanTransactions);
  const account = data?.data.account;
  const customer = data?.data.customer;
  const nextPaymentDate = data?.data.nextRepayment;

  // Get active loan amount

  const transformedLoanTransactions = loanTransactions.map((loan) => ({
    ...loan,
    id: loan.id.toString(),
    maturityAmount: 0,
    dueDate: "",
    status: "completed",
  }));

  // Transform transactions data
  const transformedTransactions = allTransactions?.data.data.map(
    (transaction, index) => ({
      ...transaction,
      id: index.toString(),
      maturityAmount: 0,
      dueDate: "",
      status: "completed",
    })
  );

  const filteredLoanTransactions = useMemo(() => {
    let data = transformedLoanTransactions || [];
    // if (filter) {
    //   data = data.filter((loan) => loan.status.toLowerCase() === filter);
    // }
    if (searchQuery) {
      data = data.filter((loan) =>
        loan.reference.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortOrder) {
      data.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        if (sortOrder === "asc") return dateA - dateB;
        if (sortOrder === "desc") return dateB - dateA;
        return 0;
      });
    }
    return data;
  }, [transformedLoanTransactions, searchQuery, sortOrder]);
  // Memoized filtered, sorted, and searched data
  const filteredAndSortedTransactions = useMemo(() => {
    let data = transformedTransactions || [];

    if (filter) {
      data = data.filter((transaction) => {
        if (filter === "Incoming") return transaction.type === "CREDIT";
        if (filter === "Outgoing") return transaction.type === "DEBIT";
        return true;
      });
    }

    if (sortOrder) {
      data.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (sortOrder === "asc") return dateA - dateB;
        if (sortOrder === "desc") return dateB - dateA;
        return 0;
      });
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      data = data.filter(
        (transaction) =>
          transaction.reference.toLowerCase().includes(lowerCaseQuery) ||
          transaction.narration.toLowerCase().includes(lowerCaseQuery) ||
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

  const text = account?.number || "No account number";
  const bankName = account?.bank || "No bank";
  const accountHolder =
    account?.name || `${customer?.firstname || ""} ${customer?.lastname || ""}`;

  return (
    <div className="h-screen">
      <div className="py-5 px-5 lg:px-10 h-full">
        <h1 className="text-black font-medium text-xl">
          Hi {customer?.firstname || "there"}
        </h1>
        <div className="flex md:flex-row flex-col text-xs md:text-md mt-3 bg-white items-center text-md text-black w-full md:w-fit gap-2 md:gap-5 py-1 md:px-5 p-2 font-sans border border-border rounded-lg">
          <p className="text-nowrap">{text}</p>
          <p className="border-x border-border text-nowrap px-3">{bankName}</p>
          <p className="text-nowrap">
            {accountHolder?.length > 10
              ? `${accountHolder.slice(0, 10)}...`
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
              amount={`NGN${data?.data.creditCheck.totalUsed}`}
              nextPaymentDate={nextPaymentDate || ""}
            />
            <DashboardCard
              title="Wallet balance"
              amount={`NGN${FormatCurrency({
                amount: account?.balance || 0,
                useAbbreviation: false,
              })}`}
              showButtons
            />
          </div>
          <div className="hidden md:flex z-0">
            <LoanLimitCard
              limit={data?.data.creditCheck.remainingCredit || 0}
            />
          </div>
        </div>
        <div className="flex md:hidden mb-5 z-0">
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
                <div className="flex-1 w-full md:w-[60%]">
                  {isLoading ? (
                    <div>Loading transactions...</div>
                  ) : error ? (
                    <div>Error loading transactions</div>
                  ) : filteredAndSortedTransactions?.length === 0 ? (
                    <div>No transactions found</div>
                  ) : (
                    filteredAndSortedTransactions.map((transaction, index) => (
                      <TransactionListItem
                        key={index}
                        date={transaction.date}
                        description={transaction.narration}
                        recipientInfo={transaction.reference}
                        transactionId={transaction.transactionId}
                        amount={`${transaction.type === "DEBIT" ? "-" : "+"} ${
                          transaction.amount
                        }`}
                        isOutgoing={transaction.type === "DEBIT"}
                        isCredit={transaction.type === "CREDIT"}
                      />
                    ))
                  )}
                </div>
                <div className="w-full md:w-[40%]">
                  <TransactionSummary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="md:w-full md:h-full w-full">
                <LoanTransactionTable
                  transactions={filteredLoanTransactions}
                  searchQuery={searchQuery}
                  // filter={filter}
                  sortOrder={sortOrder}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
