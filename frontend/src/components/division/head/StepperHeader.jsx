import { HiCheck } from "react-icons/hi";

export default function StepperHeader({ steps, currentStep, onStepClick }) {
  const progress =
    steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
      <div className="w-full mx-auto">
        {/* Progress Bar Only (UI change) */}
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
