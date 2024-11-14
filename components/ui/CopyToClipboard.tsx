import { Copy } from "iconsax-react";

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
        alert("Copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
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
