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
import { downloadProvincialAdminProfileDocument } from "@/api/provincialAdminService";
import { checkTeacherContact } from "@/api/teacherService";
import { HiCheckCircle } from "react-icons/hi";

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

  const canCreateProvincialAdmin = hasRole("super admin") || hasRole("Provincial Director") || hasRole("Provincial Deputy Director");
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
              currentPosition: result.data.currentAppointmentPositionName,
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

  const handleDownloadProfile = async () => {
    const peopleId =
      registrationSummary?.people_id ||
      registrationSummary?.peopleId ||
      formData?.peopleId;

    if (!peopleId) {
      toast.error("Missing people id for PDF download.");
      return;
    }

    try {
      const data = await downloadProvincialAdminProfileDocument(peopleId);
      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `provincial-admin-profile-${peopleId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
        anchor.remove();
      }, 3000);
    } catch (_error) {
      toast.error("Unable to download profile PDF.");
    }
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
            <div className="space-y-8">
              <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 dark:text-green-500 w-8 h-8 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    Provincial Administrator Registered Successfully
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Registration has been completed successfully.
                  </p>
                </div>
              </div>

              <div className="surface rounded-2xl p-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>Name:</strong> {registrationSummary?.fullName || "-"}
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>NIC:</strong> {registrationSummary?.nic || "-"}
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>Email:</strong> {registrationSummary?.email || "-"}
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>Contact Number:</strong> {registrationSummary?.contact || "-"}
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>Current Appointed Position:</strong> {registrationSummary?.currentPosition || "-"}
                </p>
                <p className="text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                  <strong>Temporary Password:</strong> <span className="font-mono font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400">{registrationSummary?.defaultPassword || "-"}</span>
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    dispatch({ type: "CLEAR" });
                    setIsRegistrationComplete(false);
                    dispatch({ type: "SET_STEP", payload: 1 });
                  }}
                >
                  New Registration
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleDownloadProfile}
                >
                  Download Profile
                </Button>
              </div>
            </div>
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
