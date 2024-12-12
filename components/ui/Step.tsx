interface StepProps {
  step: number;
  currentStep: number;
  label: string;
}
const Step: React.FC<StepProps> = ({ step, currentStep, label }) => {
  const isActive = currentStep === step;
  return (
    <li
      className={`font-medium flex items-center gap-3 ${
        isActive ? "text-yellow-500" : ""
      }`}
    >
      <p
        className={`border rounded-full h-10 w-10 text-center flex items-center justify-center ${
          isActive
            ? "bg-soft-yellow border-yellow-line"
            : "bg-[#E7EBED] border-[#A2A2A2]"
        }`}
      >
        {step}
      </p>
      <p>{label}</p>
    </li>
  );
};
export default Step;
