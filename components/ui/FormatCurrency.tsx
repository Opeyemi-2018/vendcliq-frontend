const FormatCurrency = ({
  amount,
  useAbbreviation = true,
}: {
  amount: number;
  useAbbreviation?: boolean;
}) => {
  if (useAbbreviation && amount >= 1000000) {
    return (
      (amount / 1000000).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "M"
    );
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default FormatCurrency;
