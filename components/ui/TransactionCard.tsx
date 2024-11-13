import { RiBankLine } from "react-icons/ri";

interface TransactionCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  title,
  value,
  icon,
}) => {
  return (
    <div className="flex flex-col py-4 px-3 sm:py-5 sm:px-5 bg-[#F6F6F6] border border-[#BDBDBD] rounded-lg mb-4 w-full max-w-sm sm:max-w-md">
      <div className="flex items-center gap-2">
        {icon ? (
          icon
        ) : (
          <RiBankLine className="text-[#39498C] text-lg sm:text-xl md:text-2xl" />
        )}
        <p className="text-[#39498C] font-medium text-sm sm:text-base md:text-lg">
          {title}
        </p>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-2 font-clash text-black">
        {value}
      </p>
    </div>
  );
};

export default TransactionCard;
