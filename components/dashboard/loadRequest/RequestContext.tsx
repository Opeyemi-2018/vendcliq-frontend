import { createContext, useState } from "react";

interface VendorDetail {
  bankCode: string;
  accountName: string;
  narration: string;
  invoiceNo: string;
  accountNumber: string;
}

interface ItemDetails {
  amount: number;
  item: string;
  quantity: number;
}

interface RequestContextType {
  tenure: string;
  setTenure: (tenure: string) => void;
  items: ItemDetails[];
  setItems: (items: ItemDetails[]) => void;
  vendorDetails: VendorDetail;
  repaymentPattern: string;
  setRepaymentPattern: (repaymentPattern: string) => void;
  setVendorDetails: (vendorDetails: VendorDetail) => void;
}

export const RequestContext = createContext<RequestContextType>({
  items: [],
  setItems: () => {},
  vendorDetails: {
    bankCode: "",
    accountName: "",
    narration: "",
    invoiceNo: "",
    accountNumber: "",
  }, // Initializing with default empty values to avoid issues
  setVendorDetails: () => {},
  tenure: "",
  setTenure: () => {},
  repaymentPattern: "",
  setRepaymentPattern: () => {},
});

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ItemDetails[]>([]);
  const [vendorDetails, setVendorDetails] = useState<VendorDetail>({
    bankCode: "",
    accountName: "",
    narration: "",
    invoiceNo: "",
    accountNumber: "",
  }); // Initializing with an empty structure
  const [tenure, setTenure] = useState<string>("");
  const [repaymentPattern, setRepaymentPattern] = useState<string>("");

  return (
    <RequestContext.Provider
      value={{
        items,
        setItems,
        vendorDetails,
        setVendorDetails,
        tenure,
        setTenure,
        repaymentPattern,
        setRepaymentPattern,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
