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
import StepProvincialDeoCurrentAppointment from "@/components/deo/steps/StepProvincialDeoCurrentAppointment";

import {
  checkProvincialDeoContact,
  registerProvincialDeo,
} from "@/api/provincialDeoService";
import toast from "react-hot-toast";
import { HiCheckCircle } from "react-icons/hi";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

const REG_PROVINCIAL_DEO_HISTORY_OWNER = "regProvincialDeoCreate";
const REG_PROVINCIAL_DEO_HISTORY_STEP_KEY = "regProvincialDeoStep";
const REG_PROVINCIAL_DEO_TOTAL_STEPS = 5;

const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "Current Appt" },
  { id: 5, label: "Finishing" },
];

function RegProvincialDeoOfficerInner() {
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
    "Saved Provincial Development Officer registration draft will be lost. Do you want to continue?";

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

  const canCreateProvincialDeo =
    hasRole("super admin") ||
    hasRole("Provincial Director") ||
    hasRole("Provincial Deputy Director") ||
    hasRole("Provincial DEO") ||
    hasRole("MOE Administrator") ||
    hasRole("MOE Director");

  const isDeoOfficerCreateAuthLoading =
    isAuthLoading || (isAuthenticated && !identity);

  const clampStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), REG_PROVINCIAL_DEO_TOTAL_STEPS);
  };

  const isRegDeoOfficerHistoryState = (historyState) =>
    Boolean(
      historyState &&
      historyState.__regDeoOfficerOwner === REG_PROVINCIAL_DEO_HISTORY_OWNER &&
      Number.isFinite(Number(historyState[REG_PROVINCIAL_DEO_HISTORY_STEP_KEY])),
    );

  const buildRegDeoOfficerHistoryState = (step) => {
    const baseState = window.history.state || {};
    return {
      ...baseState,
      __regDeoOfficerOwner: REG_PROVINCIAL_DEO_HISTORY_OWNER,
      [REG_PROVINCIAL_DEO_HISTORY_STEP_KEY]: clampStep(step),
    };
  };

  useEffect(() => {
    currentStepRef.current = clampStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (isDeoOfficerCreateAuthLoading || canCreateProvincialDeo) return;

    dispatch({ type: "CLEAR" });
    toast.error("Unauthorized access.", {
      id: "provincial-deo-officer-create-unauthorized",
    });
    navigate("/employees/provincial/deo", { replace: true });
  }, [canCreateProvincialDeo, dispatch, isDeoOfficerCreateAuthLoading, navigate]);

  useEffect(() => {
    if (!isRestored) return;

    const currentUrl = window.location.href;
    const initialStep = clampStep(currentStepRef.current);
    const baseState = window.history.state;

    if (!isRegDeoOfficerHistoryState(baseState)) {
      window.history.replaceState(buildRegDeoOfficerHistoryState(initialStep), "", currentUrl);
    } else if (clampStep(baseState[REG_PROVINCIAL_DEO_HISTORY_STEP_KEY]) !== initialStep) {
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

      const stepFromHistory = clampStep(event.state[REG_PROVINCIAL_DEO_HISTORY_STEP_KEY]);

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

  if (!isRestored || isDeoOfficerCreateAuthLoading || !canCreateProvincialDeo) {
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

          const result = await checkProvincialDeoContact(payload);
          const emailExists = Boolean(result?.email?.exists);
          const phoneExists = Boolean(result?.phone?.exists);

          if (emailExists || phoneExists) {
            const nextErrors = {};
            if (emailExists) {
              nextErrors.email = result?.email?.message || "E-mail has been already registered";
              showErrorToast(
                result?.email?.message || "E-mail has been already registered",
                "email-already-registered",
              );
            }
            if (phoneExists) {
              nextErrors.contact = result?.phone?.message || "Mobile number has been already registered";
              showErrorToast(
                result?.phone?.message || "Mobile number has been already registered",
                "phone-already-registered",
              );
            }
            setContactApiErrors(nextErrors);
            return;
          }
        } catch (error) {
          console.error("Failed to check contact validation details", error);
          showErrorToast("Failed to validate contact details. Please try again.", "contact-check-failure");
          return;
        } finally {
          setIsSubmitting(false);
        }
      }
    }

    if (currentStep === 4) {
      try {
        setIsSubmitting(true);

        const currentWp = formData.currentAppointmentZone;
        const currentPos = formData.currentAppointmentPosition;

        const payload = {
          // Personal details
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

          // Contact details
          email: formData.email,
          contact: formData.contact,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          addressLine3: formData.addressLine3,
          postalCode: formData.postalCode,

          // Current appointment details mapped to expected controller fields
          appointmentDate: formData.currentAppointmentDate,
          appointmentLetter: formData.currentAppointmentLetter,
          rankId: formData.currentAppointmentRank,
          positionId: currentPos,
          provincialOfficeId: currentWp,
        };

        const result = await registerProvincialDeo(payload);

        if (result?.status === "success") {
          showSuccessToast("Provincial Development Officer registered successfully.", "deo-create-success");
          setRegistrationSummary({
            fullName: result?.data?.fullName || "",
            nic: result?.data?.nic || "",
            email: result?.data?.email || "",
            contact: result?.data?.contact || "",
            currentPosition: result?.data?.currentAppointmentPositionName || "",
            defaultPassword: result?.default_password || "",
          });
          setIsRegistrationComplete(true);
          dispatch({ type: "SET_STEP", payload: 5 });
        } else {
          showErrorToast(result?.message || "Registration failed. Please try again.", "deo-create-api-error");
        }
      } catch (error) {
        console.error("Failed to submit Development Officer details", error);
        showErrorToast("Something went wrong during registration.", "deo-create-failure");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    dispatch({ type: "SET_STEP", payload: currentStep + 1 });
  };

  const back = () => {
    if (currentStep === 1) return;
    dispatch({ type: "SET_STEP", payload: currentStep - 1 });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <BackToListButton
        onClick={() => confirmDiscardAndRun(() => navigate("/employees/provincial/deo"), { forceDiscard: true })}
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
              onVerified={() => dispatch({ type: "SET_NIC_VERIFIED", payload: true })}
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
              apiErrors={contactApiErrors}
              onValid={(valid) => dispatch({ type: "SET_CONTACT_VALID", payload: valid })}
            />
          )}

          {currentStep === 4 && (
            <StepProvincialDeoCurrentAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(valid) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: valid })}
            />
          )}

          {currentStep === 5 && (
            <div className="space-y-6 text-center max-w-xl mx-auto py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mx-auto">
                <HiCheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Complete!</h3>
                <p className="text-gray-500">Provincial Development Officer credentials successfully initialized.</p>
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
                <Button
                  variant="primary"
                  onClick={() =>
                    confirmDiscardAndRun(() => navigate("/employees/provincial/deo"), {
                      skipPrompt: true,
                      forceDiscard: true,
                    })
                  }
                >
                  Return to Directory
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetRegistration();
                    setIsRegistrationComplete(false);
                    dispatch({ type: "SET_STEP", payload: 1 });
                  }}
                >
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
              onBack={back}
              onNext={next}
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

export default function RegProvincialDeoOfficer() {
  return (
    <TeacherFormProvider>
      <RegProvincialDeoOfficerInner />
    </TeacherFormProvider>
  );
}
