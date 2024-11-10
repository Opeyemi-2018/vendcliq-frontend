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
    <div className="flex flex-col py-5 pl-5 bg-[#F6F6F6] border border-[#BDBDBD] rounded-lg mb-4">
      <div className="flex gap-2">
        {icon ? icon : <RiBankLine className="text-[#39498C] text-2xl" />}
        <p className="text-[#39498C] font-medium">{title}</p>
      </div>
      <p className="text-2xl font-semibold mt-2 font-clash text-black">
        {value}
      </p>
    </div>
  );
};
export default TransactionCard;
