"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoeAdminFormContext, MoeAdminFormProvider } from "@/context/MoeAdminFormContext";
import Swal from "sweetalert2";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import StepNICVerification from "@/components/moe/steps/StepNICVerification";
import StepPersonalDetails from "@/components/moe/steps/StepPersonalDetails";
import StepContactDetails from "@/components/moe/steps/StepContactDetails";
import StepCurrentAppointment from "@/components/moe/steps/StepCurrentAppointment";
import { checkTeacherContact, downloadOfficeAdminProfileDocument } from "@/api/teacherService";

import api from "@/api/axios";
import toast from "react-hot-toast";
import { HiCheckCircle } from "react-icons/hi";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

const REG_MOE_ADMIN_HISTORY_OWNER = "regMoeAdminCreate";
const REG_MOE_ADMIN_HISTORY_STEP_KEY = "regMoeAdminStep";
const REG_MOE_ADMIN_TOTAL_STEPS = 5;

const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "Current Appt" },
  { id: 5, label: "Finishing" },
];

function RegMoeAdminInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(MoeAdminFormContext);
  const { identity, hasRole, isAuthenticated, isLoading: isAuthLoading } = useAuthUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  const [contactApiErrors, setContactApiErrors] = useState({});
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
  const handleDownloadProfile = async () => {
    const peopleId =
      registrationSummary?.people_id ||
      formData?.people_id ||
      formData?.peopleId;

    if (!peopleId) {
      toast.error("Missing people id for PDF download.");
      return;
    }

    try {
      const response = await downloadOfficeAdminProfileDocument(peopleId);
      const contentType = response.headers?.["content-type"] || "application/pdf";
      const disposition = response.headers?.["content-disposition"] || "";
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || `moe-admin-profile-${peopleId}.pdf`;

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
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

  const handleStepClick = (stepId) => {
    if (stepId < currentStep || (currentStep === 1 && isNicVerified) || (currentStep === 2 && isPersonalValid) || (currentStep === 3 && isContactValid) || (currentStep === 4 && isCurrentApptValid)) {
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

    if (currentStep === 4) {
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
              apiErrors={contactApiErrors}
            />
          )}

          {currentStep === 4 && (
            <StepCurrentAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(valid) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: valid })}
            />
          )}

          {/* ================= STEP 05 – FINISHING ================= */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 dark:text-green-500 w-8 h-8 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    MOE Administrator Registered Successfully
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
    <MoeAdminFormProvider>
      <RegMoeAdminInner />
    </MoeAdminFormProvider>
  );
}
