

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps?: number;
}

export default function ProgressHeader({
  currentStep,
  totalSteps = 9,
}: ProgressHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-10">
      <div className="relative h-2 bg-[#E0E0E0] rounded-full overflow-hidden ">
        <div
          className="absolute left-0 top-0 h-full bg-[#0A6DC0] transition-all duration-500 ease-out flex items-center justify-end pr-2"
          style={{ width: `${progress}%` }}
        >
         
        </div>
      </div>
    </div>
  );
}
