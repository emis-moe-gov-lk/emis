"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TeacherFormContext, TeacherFormProvider } from "@/context/TeacherFormContext";
import Swal from "sweetalert2";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import StepNICVerification from "@/components/teacher/steps/StepNICVerification";
import StepPersonalDetails from "@/components/teacher/steps/StepPersonalDetails";
import StepContactDetails from "@/components/teacher/steps/StepContactDetails";
import StepFirstAppointment from "@/components/principal/steps/StepFirstAppointment";
import StepCurrentAppointment from "@/components/principal/steps/StepCurrentAppointment";

import {
  checkPrincipalContact,
  downloadPrincipalProfileDocument,
  registerPrincipal,
} from "@/api/principalService";
import toast from "react-hot-toast";
import { HiCheckCircle } from "react-icons/hi";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

const REG_PRINCIPAL_HISTORY_OWNER = "regPrincipalCreate";
const REG_PRINCIPAL_HISTORY_STEP_KEY = "regPrincipalStep";
const REG_PRINCIPAL_TOTAL_STEPS = 6;

function RegPrincipalInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(TeacherFormContext);
  const {
    identity,
    hasRole,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactApiErrors, setContactApiErrors] = useState({});
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  const isPopNavigationRef = useRef(false);
  const lastHistoryStepRef = useRef(null);
  const currentStepRef = useRef(1);

  const LEAVE_WARNING_MESSAGE =
    "Saved principal registration draft will be lost. Do you want to continue?";

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
    !isRegistrationComplete &&
    (currentStep > 1 || Object.keys(formData || {}).length > 0);
  const canCreatePrincipal = hasRole("super admin") || hasRole("zonal deo");
  const isPrincipalCreateAuthLoading =
    isAuthLoading || (isAuthenticated && !identity);

  const clampStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), REG_PRINCIPAL_TOTAL_STEPS);
  };

  const isRegPrincipalHistoryState = (historyState) =>
    Boolean(
      historyState &&
      historyState.__regPrincipalOwner === REG_PRINCIPAL_HISTORY_OWNER &&
      Number.isFinite(Number(historyState[REG_PRINCIPAL_HISTORY_STEP_KEY])),
    );

  const buildRegPrincipalHistoryState = (step) => {
    const baseState = window.history.state || {};
    return {
      ...baseState,
      __regPrincipalOwner: REG_PRINCIPAL_HISTORY_OWNER,
      [REG_PRINCIPAL_HISTORY_STEP_KEY]: clampStep(step),
    };
  };

  useEffect(() => {
    currentStepRef.current = clampStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (isPrincipalCreateAuthLoading || canCreatePrincipal) return;

    dispatch({ type: "CLEAR" });
    toast.error("Only Super Admin and Zonal DEO can create principal profiles.", {
      id: "principal-create-unauthorized",
    });
    navigate("/employees/principal", { replace: true });
  }, [canCreatePrincipal, dispatch, isPrincipalCreateAuthLoading, navigate]);

  useEffect(() => {
    if (!isRestored) return;

    const currentUrl = window.location.href;
    const initialStep = clampStep(currentStepRef.current);
    const baseState = window.history.state;

    if (!isRegPrincipalHistoryState(baseState)) {
      window.history.replaceState(buildRegPrincipalHistoryState(initialStep), "", currentUrl);
    } else if (clampStep(baseState[REG_PRINCIPAL_HISTORY_STEP_KEY]) !== initialStep) {
      window.history.replaceState(
        buildRegPrincipalHistoryState(initialStep),
        "",
        currentUrl,
      );
    }

    window.history.pushState(buildRegPrincipalHistoryState(initialStep), "", currentUrl);

    lastHistoryStepRef.current = initialStep;

    const handlePopState = async (event) => {
      const currentUiStep = clampStep(currentStepRef.current);

      if (!isRegPrincipalHistoryState(event.state)) {
        window.history.pushState(
          buildRegPrincipalHistoryState(lastHistoryStepRef.current || currentUiStep || 1),
          "",
          currentUrl,
        );
        return;
      }

      const stepFromHistory = clampStep(event.state[REG_PRINCIPAL_HISTORY_STEP_KEY]);

      if (stepFromHistory === 1 && currentUiStep > 1) {
        if (hasDraftData) {
          const result = await Swal.fire({
            title: "Are you sure?",
            text: LEAVE_WARNING_MESSAGE,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Continue"
          });

          if (!result.isConfirmed) {
            window.history.pushState(
              buildRegPrincipalHistoryState(currentUiStep),
              "",
              currentUrl,
            );
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
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
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

    window.history.pushState(
      buildRegPrincipalHistoryState(normalizedStep),
      "",
      window.location.href,
    );
    lastHistoryStepRef.current = normalizedStep;
  }, [currentStep, isRestored]);

  const discardDraft = () => {
    dispatch({ type: "CLEAR" });
  };

  const confirmDiscardAndRun = async (
    onConfirm,
    { skipPrompt = false, forceDiscard = false } = {},
  ) => {
    if (skipPrompt) {
      if (forceDiscard) {
        discardDraft();
      }
      onConfirm();
      return;
    }

    if (!hasDraftData) {
      if (forceDiscard) {
        discardDraft();
      }
      onConfirm();
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Saved principal registration draft will be lost. Do you want to continue?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Continue"
    });

    if (!result.isConfirmed) return;

    discardDraft();
    onConfirm();
  };

  useEffect(() => {
    if (!hasDraftData) return;

    const handleLinkNavigation = async (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("target") === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.origin);
      const current = window.location;
      const isSamePage =
        url.pathname === current.pathname &&
        url.search === current.search &&
        url.hash === current.hash;

      if (isSamePage) return;

      event.preventDefault();
      event.stopPropagation();

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Saved principal registration draft will be lost. Do you want to continue?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, continue"
      });

      if (!result.isConfirmed) return;

      discardDraft();
      window.location.href = href;
    };

    document.addEventListener("click", handleLinkNavigation, true);

    return () => {
      document.removeEventListener("click", handleLinkNavigation, true);
    };
  }, [hasDraftData]);

  if (!isRestored || isPrincipalCreateAuthLoading || !canCreatePrincipal) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">
            {isPrincipalCreateAuthLoading ? "Loading form..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  const setFormData = (updateOrValue) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  };

  const steps = [
    { id: 1, label: "Verification" },
    { id: 2, label: "Personal" },
    { id: 3, label: "Contact" },
    { id: 4, label: "First Appt" },
    { id: 5, label: "Current Appt" },
    { id: 6, label: "Finishing" },
  ];

  const resetRegistration = () => {
    dispatch({ type: "CLEAR" });
  };

  const showErrorToast = (message, id) => {
    toast.error(message, { id });
  };

  const showSuccessToast = (message, id) => {
    toast.success(message, { id });
  };

  const handleDownloadProfile = async () => {
    const peopleId =
      registrationSummary?.people_id ||
      formData?.people_id ||
      formData?.peopleId;

    if (!peopleId) {
      showErrorToast("Missing people id for PDF download.", "principal-profile-download-missing-id");
      return;
    }

    try {
      const response = await downloadPrincipalProfileDocument(peopleId);
      const contentType = response.headers?.["content-type"] || "application/pdf";
      const disposition = response.headers?.["content-disposition"] || "";
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || `principal-profile-${peopleId}.pdf`;

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
      showErrorToast("Unable to download profile PDF.", "principal-profile-download-failed");
    }
  };

  const handleStepClick = async (stepId) => {
    if (stepId < currentStep) {
      if (stepId === 1 && currentStep > 1) {
        await confirmDiscardAndRun(() => {
          dispatch({ type: "SET_STEP", payload: 1 });
        });
        return;
      }

      dispatch({ type: "SET_STEP", payload: stepId });
      return;
    }

    if (currentStep === 1 && !isNicVerified) return;
    if (currentStep === 2 && !isPersonalValid) return;
    if (currentStep === 3 && !isContactValid) return;
    if (currentStep === 4 && !isFirstApptValid) return;
    if (currentStep === 5 && !isCurrentApptValid) return;

    if (stepId === currentStep + 1) {
      dispatch({ type: "SET_STEP", payload: stepId });
    }
  };

  const next = async () => {
    if (currentStep === 1 && !isNicVerified) {
      showErrorToast("Please verify NIC before continuing.", "verify-nic-required");
      return;
    }
    if (currentStep === 2 && !isPersonalValid) {
      showErrorToast("Compulsory fields should be completed.", "personal-details-required");
      return;
    }
    if (currentStep === 3 && !isContactValid) {
      showErrorToast("Compulsory fields should be completed.", "contact-details-required");
      return;
    }

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

          const result = await checkPrincipalContact(payload);
          const emailExists = Boolean(result?.email?.exists);
          const phoneExists = Boolean(result?.phone?.exists);

          if (emailExists || phoneExists) {
            const nextErrors = {};
            if (emailExists) nextErrors.email = "This email already exists.";
            if (phoneExists) {
              nextErrors.contact = "This phone number already exists.";
            }
            setContactApiErrors(nextErrors);
            showErrorToast("Email or phone number already exists.", "contact-exists");
            return;
          }
        } catch {
          showErrorToast("Unable to verify contact details. Please try again.", "contact-verify-failed");
          return;
        } finally {
          setIsSubmitting(false);
        }
      }
    }
    if (currentStep === 4 && !isFirstApptValid) {
      showErrorToast("Compulsory fields should be completed.", "first-appointment-required");
      return;
    }
    if (currentStep === 5 && !isCurrentApptValid) {
      showErrorToast("Compulsory fields should be completed.", "current-appointment-required");
      return;
    }

    if (currentStep === 5) {
      try {
        setIsSubmitting(true);
        dispatch({ type: "SET_ERROR", payload: null });

        const result = await registerPrincipal(formData);

        if (result.status === "success") {
          const responseData = result.data || {};
          const summary = {
            name:
              responseData.name ||
              responseData.fullName ||
              responseData.full_name ||
              formData.fullName,
            nic: responseData.nic || responseData.NIC || responseData.nic_no || formData.nic,
            email: responseData.email || responseData.email_address || formData.email,
            contact: responseData.contact || responseData.phone || responseData.phone_no || formData.contact,
            currentAppointmentPositionName:
              responseData.currentAppointmentPositionName ||
              responseData.current_appointment_position_name ||
              responseData.currentAppointmentPositionLabel ||
              responseData.currentAppointmentPosition ||
              formData.currentAppointmentPositionName ||
              formData.currentAppointmentPositionLabel ||
              formData.currentAppointmentPosition,
            people_id: result.people_id || responseData.people_id || null,
          };

          setRegistrationSummary(summary);
          dispatch({ type: "UPDATE_FORM_DATA", payload: summary });
          dispatch({ type: "COMPLETE_REGISTRATION" });
          setIsRegistrationComplete(true);
          showSuccessToast("Principal registered successfully", "principal-registration-success");
          dispatch({ type: "SET_STEP", payload: 6 });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: result.message || "Failed to register principal",
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

    dispatch({ type: "SET_STEP", payload: Math.min(currentStep + 1, steps.length) });
  };

  const handleContactFieldEdit = (field) => {
    setContactApiErrors((prev) => {
      if (!prev[field]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const back = async () => {
    if (currentStep === 6) return;

    const targetStep = Math.max(currentStep - 1, 1);
    if (targetStep === 1 && currentStep > 1) {
      await confirmDiscardAndRun(() => {
        dispatch({ type: "SET_STEP", payload: 1 });
      });
      return;
    }

    dispatch({ type: "SET_STEP", payload: targetStep });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <BackToListButton
        onClick={async () => {
          if (isRegistrationComplete) {
            await confirmDiscardAndRun(
              () => navigate("/employees/principal"),
              { skipPrompt: true, forceDiscard: true },
            );
            return;
          }

          await confirmDiscardAndRun(() => navigate("/employees/principal"));
        }}
        label="Back To List"
        className="mb-8"
      />
      <div className="border border-gray-200 overflow-hidden">
        <StepperHeader
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="p-6 lg:p-8">
          {currentStep === 1 && (
            <StepNICVerification
              formData={formData}
              setFormData={setFormData}
              isVerified={isNicVerified}
              onVerified={() =>
                dispatch({ type: "SET_NIC_VERIFIED", payload: true })
              }
              onVerificationReset={() =>
                dispatch({ type: "SET_NIC_VERIFIED", payload: false })
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
              apiErrors={contactApiErrors}
              onContactFieldEdit={handleContactFieldEdit}
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

          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 dark:text-green-500 w-8 h-8 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    Principal Registration Successfully
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Registration has been completed successfully.
                  </p>
                </div>
              </div>

              <div className="surface rounded-2xl p-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>Name:</strong> {registrationSummary?.name || "-"}
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
                  <strong>Current Appointed Position:</strong>{" "}
                  {registrationSummary?.currentAppointmentPositionName || "-"}
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button variant="secondary" onClick={resetRegistration}>New Registration</Button>
                <Button variant="primary" onClick={handleDownloadProfile}>Download Profile</Button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">
              {error}
            </div>
          </div>
        )}

        {currentStep !== 6 && (
          <div className="border-t">
            <StepNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onBack={back}
              onNext={next}
              isProcessing={isSubmitting}
              canNext={currentStep !== 1 || isNicVerified}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegPrincipal() {
  return (
    <TeacherFormProvider>
      <RegPrincipalInner />
    </TeacherFormProvider>
  );
}
