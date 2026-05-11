"use client";
import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import {
  TeacherFormContext,
  TeacherFormProvider,
} from "@/context/TeacherFormContext";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import { registerTeacher } from "@/api/teacherService";
import toast from "react-hot-toast";
import { HiCheckCircle, HiArrowLeft } from "react-icons/hi";
import StepNICVerification from "../../components/dos/steps/StepNICVerification";
import StepPersonalDetails from "../../components/dos/steps/StepPersonalDetails";
import StepContactDetails from "../../components/dos/steps/StepContactDetails";
import StepFirstAppointment from "../../components/dos/steps/StepFirstAppointment";
import StepCurrentAppointment from "../../components/dos/steps/StepCurrentAppointment";

const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "First Appt" },
  { id: 5, label: "Current Appt" },
  { id: 6, label: "Finishing" },
];

const DRAFT_STORAGE_KEY = "teacher_form_draft_v2";
const LEAVE_WARNING_MESSAGE =
  "Saved teacher registration draft will be lost. Do you want to continue?";

function RegTeacherInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(TeacherFormContext);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    currentStep,
    isNicVerified,
    isPersonalValid,
    isContactValid,
    isFirstApptValid,
    isCurrentApptValid,
    error,
    isRestored,
  } = state;

  const hasDraftData =
    currentStep > 1 || Object.keys(formData || {}).length > 0;

  // ✅ ALL HOOKS MUST BE AT THE TOP LEVEL - BEFORE ANY CONDITIONAL RETURNS
  const discardDraft = useCallback(() => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    dispatch({ type: "CLEAR" });
  }, [dispatch]);

  const confirmDiscardAndRun = useCallback(
    (onConfirm) => {
      if (!hasDraftData) {
        onConfirm();
        return;
      }

      const confirmed = window.confirm(LEAVE_WARNING_MESSAGE);
      if (confirmed) {
        discardDraft();
        onConfirm();
      }
    },
    [hasDraftData, discardDraft],
  );

  const resetRegistration = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, [dispatch]);

  const handleStepClick = useCallback(
    (stepId) => {
      if (stepId < currentStep) {
        if (stepId === 1 && currentStep > 1) {
          confirmDiscardAndRun(() => {
            dispatch({ type: "SET_STEP", payload: 1 });
          });
          return;
        }
        dispatch({ type: "SET_STEP", payload: stepId });
        return;
      }

      // Validate current step before allowing next step
      if (currentStep === 1 && !isNicVerified) return;
      if (currentStep === 2 && !isPersonalValid) return;
      if (currentStep === 3 && !isContactValid) return;
      if (currentStep === 4 && !isFirstApptValid) return;
      if (currentStep === 5 && !isCurrentApptValid) return;

      if (stepId === currentStep + 1) {
        dispatch({ type: "SET_STEP", payload: stepId });
      }
    },
    [
      currentStep,
      isNicVerified,
      isPersonalValid,
      isContactValid,
      isFirstApptValid,
      isCurrentApptValid,
      confirmDiscardAndRun,
      dispatch,
    ],
  );

  const validateCurrentStep = useCallback(() => {
    if (currentStep === 1 && !isNicVerified) {
      toast.error("Please verify NIC before continuing.");
      return false;
    }
    if (currentStep === 2 && !isPersonalValid) {
      toast.error("Compulsory fields should be completed.");
      return false;
    }
    if (currentStep === 3 && !isContactValid) {
      toast.error("Compulsory fields should be completed.");
      return false;
    }
    if (currentStep === 4 && !isFirstApptValid) {
      toast.error("Compulsory fields should be completed.");
      return false;
    }
    if (currentStep === 5 && !isCurrentApptValid) {
      toast.error("Compulsory fields should be completed.");
      return false;
    }
    return true;
  }, [
    currentStep,
    isNicVerified,
    isPersonalValid,
    isContactValid,
    isFirstApptValid,
    isCurrentApptValid,
  ]);

  const back = useCallback(() => {
    if (currentStep === 6) return;

    const targetStep = Math.max(currentStep - 1, 1);
    if (targetStep === 1 && currentStep > 1) {
      confirmDiscardAndRun(() => {
        dispatch({ type: "SET_STEP", payload: 1 });
      });
      return;
    }

    dispatch({ type: "SET_STEP", payload: targetStep });
  }, [currentStep, confirmDiscardAndRun, dispatch]);

  const handleBackToList = useCallback(() => {
    confirmDiscardAndRun(() => navigate("/employees/teacher"));
  }, [confirmDiscardAndRun, navigate]);

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) return;

    if (currentStep === 5) {
      try {
        setIsSubmitting(true);
        dispatch({ type: "SET_ERROR", payload: null });

        const result = await registerTeacher(formData);

        if (result.status === "success") {
          toast.success("Teacher registered successfully");
          dispatch({ type: "SET_STEP", payload: 6 });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: result.message || "Failed to register teacher",
          });
        }
      } catch {
        dispatch({
          type: "SET_ERROR",
          payload: "Unable to complete registration. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    dispatch({
      type: "SET_STEP",
      payload: Math.min(currentStep + 1, STEPS.length),
    });
  }, [validateCurrentStep, currentStep, formData, dispatch]);

  // Warn user before leaving page
  useEffect(() => {
    if (!hasDraftData) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleLinkNavigation = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("target") === "_blank"
      )
        return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.origin);
      const current = window.location;
      const isSamePage =
        url.pathname === current.pathname &&
        url.search === current.search &&
        url.hash === current.hash;

      if (isSamePage) return;

      const confirmed = window.confirm(LEAVE_WARNING_MESSAGE);
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        discardDraft();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkNavigation, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkNavigation, true);
    };
  }, [hasDraftData, discardDraft]);

  // ✅ EARLY RETURN IS OK - ALL HOOKS ARE DEFINED ABOVE THIS LINE
  if (!isRestored) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  const setFormData = (updateOrValue) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Button
        onClick={handleBackToList}
        color="blue"
        className="mb-8 rounded-full px-6 py-2"
      >
        <HiArrowLeft /> Back To List
      </Button>

      {/* Form Container */}
      <div className="border border-gray-200 overflow-hidden rounded-lg">
        {/* Step Header */}
        <StepperHeader
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Step Content */}
        <div className="p-6 lg:p-8">
          {currentStep === 1 && (
            <StepNICVerification
              formData={formData}
              setFormData={setFormData}
              onVerified={() =>
                dispatch({ type: "SET_NIC_VERIFIED", payload: true })
              }
            />
          )}

          {currentStep === 2 && (
            <StepPersonalDetails
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) =>
                dispatch({ type: "SET_PERSONAL_VALID", payload: isValid })
              }
            />
          )}

          {currentStep === 3 && (
            <StepContactDetails
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) =>
                dispatch({ type: "SET_CONTACT_VALID", payload: isValid })
              }
            />
          )}

          {currentStep === 4 && (
            <StepFirstAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) =>
                dispatch({ type: "SET_FIRST_APPT_VALID", payload: isValid })
              }
            />
          )}

          {currentStep === 5 && (
            <StepCurrentAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) =>
                dispatch({ type: "SET_CURRENT_APPT_VALID", payload: isValid })
              }
            />
          )}

          {/* Step 06 – Finishing */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 w-8 h-8 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    Teacher Registration Successful
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Registration has been completed successfully.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <strong className="text-gray-700">Name:</strong>{" "}
                    <span className="text-gray-600">{formData.fullName}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">NIC:</strong>{" "}
                    <span className="text-gray-600">{formData.nic}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Email:</strong>{" "}
                    <span className="text-gray-600">{formData.email}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Contact Number:</strong>{" "}
                    <span className="text-gray-600">{formData.contact}</span>
                  </p>
                  <p className="md:col-span-2">
                    <strong className="text-gray-700">Current Position:</strong>{" "}
                    <span className="text-gray-600">
                      {formData.currentAppointmentPositionLabel ||
                        formData.currentAppointmentPosition}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  className="px-6 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                  onClick={resetRegistration}
                >
                  New Registration
                </button>

                <button className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  Download Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {currentStep !== 6 && (
          <div className="border-t">
            {error && (
              <div className="px-6 pt-4">
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">
                  {error}
                </div>
              </div>
            )}
            <StepNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onBack={back}
              onNext={handleNext}
              isProcessing={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegTeacher() {
  return (
    <TeacherFormProvider>
      <RegTeacherInner />
    </TeacherFormProvider>
  );
}
