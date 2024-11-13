import React from "react";

interface LoanStepsSidebarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

interface StepProps {
  step: number;
  currentStep: number;
  label: string;
  onStepClick: (step: number) => void;
}

const Step: React.FC<StepProps> = ({
  step,
  currentStep,
  label,
  onStepClick,
}) => {
  const isActive = currentStep === step;
  return (
    <li
      className={`font-bold flex items-center gap-3 ${
        isActive ? "text-yellow-500" : ""
      }`}
      onClick={() => onStepClick(step)}
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

const LoanStepsSidebar: React.FC<LoanStepsSidebarProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <aside className="w-full top-0 left-0 h-fit bg-white p-6">
      <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
        Loan Steps
      </h3>

      <ol className="space-y-4 text-gray-600">
        <Step
          step={1}
          currentStep={currentStep}
          label="What do you want to buy?"
          onStepClick={onStepClick}
        />
        <Step
          step={2}
          currentStep={currentStep}
          label="Who are you buying from?"
          onStepClick={onStepClick}
        />
        <Step
          step={3}
          currentStep={currentStep}
          label="Loan Details"
          onStepClick={onStepClick}
        />
        <Step
          step={4}
          currentStep={currentStep}
          label="Loan Status"
          onStepClick={onStepClick}
        />
      </ol>
    </aside>
  );
};

export default LoanStepsSidebar;
