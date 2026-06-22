"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TeacherFormContext, TeacherFormProvider } from "@/context/TeacherFormContext";
import Swal from "sweetalert2";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import StepNICVerification from "@/components/moe/steps/StepNICVerification";
import StepPersonalDetails from "@/components/moe/steps/StepPersonalDetails";
import StepContactDetails from "@/components/moe/steps/StepContactDetails";
import StepFirstAppointment from "@/components/moe/steps/StepFirstAppointment";
import StepMoeAdminCurrentAppointment from "@/components/moe/steps/StepMoeAdminCurrentAppointment";

import api from "@/api/axios";
import toast from "react-hot-toast";
import { HiCheckCircle } from "react-icons/hi";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

const REG_MOE_ADMIN_HISTORY_OWNER = "regMoeAdminCreate";
const REG_MOE_ADMIN_HISTORY_STEP_KEY = "regMoeAdminStep";
const REG_MOE_ADMIN_TOTAL_STEPS = 6;

const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "First Appt" },
  { id: 5, label: "Current Appt" },
  { id: 6, label: "Finishing" },
];

function RegMoeAdminInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(TeacherFormContext);
  const { identity, hasRole, isAuthenticated, isLoading: isAuthLoading } = useAuthUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  const isPopNavigationRef = useRef(false);
  const lastHistoryStepRef = useRef(null);
  const currentStepRef = useRef(1);

  const LEAVE_WARNING_MESSAGE =
    "Saved MOE Administrator registration draft will be lost. Do you want to continue?";

  const {
    formData,
    currentStep,
    isNicVerified,
    isPersonalValid,
    isContactValid,
    isFirstApptValid,
    isCurrentApptValid,
    isRestored,
  } = state;

  const hasDraftData =
    !isRegistrationComplete &&
    (currentStep > 1 || Object.keys(formData || {}).length > 0);

  const canCreateMoeAdmin = hasRole("super admin") || hasRole("MOE Administrator") || hasRole("MOE Director");
  const isAuthLoadingFinal = isAuthLoading || (isAuthenticated && !identity);

  const clampStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), REG_MOE_ADMIN_TOTAL_STEPS);
  };

  const isRegMoeAdminHistoryState = (historyState) =>
    Boolean(
      historyState &&
      historyState.__regMoeAdminOwner === REG_MOE_ADMIN_HISTORY_OWNER &&
      Number.isFinite(Number(historyState[REG_MOE_ADMIN_HISTORY_STEP_KEY])),
    );

  const buildRegMoeAdminHistoryState = (step) => {
    const baseState = window.history.state || {};
    return {
      ...baseState,
      __regMoeAdminOwner: REG_MOE_ADMIN_HISTORY_OWNER,
      [REG_MOE_ADMIN_HISTORY_STEP_KEY]: clampStep(step),
    };
  };

  useEffect(() => {
    currentStepRef.current = clampStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (isAuthLoadingFinal || canCreateMoeAdmin) return;

    dispatch({ type: "CLEAR" });
    toast.error("Unauthorized access.", { id: "moe-admin-create-unauthorized" });
    navigate("/employees/moe/admin", { replace: true });
  }, [canCreateMoeAdmin, dispatch, isAuthLoadingFinal, navigate]);

  useEffect(() => {
    if (!isRestored) return;

    const currentUrl = window.location.href;
    const initialStep = clampStep(currentStepRef.current);
    const baseState = window.history.state;

    if (!isRegMoeAdminHistoryState(baseState)) {
      window.history.replaceState(buildRegMoeAdminHistoryState(initialStep), "", currentUrl);
    }

    window.history.pushState(buildRegMoeAdminHistoryState(initialStep), "", currentUrl);
    lastHistoryStepRef.current = initialStep;

    const handlePopState = async (event) => {
      const currentUiStep = clampStep(currentStepRef.current);

      if (!isRegMoeAdminHistoryState(event.state)) {
        window.history.pushState(
          buildRegMoeAdminHistoryState(lastHistoryStepRef.current || currentUiStep || 1),
          "",
          currentUrl,
        );
        return;
      }

      const stepFromHistory = clampStep(event.state[REG_MOE_ADMIN_HISTORY_STEP_KEY]);

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
            window.history.pushState(buildRegMoeAdminHistoryState(currentUiStep), "", currentUrl);
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

    window.history.pushState(buildRegMoeAdminHistoryState(normalizedStep), "", window.location.href);
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

  if (!isRestored || isAuthLoadingFinal || !canCreateMoeAdmin) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const setFormData = (updateOrValue) => dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  const handleStepClick = (stepId) => {
    if (stepId < currentStep || (currentStep === 1 && isNicVerified) || (currentStep === 2 && isPersonalValid) || (currentStep === 3 && isContactValid) || (currentStep === 4 && isFirstApptValid)) {
        dispatch({ type: "SET_STEP", payload: stepId });
    }
  };

  const handleNext = async () => {
    if (currentStep === 5) {
      try {
        setIsSubmitting(true);
        const payload = {
            ...formData,
            is_new_registration: formData.currentAppointmentRegType === "new",
            currentAppointmentWorkplace: formData.currentAppointmentZone,
        };
        const res = await api.post("/moe-admins", payload);
        const result = res.data;

        if (result.status === "success") {
          toast.success("MOE Administrator registered successfully");
          setRegistrationSummary({
              fullName: result.data.fullName,
              nic: result.data.nic,
              email: result.data.email,
              contact: result.data.contact,
              currentPosition: result.data.currentAppointmentPositionName,
              people_id: result.people_id,
              defaultPassword: result.default_password || "Pw" + formData.nic,
          });
          setIsRegistrationComplete(true);
          dispatch({ type: "SET_STEP", payload: 6 });
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
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <BackToListButton
        onClick={() => confirmDiscardAndRun(() => navigate("/employees/moe/admin"))}
        label="Back To List"
        className="mb-8"
      />

      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden rounded-3xl shadow-sm">
        <StepperHeader steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

        <div className="p-6 lg:p-8">
          {currentStep === 1 && (
            <StepNICVerification
              formData={formData}
              setFormData={setFormData}
              onVerified={(verified) => dispatch({ type: "SET_NIC_VERIFIED", payload: verified })}
            />
          )}

          {currentStep === 2 && (
            <StepPersonalDetails
              formData={formData}
              setFormData={setFormData}
              onValid={(valid) => dispatch({ type: "SET_PERSONAL_VALID", payload: valid })}
            />
          )}

          {currentStep === 3 && (
            <StepContactDetails
              formData={formData}
              setFormData={setFormData}
              onValid={(valid) => dispatch({ type: "SET_CONTACT_VALID", payload: valid })}
            />
          )}

          {currentStep === 4 && (
            <StepFirstAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(valid) => dispatch({ type: "SET_FIRST_APPT_VALID", payload: valid })}
            />
          )}

          {currentStep === 5 && (
            <StepMoeAdminCurrentAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(valid) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: valid })}
            />
          )}

          {currentStep === 6 && (
            <div className="space-y-6 text-center max-w-xl mx-auto py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mx-auto">
                <HiCheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Complete!</h3>
                <p className="text-gray-500">MOE Administrator credentials successfully initialized.</p>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-slate-50 dark:bg-gray-800/40 text-left space-y-3 font-medium text-gray-700 dark:text-gray-300">
                <p><span className="text-gray-400 dark:text-gray-500 font-normal">Full Name:</span> {registrationSummary?.fullName}</p>
                <p><span className="text-gray-400 dark:text-gray-500 font-normal">NIC Number:</span> {registrationSummary?.nic}</p>
                <p><span className="text-gray-400 dark:text-gray-500 font-normal">Registered Email:</span> {registrationSummary?.email}</p>
                <p><span className="text-gray-400 dark:text-gray-500 font-normal">Contact Number:</span> {registrationSummary?.contact}</p>
                <p><span className="text-gray-400 dark:text-gray-500 font-normal">Designation:</span> {registrationSummary?.currentPosition}</p>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 text-sm">
                  <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-semibold">
                    🔑 Temporary password: {registrationSummary?.defaultPassword}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="primary" onClick={() => {
                  dispatch({ type: "CLEAR" });
                  navigate("/employees/moe/admin");
                }}>
                  Return to Directory
                </Button>
                <Button variant="secondary" onClick={() => {
                  dispatch({ type: "CLEAR" });
                  setIsRegistrationComplete(false);
                  dispatch({ type: "SET_STEP", payload: 1 });
                }}>
                  Register Another
                </Button>
              </div>
            </div>
          )}
        </div>

        {currentStep < STEPS.length && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <StepNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onBack={handleBack}
              onNext={handleNext}
              isProcessing={isSubmitting}
              canNext={
                currentStep === 1
                  ? isNicVerified
                  : currentStep === 2
                  ? isPersonalValid
                  : currentStep === 3
                  ? isContactValid
                  : currentStep === 4
                  ? isFirstApptValid
                  : currentStep === 5
                  ? isCurrentApptValid
                  : true
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegMoeAdmin() {
  return (
    <TeacherFormProvider>
      <RegMoeAdminInner />
    </TeacherFormProvider>
  );
}
