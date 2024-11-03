import * as RadioGroup from "@radix-ui/react-radio-group";

interface BoxOptionProps {
  value: string;
  title: string;
  description?: string;
  iconSrc?: string;
  selectedValue: string; // Track the selected value to apply styles conditionally
}

const BoxOption: React.FC<BoxOptionProps> = ({
  value,
  title,
  description,
  iconSrc,
  selectedValue,
}) => {
  // Check if this option is selected
  const isSelected = selectedValue === value;

  return (
    <RadioGroup.Item
      value={value}
      className={`flex  items-center p-4 border  w-full cursor-pointer hover:border-dark-yellow ${
        isSelected
          ? "border-dark-yellow bg-primary"
          : "border-input-border text-text-gray bg-light-gray"
      }`}
    >
      {iconSrc && (
        <div
          className={
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-white"
          }
        >
          <img src={iconSrc} alt={`${title} icon`} className="w-6 h-6" />
        </div>
      )}
      {description ? (
        <div className="ml-4 text-left w-60 text-black font-sans">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs ">{description}</p>
        </div>
      ) : (
        <h3 className="font-semibold text-sm font-sans">{title}</h3>
      )}
      <RadioGroup.Indicator className="ml-auto">
        <div
          className={`w-5 h-5 rounded-full border ${
            isSelected
              ? "bg-inherit border-4 border-dark-yellow"
              : "bg-white border-gray-300"
          }`}
        ></div>
      </RadioGroup.Indicator>
    </RadioGroup.Item>
  );
};

export default BoxOption;
