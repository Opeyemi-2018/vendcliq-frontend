import { Copy } from "iconsax-react";
import { toast } from "react-toastify";

interface CopyToClipboardProps {
  text: string;
  bankName?: string;
  accountHolder?: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  bankName,
  accountHolder,
}) => {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(`${text} ${bankName || ""} ${accountHolder || ""}`)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy text: ", error);
      });
  };

  return (
    <div>
      <button onClick={handleCopy}>
        <Copy size="16" color="#F8BD00" />
      </button>
    </div>
  );
};

export default CopyToClipboard;
