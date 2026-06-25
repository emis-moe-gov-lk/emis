"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TeacherFormContext, TeacherFormProvider } from "@/context/TeacherFormContext";
import Swal from "sweetalert2";

import StepperHeader from "@/components/division/deo/StepperHeader";
import StepNavigation from "@/components/division/deo/StepNavigation";

import StepNICVerification from "@/components/division/deo/steps/StepNICVerification";
import StepPersonalDetails from "@/components/division/deo/steps/StepPersonalDetails";
import StepContactDetails from "@/components/division/deo/steps/StepContactDetails";
import StepDivisionCurrentAppointment from "@/components/division/deo/steps/StepDivisionCurrentAppointment";

import {
  checkDivisionDeoContact,
  registerDivisionDeo,
} from "@/api/divisionDeoService";
import toast from "react-hot-toast";
import { HiCheckCircle } from "react-icons/hi";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

const REG_DIVISION_DEO_HISTORY_OWNER = "regDivisionDeoCreate";
const REG_DIVISION_DEO_HISTORY_STEP_KEY = "regDivisionDeoStep";
const REG_DIVISION_DEO_TOTAL_STEPS = 5;

const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "Current Appt" },
  { id: 5, label: "Finishing" },
];

function RegDivisionDeoOfficerInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(TeacherFormContext);
  const { identity, hasRole, isAuthenticated, isLoading: isAuthLoading } = useAuthUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactApiErrors, setContactApiErrors] = useState({});
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);
  const isPopNavigationRef = useRef(false);
  const lastHistoryStepRef = useRef(null);
  const currentStepRef = useRef(1);

  const LEAVE_WARNING_MESSAGE =
    "Saved division development officer registration draft will be lost. Do you want to continue?";

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

  const canCreateDeoOfficer = hasRole("super admin") || hasRole("Divisional DEO HEAD") || hasRole("Divisional DEO") || hasRole("zonal deo");
  const isDeoOfficerCreateAuthLoading =
    isAuthLoading || (isAuthenticated && !identity);

  const clampStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), REG_DIVISION_DEO_TOTAL_STEPS);
  };

  const isRegDeoOfficerHistoryState = (historyState) =>
    Boolean(
      historyState &&
      historyState.__regDeoOfficerOwner === REG_DIVISION_DEO_HISTORY_OWNER &&
      Number.isFinite(Number(historyState[REG_DIVISION_DEO_HISTORY_STEP_KEY])),
    );

  const buildRegDeoOfficerHistoryState = (step) => {
    const baseState = window.history.state || {};
    return {
      ...baseState,
      __regDeoOfficerOwner: REG_DIVISION_DEO_HISTORY_OWNER,
      [REG_DIVISION_DEO_HISTORY_STEP_KEY]: clampStep(step),
    };
  };

  useEffect(() => {
    currentStepRef.current = clampStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (isDeoOfficerCreateAuthLoading || canCreateDeoOfficer) return;

    dispatch({ type: "CLEAR" });
    toast.error("Unauthorized access.", {
      id: "division-deo-officer-create-unauthorized",
    });
    navigate("/employees/division/deo", { replace: true });
  }, [canCreateDeoOfficer, dispatch, isDeoOfficerCreateAuthLoading, navigate]);

  useEffect(() => {
    if (!isRestored) return;

    const currentUrl = window.location.href;
    const initialStep = clampStep(currentStepRef.current);
    const baseState = window.history.state;

    if (!isRegDeoOfficerHistoryState(baseState)) {
      window.history.replaceState(buildRegDeoOfficerHistoryState(initialStep), "", currentUrl);
    } else if (clampStep(baseState[REG_DIVISION_DEO_HISTORY_STEP_KEY]) !== initialStep) {
      window.history.replaceState(buildRegDeoOfficerHistoryState(initialStep), "", currentUrl);
    }

    window.history.pushState(buildRegDeoOfficerHistoryState(initialStep), "", currentUrl);
    lastHistoryStepRef.current = initialStep;

    const handlePopState = async (event) => {
      const currentUiStep = clampStep(currentStepRef.current);

      if (!isRegDeoOfficerHistoryState(event.state)) {
        window.history.pushState(
          buildRegDeoOfficerHistoryState(lastHistoryStepRef.current || currentUiStep || 1),
          "",
          currentUrl,
        );
        return;
      }

      const stepFromHistory = clampStep(event.state[REG_DIVISION_DEO_HISTORY_STEP_KEY]);

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
            window.history.pushState(buildRegDeoOfficerHistoryState(currentUiStep), "", currentUrl);
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

    window.history.pushState(buildRegDeoOfficerHistoryState(normalizedStep), "", window.location.href);
    lastHistoryStepRef.current = normalizedStep;
  }, [currentStep, isRestored]);

  const discardDraft = () => {
    dispatch({ type: "CLEAR" });
  };

  const confirmDiscardAndRun = async (onConfirm, { skipPrompt = false, forceDiscard = false } = {}) => {
    if (skipPrompt) {
      if (forceDiscard) discardDraft();
      onConfirm();
      return;
    }

    if (!hasDraftData) {
      if (forceDiscard) discardDraft();
      onConfirm();
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: LEAVE_WARNING_MESSAGE,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Continue",
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
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

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
      const isSamePage = url.pathname === current.pathname && url.search === current.search && url.hash === current.hash;
      if (isSamePage) return;

      event.preventDefault();
      event.stopPropagation();

      const result = await Swal.fire({
        title: "Are you sure?",
        text: LEAVE_WARNING_MESSAGE,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, continue",
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

  if (!isRestored || isDeoOfficerCreateAuthLoading || !canCreateDeoOfficer) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">{isDeoOfficerCreateAuthLoading ? "Loading form..." : "Redirecting..."}</p>
        </div>
      </div>
    );
  }

  const setFormData = (updateOrValue) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  };

  const resetRegistration = () => {
    dispatch({ type: "CLEAR" });
  };

  const showErrorToast = (message, id) => {
    toast.error(message, { id });
  };

  const showSuccessToast = (message, id) => {
    toast.success(message, { id });
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
    if (currentStep === 4 && !isCurrentApptValid) return;

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

          const result = await checkDivisionDeoContact(payload);
          const emailExists = Boolean(result?.email?.exists);
          const phoneExists = Boolean(result?.phone?.exists);

          if (emailExists || phoneExists) {
            const nextErrors = {};
            if (emailExists) nextErrors.email = "This email already exists.";
            if (phoneExists) nextErrors.contact = "This phone number already exists.";
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
    if (currentStep === 4 && !isCurrentApptValid) {
      showErrorToast("Compulsory fields should be completed.", "current-appointment-required");
      return;
    }

    if (currentStep === 4) {
      try {
        setIsSubmitting(true);
        dispatch({ type: "SET_ERROR", payload: null });

        const payload = {
          nic: formData.nic,
          titleId: formData.titleId,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          genderId: formData.genderId,
          religionId: formData.religionId,
          ethnicityId: formData.ethnicityId,
          civilStatusId: formData.civilStatusId,
          bloodGroupId: formData.bloodGroupId,
          healthCondition: formData.healthCondition,
          healthConditionDescription: formData.healthConditionDescription,
          districtId: formData.districtId,
          gnDivisionId: formData.gnDivisionId,
          dsOfficeId: formData.dsOfficeId,
          email: formData.email,
          contact: formData.contact,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          addressLine3: formData.addressLine3,
          postalCode: formData.postalCode,
          appointmentDate: formData.currentAppointmentDate,
          appointmentLetter: formData.currentAppointmentLetter,
          rankId: formData.currentAppointmentRank,
          positionId: formData.currentAppointmentPosition,
          divisionalOfficeId: formData.currentAppointmentZone,
        };

        const result = await registerDivisionDeo(payload);

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
          showSuccessToast("Division Development Officer registered successfully", "division-deo-officer-registration-success");
          dispatch({ type: "SET_STEP", payload: 5 });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: result.message || "Failed to register division development officer",
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

    dispatch({ type: "SET_STEP", payload: Math.min(currentStep + 1, STEPS.length) });
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
    if (currentStep === 5) return;

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
          const listPath = "/employees/division/deo";
          if (isRegistrationComplete) {
            await confirmDiscardAndRun(() => navigate(listPath), {
              skipPrompt: true,
              forceDiscard: true,
            });
            return;
          }

          await confirmDiscardAndRun(() => navigate(listPath));
        }}
        label="Back To List"
        className="mb-8"
      />
      <div className="border border-gray-200 overflow-hidden">
        <StepperHeader steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

        <div className="p-6 lg:p-8">
          {currentStep === 1 && (
            <StepNICVerification
              formData={formData}
              setFormData={setFormData}
              isVerified={isNicVerified}
              onVerified={() => dispatch({ type: "SET_NIC_VERIFIED", payload: true })}
              onVerificationReset={() => dispatch({ type: "SET_NIC_VERIFIED", payload: false })}
            />
          )}

          {currentStep === 2 && (
            <StepPersonalDetails
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) => dispatch({ type: "SET_PERSONAL_VALID", payload: isValid })}
            />
          )}

          {currentStep === 3 && (
            <StepContactDetails
              formData={formData}
              setFormData={setFormData}
              apiErrors={contactApiErrors}
              onContactFieldEdit={handleContactFieldEdit}
              onValid={(isValid) => dispatch({ type: "SET_CONTACT_VALID", payload: isValid })}
            />
          )}

          {currentStep === 4 && (
            <StepDivisionCurrentAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: isValid })}
            />
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 dark:text-green-500 w-8 h-8 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    Division Development Officer Registered Successfully
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Registration has been completed successfully.
                  </p>
                </div>
              </div>

              <div className="surface rounded-2xl p-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-gray-100"><strong>Name:</strong> {registrationSummary?.name || "-"}</p>
                <p className="text-gray-900 dark:text-gray-100"><strong>NIC:</strong> {registrationSummary?.nic || "-"}</p>
                <p className="text-gray-900 dark:text-gray-100"><strong>Email:</strong> {registrationSummary?.email || "-"}</p>
                <p className="text-gray-900 dark:text-gray-100"><strong>Contact Number:</strong> {registrationSummary?.contact || "-"}</p>
                <p className="text-gray-900 dark:text-gray-100"><strong>Current Appointed Position:</strong> {registrationSummary?.currentAppointmentPositionName || "-"}</p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button variant="secondary" onClick={resetRegistration}>New Registration</Button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{error}</div>
          </div>
        )}

        {currentStep !== 5 && (
          <div className="border-t">
            <StepNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
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

export default function RegDivisionDeoOfficer() {
  return (
    <TeacherFormProvider>
      <RegDivisionDeoOfficerInner />
    </TeacherFormProvider>
  );
}
