"use client"; // Marks this page as a client component

import { useRouter } from "next/navigation";
import TransferConfirmation from "@/components/dashboard/transfer/TransferConfirmation";
import {
  handleLocalTransfer,
  handleOutsideTransfer,
} from "@/lib/utils/api/apiHelper";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

interface TransferData {
  type: "vendcilq" | "other";
  fromAccount: string;
  beneficiaryAccount: string;
  beneficiaryName: string;
  amount: string;
  narration: string;
  saveToBeneficiaryList: boolean;
  selectedBank?: string;
}

const ConfirmationPage = () => {
  const router = useRouter();
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [veraTransferData, setVeraTransferData] = useState<TransferData | null>(
    null
  );
  useEffect(() => {
    // Get transfer data from localStorage instead of URL params
    const storedData = localStorage.getItem("transferData");
    const veraTransferData = localStorage.getItem("veraTransferData");
    console.log("veraTransferData", veraTransferData);
    if (storedData) {
      setTransferData(JSON.parse(storedData));
      // Clear the data from localStorage after retrieving it
      localStorage.removeItem("transferData");
    } else if (veraTransferData) {
      setVeraTransferData(JSON.parse(veraTransferData));
      localStorage.removeItem("veraTransferData");
    }
  }, []);

  const handlePinSubmit = async (pin: string) => {
    console.log("transferData", transferData);
    console.log("veraTransferData", veraTransferData);
    try {
      if (
        transferData?.type === "vendcilq" ||
        veraTransferData?.type === "vendcilq"
      ) {
        console.log("vendcilq>>");
        const response = await handleLocalTransfer({
          senderAccountId: Number(
            transferData?.fromAccount || veraTransferData?.fromAccount
          ),
          receiverAccountNo:
            transferData?.beneficiaryAccount ||
            veraTransferData?.beneficiaryAccount ||
            "",
          amount: Number(transferData?.amount || veraTransferData?.amount),
          narration:
            transferData?.narration || veraTransferData?.narration || "",
          saveAsBeneficiary:
            transferData?.saveToBeneficiaryList ||
            veraTransferData?.saveToBeneficiaryList ||
            false,
          pin,
        });
        if (response.status === "failed") {
          toast.error(response.msg);
        } else {
          toast.success("Transfer successful");
          router.push("/dashboard/home");
        }
        console.log("response", response);
      } else if (
        transferData?.type === "other" ||
        veraTransferData?.type === "other"
      ) {
        console.log("other>>");
        const response = await handleOutsideTransfer({
          senderAccountId: Number(
            transferData?.fromAccount || veraTransferData?.fromAccount
          ),
          receiverAccountNo:
            transferData?.beneficiaryAccount ||
            veraTransferData?.beneficiaryAccount ||
            "",
          receiverAccountName:
            transferData?.beneficiaryName ||
            veraTransferData?.beneficiaryName ||
            "",
          amount: Number(transferData?.amount || veraTransferData?.amount),
          narration:
            transferData?.narration || veraTransferData?.narration || "",
          saveAsBeneficiary:
            transferData?.saveToBeneficiaryList ||
            veraTransferData?.saveToBeneficiaryList ||
            false,
          receiverBankCode:
            transferData?.selectedBank || veraTransferData?.selectedBank || "",
          pin,
        });
        console.log("response", response);
        if (response.status === "failed") {
          toast.error(response.msg);
        } else {
          toast.success("Transfer successful");
          router.push("/dashboard/home");
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { msg?: string } } };
      console.log("error", err.response?.data?.msg);
      toast.error(err.response?.data?.msg || "Transfer failed");
    }
  };

  const displayData = transferData || veraTransferData;
  console.log("displayData", displayData);
  return (
    <div className="min-h-screen px-5 flex justify-center">
      {displayData?.type === "vendcilq" && (
        <TransferConfirmation
          type={"vendcilq"}
          accountName={displayData?.beneficiaryName}
          amount={displayData?.amount}
          receiverName={displayData?.beneficiaryName || ""}
          receiverAccount={displayData?.beneficiaryAccount || ""}
          receiverBank={displayData?.selectedBank || ""}
          date={new Date().toLocaleDateString()}
          charges={"0"}
          onPinSubmit={handlePinSubmit}
        />
      )}
      {displayData?.type === "other" && (
        <TransferConfirmation
          type={"other"}
          amount={veraTransferData?.amount || transferData?.amount}
          receiverName={
            veraTransferData?.beneficiaryName || transferData?.beneficiaryName
          }
          receiverAccount={
            veraTransferData?.beneficiaryAccount ||
            transferData?.beneficiaryAccount
          }
          date={new Date().toLocaleDateString()}
          charges={"0"}
          onPinSubmit={handlePinSubmit}
        />
      )}
    </div>
  );
};

export default ConfirmationPage;
