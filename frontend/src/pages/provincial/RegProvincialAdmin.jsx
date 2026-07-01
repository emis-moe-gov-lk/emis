"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TeacherFormContext, TeacherFormProvider } from "@/context/TeacherFormContext";
import Swal from "sweetalert2";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import StepNICVerification from "@/components/dos/steps/StepNICVerification";
import StepPersonalDetails from "@/components/dos/steps/StepPersonalDetails";
import StepContactDetails from "@/components/dos/steps/StepContactDetails";
import StepFirstAppointment from "@/components/dosAdmin/steps/StepFirstAppointment";
import StepProvincialAdminCurrentAppointment from "@/components/dosAdmin/steps/StepProvincialAdminCurrentAppointment";

import api from "@/api/axios";
import toast from "react-hot-toast";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";
import { checkTeacherContact } from "@/api/teacherService";
import StepFinishing from "@/components/dosAdmin/steps/StepFinishing";

const REG_PROVINCIAL_ADMIN_HISTORY_OWNER = "regProvincialAdminCreate";
const REG_PROVINCIAL_ADMIN_HISTORY_STEP_KEY = "regProvincialAdminStep";
const REG_PROVINCIAL_ADMIN_TOTAL_STEPS = 6;

const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "First Appt" },
  { id: 5, label: "Current Appt" },
  { id: 6, label: "Finishing" },
];

function RegProvincialAdminInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(TeacherFormContext);
  const { identity, hasRole, isAuthenticated, isLoading: isAuthLoading } = useAuthUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  const [contactApiErrors, setContactApiErrors] = useState({});
  const isPopNavigationRef = useRef(false);
  const lastHistoryStepRef = useRef(null);
  const currentStepRef = useRef(1);

  const LEAVE_WARNING_MESSAGE =
    "Saved Provincial Administrator registration draft will be lost. Do you want to continue?";

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

  const canCreateProvincialAdmin =
    hasRole("super admin") ||
    hasRole("Provincial Director") ||
    hasRole("Provincial Deputy Director") ||
    hasRole("MOE Administrator") ||
    hasRole("MOE Director");

  const isAuthLoadingFinal = isAuthLoading || (isAuthenticated && !identity);

  const clampStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), REG_PROVINCIAL_ADMIN_TOTAL_STEPS);
  };

  const isRegProvincialAdminHistoryState = (historyState) =>
    Boolean(
      historyState &&
      historyState.__regProvincialAdminOwner === REG_PROVINCIAL_ADMIN_HISTORY_OWNER &&
      Number.isFinite(Number(historyState[REG_PROVINCIAL_ADMIN_HISTORY_STEP_KEY])),
    );

  const buildRegProvincialAdminHistoryState = (step) => {
    const baseState = window.history.state || {};
    return {
      ...baseState,
      __regProvincialAdminOwner: REG_PROVINCIAL_ADMIN_HISTORY_OWNER,
      [REG_PROVINCIAL_ADMIN_HISTORY_STEP_KEY]: clampStep(step),
    };
  };

  useEffect(() => {
    currentStepRef.current = clampStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (isAuthLoadingFinal || canCreateProvincialAdmin) return;

    dispatch({ type: "CLEAR" });
    toast.error("Unauthorized access.", { id: "provincial-admin-create-unauthorized" });
    navigate("/employees/provincial/admin", { replace: true });
  }, [canCreateProvincialAdmin, dispatch, isAuthLoadingFinal, navigate]);

  useEffect(() => {
    if (!isRestored) return;

    const currentUrl = window.location.href;
    const initialStep = clampStep(currentStepRef.current);
    const baseState = window.history.state;

    if (!isRegProvincialAdminHistoryState(baseState)) {
      window.history.replaceState(buildRegProvincialAdminHistoryState(initialStep), "", currentUrl);
    }

    window.history.pushState(buildRegProvincialAdminHistoryState(initialStep), "", currentUrl);
    lastHistoryStepRef.current = initialStep;

    const handlePopState = async (event) => {
      const currentUiStep = clampStep(currentStepRef.current);

      if (!isRegProvincialAdminHistoryState(event.state)) {
        window.history.pushState(
          buildRegProvincialAdminHistoryState(lastHistoryStepRef.current || currentUiStep || 1),
          "",
          currentUrl,
        );
        return;
      }

      const stepFromHistory = clampStep(event.state[REG_PROVINCIAL_ADMIN_HISTORY_STEP_KEY]);

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
            window.history.pushState(buildRegProvincialAdminHistoryState(currentUiStep), "", currentUrl);
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

    window.history.pushState(buildRegProvincialAdminHistoryState(normalizedStep), "", window.location.href);
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

  if (!isRestored || isAuthLoadingFinal || !canCreateProvincialAdmin) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const setFormData = (updateOrValue) => dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  
  const handleStepClick = (stepId) => {
    if (stepId < currentStep || (currentStep === 1 && isNicVerified) || (currentStep === 2 && isPersonalValid) || (currentStep === 3 && isContactValid) || (currentStep === 4 && isFirstApptValid)) {
        dispatch({ type: "SET_STEP", payload: stepId });
    }
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      const email = formData?.email?.trim();
      const phone = formData?.contact?.trim();
      const payload = {};

      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      if (Object.keys(payload).length > 0) {
        try {
          setIsSubmitting(true);
          setContactApiErrors({});

          const result = await checkTeacherContact(payload);
          const emailExists = Boolean(result?.email?.exists);
          const phoneExists = Boolean(result?.phone?.exists);

          if (emailExists || phoneExists) {
            const nextErrors = {};
            if (emailExists) nextErrors.email = "This email already exists.";
            if (phoneExists) nextErrors.contact = "This phone number already exists.";
            
            setContactApiErrors(nextErrors);
            toast.error("Email or phone number already exists.");
            return;
          }
        } catch (err) {
          toast.error("Unable to verify contact details. Please try again.");
          return;
        } finally {
          setIsSubmitting(false);
        }
      }
    }

    if (currentStep === 5) {
      try {
        setIsSubmitting(true);
        const payload = {
            ...formData,
            is_new_registration: formData.currentAppointmentRegType === "new",
            currentAppointmentWorkplace: formData.currentAppointmentZone,
        };
        const res = await api.post("/provincial-admins", payload);
        const result = res.data;

        if (result.status === "success") {
          toast.success("Provincial Administrator registered successfully");
          setRegistrationSummary({
              fullName: result.data.fullName,
              nic: result.data.nic,
              email: result.data.email,
              contact: result.data.contact,
              currentAppointmentPositionName: result.data.currentAppointmentPositionName,
              people_id: result.people_id,
              defaultPassword: result.default_password || "Password@123",
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
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <BackToListButton onClick={() => confirmDiscardAndRun(() => navigate("/employees/provincial/admin"))} label="Back To List" className="mb-8" />
      <div className="border border-gray-200 overflow-hidden rounded-lg">
        <StepperHeader steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />
        <div className="p-6 lg:p-8">
          {currentStep === 1 && <StepNICVerification formData={formData} setFormData={setFormData} onVerified={() => dispatch({ type: "SET_NIC_VERIFIED", payload: true })} />}
          {currentStep === 2 && <StepPersonalDetails formData={formData} setFormData={setFormData} onValid={(v) => dispatch({ type: "SET_PERSONAL_VALID", payload: v })} />}
          {currentStep === 3 && <StepContactDetails formData={formData} setFormData={setFormData} onValid={(v) => dispatch({ type: "SET_CONTACT_VALID", payload: v })} apiErrors={contactApiErrors} />}
          {currentStep === 4 && <StepFirstAppointment formData={formData} setFormData={setFormData} onValid={(v) => dispatch({ type: "SET_FIRST_APPT_VALID", payload: v })} />}
          {currentStep === 5 && <StepProvincialAdminCurrentAppointment formData={formData} setFormData={setFormData} onValid={(v) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: v })} />}
          {currentStep === 6 && (
            <StepFinishing formData={registrationSummary || formData} />
          )}
        </div>
        {currentStep < STEPS.length && (
            <div className="border-t">
                <StepNavigation currentStep={currentStep} totalSteps={STEPS.length} onBack={handleBack} onNext={handleNext} isProcessing={isSubmitting} canNext={
                    currentStep === 1 ? isNicVerified :
                    currentStep === 2 ? isPersonalValid :
                    currentStep === 3 ? isContactValid :
                    currentStep === 4 ? isFirstApptValid :
                    currentStep === 5 ? isCurrentApptValid : true
                } />
            </div>
        )}
      </div>
    </div>
  );
}

export default function RegProvincialAdmin() {
  return <TeacherFormProvider><RegProvincialAdminInner /></TeacherFormProvider>;
}
