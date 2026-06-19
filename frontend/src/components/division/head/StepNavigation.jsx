import { Button } from "flowbite-react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export default function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isProcessing,
  canNext = true,
}) {
  /* =====================================================
     STEP 01 — FULL WIDTH PRIMARY NEXT BUTTON
     ===================================================== */
  if (currentStep === 1) {
    return (
      <div className="flex justify-end py-4 px-4">
        <Button
          onClick={onNext}
          disabled={!canNext || isProcessing}
          isProcessing={isProcessing}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Next
          <HiChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  /* =====================================================
     STEP 02+ — RIGHT ALIGNED, VERTICALLY CENTERED
     ===================================================== */
  return (
    <div className="w-full py-4 px-4">
      <div className="mx-auto w-full">
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-4 rounded-2xl px-4">
            {/* Previous */}
            <Button
              onClick={onBack}
              className="rounded-full bg-gray-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              <HiChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {/* Next / Finish */}
            <Button
              onClick={onNext}
              disabled={!canNext || isProcessing}
              isProcessing={isProcessing}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {currentStep === totalSteps - 1 ? "Finish" : "Next"}
              <HiChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
