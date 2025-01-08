const FormatCurrency = ({ amount }: { amount: number }) => {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(millions)}M`;
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
export default FormatCurrency;
