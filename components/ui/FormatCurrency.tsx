const FormatCurrency = ({ amount }: { amount: number }) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
export default FormatCurrency;
