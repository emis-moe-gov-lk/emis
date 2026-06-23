"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DivisionAdminFormContext, DivisionAdminFormProvider } from "@/context/DivisionAdminFormContext";
import Swal from "sweetalert2";

import StepperHeader from "@/components/division/head/StepperHeader";
import StepNavigation from "@/components/division/head/StepNavigation";

import StepNICVerification from "@/components/division/head/steps/StepNICVerification";
import StepPersonalDetails from "@/components/division/head/steps/StepPersonalDetails";
import StepContactDetails from "@/components/division/head/steps/StepContactDetails";
import StepCurrentAppointment from "@/components/division/head/steps/StepCurrentAppointment";
import StepFinishing from "@/components/division/head/steps/StepFinishing";

import {
  downloadDivisionAdminProfileDocument,
  registerDivisionAdmin,
} from "@/api/divisionAdminService";
import toast from "react-hot-toast";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

const REG_DIVISION_ADMIN_HISTORY_OWNER = "regDivisionAdminCreate";
const REG_DIVISION_ADMIN_HISTORY_STEP_KEY = "regDivisionAdminStep";
const REG_DIVISION_ADMIN_TOTAL_STEPS = 5;

const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "Current Appt" },
  { id: 5, label: "Finishing" },
];

function RegDivisionAdminInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(DivisionAdminFormContext);
  const { identity, hasRole, isAuthenticated, isLoading: isAuthLoading } = useAuthUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  const isPopNavigationRef = useRef(false);
  const lastHistoryStepRef = useRef(null);
  const currentStepRef = useRef(1);

  const LEAVE_WARNING_MESSAGE =
    "Saved Division Administrator registration draft will be lost. Do you want to continue?";

  const {
    formData,
    currentStep,
    isNicVerified,
    isPersonalValid,
    isContactValid,
    isCurrentApptValid,
    error,
    isRestored,
  } = state;

  const hasDraftData =
    !isRegistrationComplete &&
    (currentStep > 1 || Object.keys(formData || {}).length > 0);

  const canCreateDivisionAdmin = hasRole("super admin"); 
  const isAuthLoadingFinal = isAuthLoading || (isAuthenticated && !identity);

  const clampStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), REG_DIVISION_ADMIN_TOTAL_STEPS);
  };

  const isRegDivisionAdminHistoryState = (historyState) =>
    Boolean(
      historyState &&
      historyState.__regDivisionAdminOwner === REG_DIVISION_ADMIN_HISTORY_OWNER &&
      Number.isFinite(Number(historyState[REG_DIVISION_ADMIN_HISTORY_STEP_KEY])),
    );

  const buildRegDivisionAdminHistoryState = (step) => {
    const baseState = window.history.state || {};
    return {
      ...baseState,
      __regDivisionAdminOwner: REG_DIVISION_ADMIN_HISTORY_OWNER,
      [REG_DIVISION_ADMIN_HISTORY_STEP_KEY]: clampStep(step),
    };
  };

  useEffect(() => {
    currentStepRef.current = clampStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (isAuthLoadingFinal || canCreateDivisionAdmin) return;

    dispatch({ type: "CLEAR" });
    toast.error("Unauthorized access.", { id: "division-admin-create-unauthorized" });
    navigate("/employees/division/admin", { replace: true });
  }, [canCreateDivisionAdmin, dispatch, isAuthLoadingFinal, navigate]);

  useEffect(() => {
    if (!isRestored) return;

    const currentUrl = window.location.href;
    const initialStep = clampStep(currentStepRef.current);
    const baseState = window.history.state;

    if (!isRegDivisionAdminHistoryState(baseState)) {
      window.history.replaceState(buildRegDivisionAdminHistoryState(initialStep), "", currentUrl);
    }

    window.history.pushState(buildRegDivisionAdminHistoryState(initialStep), "", currentUrl);
    lastHistoryStepRef.current = initialStep;

    const handlePopState = async (event) => {
      const currentUiStep = clampStep(currentStepRef.current);

      if (!isRegDivisionAdminHistoryState(event.state)) {
        window.history.pushState(
          buildRegDivisionAdminHistoryState(lastHistoryStepRef.current || currentUiStep || 1),
          "",
          currentUrl,
        );
        return;
      }

      const stepFromHistory = clampStep(event.state[REG_DIVISION_ADMIN_HISTORY_STEP_KEY]);

      if (stepFromHistory === 1 && currentUiStep > 1) {
        if (hasDraftData) {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: LEAVE_WARNING_MESSAGE,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Continue",
          });

          if (!result.isConfirmed) {
            window.history.pushState(buildRegDivisionAdminHistoryState(currentUiStep), "", currentUrl);
            lastHistoryStepRef.current = currentUiStep;
            return;
          }
        }
        dispatch({ type: "CLEAR" });
      }

      isPopNavigationRef.current = true;
      dispatch({ type: "SET_STEP", payload: stepFromHistory });
      lastHistoryStepRef.current = stepFromHistory;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [dispatch, hasDraftData, isRestored, LEAVE_WARNING_MESSAGE]);

  useEffect(() => {
    if (!isRestored) return;

    const normalizedStep = clampStep(currentStep);
    if (isPopNavigationRef.current) {
      isPopNavigationRef.current = false;
      lastHistoryStepRef.current = normalizedStep;
      return;
    }

    if (lastHistoryStepRef.current === normalizedStep) return;

    window.history.pushState(buildRegDivisionAdminHistoryState(normalizedStep), "", window.location.href);
    lastHistoryStepRef.current = normalizedStep;
  }, [currentStep, isRestored]);

  const confirmDiscardAndRun = async (onConfirm) => {
    if (!hasDraftData) {
      onConfirm();
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: LEAVE_WARNING_MESSAGE,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Continue",
    });

    if (!result.isConfirmed) return;

    dispatch({ type: "CLEAR" });
    onConfirm();
  };

  if (!isRestored || isAuthLoadingFinal || !canCreateDivisionAdmin) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const setFormData = (updateOrValue) => dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  const handleStepClick = (stepId) => {
    if (stepId < currentStep || (currentStep === 1 && isNicVerified) || (currentStep === 2 && isPersonalValid) || (currentStep === 3 && isContactValid) || (currentStep === 4 && isCurrentApptValid)) {
        dispatch({ type: "SET_STEP", payload: stepId });
    }
  };

  const handleNext = async () => {
    if (currentStep === 4) {
      try {
        setIsSubmitting(true);
        const payload = {
            ...formData,
            is_new_registration: formData.currentAppointmentRegType === "new",
            currentAppointmentWorkplace: formData.currentAppointmentZone,
        };
        const result = await registerDivisionAdmin(payload);

        if (result.status === "success") {
          toast.success("Division Administrator registered successfully");
          setRegistrationSummary({
              fullName: result.data.fullName,
              nic: result.data.nic,
              email: result.data.email,
              contact: result.data.contact,
              currentPosition: result.data.currentAppointmentPositionName,
              people_id: result.people_id,
          });
          setIsRegistrationComplete(true);
          dispatch({ type: "SET_STEP", payload: 5 });
        } else {
          toast.error(result.message || "Registration failed");
        }
      } catch (err) {
        toast.error("Unable to complete registration.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    dispatch({ type: "SET_STEP", payload: Math.min(currentStep + 1, STEPS.length) });
  };

  const handleBack = () => {
    if (currentStep > 1) dispatch({ type: "SET_STEP", payload: currentStep - 1 });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <BackToListButton onClick={() => confirmDiscardAndRun(() => navigate("/employees/division/admin"))} label="Back To List" className="mb-8" />
      <div className="border border-gray-200 overflow-hidden rounded-lg">
        <StepperHeader steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />
        <div className="p-6 lg:p-8">
          {currentStep === 1 && <StepNICVerification formData={formData} setFormData={setFormData} onVerified={() => dispatch({ type: "SET_NIC_VERIFIED", payload: true })} />}
          {currentStep === 2 && <StepPersonalDetails formData={formData} setFormData={setFormData} onValid={(v) => dispatch({ type: "SET_PERSONAL_VALID", payload: v })} />}
          {currentStep === 3 && <StepContactDetails formData={formData} setFormData={setFormData} onValid={(v) => dispatch({ type: "SET_CONTACT_VALID", payload: v })} />}
          {currentStep === 4 && <StepCurrentAppointment formData={formData} setFormData={setFormData} onValid={(v) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: v })} />}
          {currentStep === 5 && <StepFinishing formData={registrationSummary || formData} />}
        </div>
        {currentStep < STEPS.length && (
            <div className="border-t">
                <StepNavigation currentStep={currentStep} totalSteps={STEPS.length} onBack={handleBack} onNext={handleNext} isProcessing={isSubmitting} canNext={
                    currentStep === 1 ? isNicVerified :
                    currentStep === 2 ? isPersonalValid :
                    currentStep === 3 ? isContactValid :
                    currentStep === 4 ? isCurrentApptValid : true
                } />
            </div>
        )}
      </div>
    </div>
  );
}

export default function RegDivisionAdmin() {
  return <DivisionAdminFormProvider><RegDivisionAdminInner /></DivisionAdminFormProvider>;
}
