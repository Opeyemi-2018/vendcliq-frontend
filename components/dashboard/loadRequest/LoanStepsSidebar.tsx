import Step from "@/components/ui/Step";
import React from "react";

interface LoanStepsSidebarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const LoanStepsSidebar: React.FC<LoanStepsSidebarProps> = ({ currentStep }) => {
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
        />
        <Step
          step={2}
          currentStep={currentStep}
          label="Who are you buying from?"
        />
        <Step step={3} currentStep={currentStep} label="Loan Details" />
        <Step step={4} currentStep={currentStep} label="Loan Status" />
      </ol>
    </aside>
  );
};

export default LoanStepsSidebar;
