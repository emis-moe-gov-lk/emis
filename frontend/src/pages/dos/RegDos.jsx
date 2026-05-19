/**
 * DOS Officer Registration Form
 * 
 * This component provides a multi-step registration form for Development Officer of Schools (DOS).
 * It manages the complete registration workflow from NIC verification through appointment details.
 * 
 * Features:
 * - 5-step multi-step form with validation at each step
 * - Draft data persistence using session storage
 * - Form data management through context (TeacherFormContext)
 * - Auto-population of user's current workplace details
 * - Server submission to /deo-officers endpoint
 * - Unsaved changes protection with confirmation dialogs
 * - Responsive UI with Tailwind CSS and Flowbite components
 * 
 * @component
 * @returns {JSX.Element} The DOS registration form with stepper navigation
 */

"use client";
import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TeacherFormContext,
  TeacherFormProvider,
} from "@/context/TeacherFormContext";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import api from "@/api/axios";
import toast from "react-hot-toast";
import { HiCheckCircle } from "react-icons/hi";
import StepNICVerification from "../../components/dos/steps/StepNICVerification";
import StepPersonalDetails from "../../components/dos/steps/StepPersonalDetails";
import StepContactDetails from "../../components/dos/steps/StepContactDetails";
import StepFirstAppointment from "../../components/dos/steps/StepFirstAppointment";
import StepCurrentAppointment from "../../components/dos/steps/StepCurrentAppointment";
import { useAuthUser } from "@/context/useAuthUser";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

/**
 * Step configuration for the DOS registration form.
 * Each step represents a distinct phase in the registration process.
 */
const STEPS = [
  { id: 1, label: "Verification" },   // NIC verification step
  { id: 2, label: "Personal" },       // Personal details (name, DOB, etc.)
  { id: 3, label: "Contact" },        // Contact information (email, phone)
  { id: 4, label: "First Appt" },     // First appointment details
  { id: 5, label: "Current Appt" },   // Current appointment details
  { id: 6, label: "Finishing" },      // Completion confirmation
];

/** Session storage key for persisting DOS form draft data */
const DRAFT_STORAGE_KEY = "deo_form_draft_v1";

/** Warning message displayed when user tries to navigate away with unsaved changes */
const LEAVE_WARNING_MESSAGE =
  "Saved development officer registration draft will be lost. Do you want to continue?";

/**
 * RegDosInner - Internal component handling DOS registration logic
 * 
 * Manages:
 * - Multi-step form navigation and validation
 * - Form data state through context
 * - Draft data persistence
 * - API submission to backend
 * - User authentication and authorization
 * - Unsaved changes protection
 * 
 * @returns {JSX.Element} The DOS registration form UI
 */
function RegDosInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(TeacherFormContext);

  // State for managing form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destructure form state from context
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

  // Determine if there is any unsaved draft data
  const hasDraftData = currentStep > 1 || Object.keys(formData || {}).length > 0;

  /**
   * Clears the form draft from session storage and resets form state
   * Called when user confirms discard of draft data
   */
  const discardDraft = useCallback(() => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    dispatch({ type: "CLEAR" });
  }, [dispatch]);

  /**
   * Shows confirmation dialog if draft exists, then executes callback
   * Prevents accidental loss of user input
   * 
   * @param {Function} onConfirm - Callback to execute after confirmation
   */
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

  /**
   * Resets the entire registration form
   * Used after successful submission to allow new registration
   */
  const resetRegistration = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, [dispatch]);

  /**
   * Handles step navigation via stepper header
   * Validates current step before allowing advance
   * Confirms discard when returning to step 1 from later steps
   * 
   * @param {number} stepId - Target step ID to navigate to
   */
  const handleStepClick = useCallback(
    (stepId) => {
      // Handle backward navigation (within visited steps)
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

      // Validate current step before allowing forward navigation
      if (currentStep === 1 && !isNicVerified) return;
      if (currentStep === 2 && !isPersonalValid) return;
      if (currentStep === 3 && !isContactValid) return;
      if (currentStep === 4 && !isFirstApptValid) return;
      if (currentStep === 5 && !isCurrentApptValid) return;

      // Only allow navigation to next step
      if (stepId === currentStep + 1) {
        dispatch({ type: "SET_STEP", payload: stepId });
      }
    },
    [currentStep, isNicVerified, isPersonalValid, isContactValid, isFirstApptValid, isCurrentApptValid, confirmDiscardAndRun, dispatch],
  );

  /**
   * Validates the current step's data and displays error messages
   * Returns false if validation fails, preventing progression
   * 
   * @returns {boolean} True if current step data is valid
   */
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
  }, [currentStep, isNicVerified, isPersonalValid, isContactValid, isCurrentApptValid]);

  /**
   * Navigates to previous step
   * Prevents going back from completion step
   * Confirms discard when returning from step 2+ to step 1
   */
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

  /**
   * Navigates back to DOS officers list page
   * Confirms discard if draft data exists
   */
  const handleBackToList = useCallback(() => {
    confirmDiscardAndRun(() => navigate("/employees/development-officers"));
  }, [confirmDiscardAndRun, navigate]);

  // Get authenticated user details
  const { identity, workplace } = useAuthUser() || {};

  /**
   * Auto-populate current appointment fields with user's current workplace
   * Triggered after form restoration from context
   */
  useEffect(() => {
    if (!isRestored) return;

    // Populate zone and institution fields from authenticated user context
    dispatch({
      type: "UPDATE_FORM_DATA",
      payload: {
        currentAppointmentZone:
          formData.currentAppointmentZone || identity?.zone_id || identity?.zonal_education_office_id || "",
        currentAppointmentInstitution:
          formData.currentAppointmentInstitution || workplace?.workplace_id || identity?.office_id || "",
      },
    });
  }, [isRestored, dispatch, identity, workplace, formData.currentAppointmentZone, formData.currentAppointmentInstitution]);

  /**
   * Handles progression to next step or form submission
   * Validates current step, submits form on step 4, advances to next step otherwise
   * 
   * Form submission:
   * - Endpoint: POST /deo-officers
   * - Sends complete formData from context
   * - On success: Shows toast and advances to completion step
   * - On failure: Displays error message in form
   */
  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) return;

    // If on the last data step, submit to dos-admins endpoint
    if (currentStep === 5) {
      try {
        setIsSubmitting(true);
        dispatch({ type: "SET_ERROR", payload: null });

        const res = await api.post("/dos-admins", formData);
        const result = res?.data ?? {};

        if (result.status === "success" || res.status === 201) {
          toast.success("Zonal Administrator registered successfully");
          dispatch({ type: "SET_STEP", payload: 6 });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: result.message || "Failed to register zonal administrator",
          });
        }
      } catch (err) {
        console.error("Zonal admin create error:", err);
        dispatch({
          type: "SET_ERROR",
          payload:
            err?.response?.data?.message ||
            "Unable to complete registration. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    dispatch({ type: "SET_STEP", payload: Math.min(currentStep + 1, STEPS.length) });
  }, [validateCurrentStep, currentStep, formData, dispatch]);

  /**
   * Effect: Unsaved changes protection
   * Prevents user from losing unsaved data by detecting page unload and link navigation
   * Only active if form has unsaved draft data
   */

  useEffect(() => {
    if (!hasDraftData) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleLinkNavigation = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor || anchor.hasAttribute("download") || anchor.getAttribute("target") === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.origin);
      const current = window.location;
      const isSamePage = url.pathname === current.pathname && url.search === current.search && url.hash === current.hash;

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

  if (!isRestored) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Helper to update form data in context
  const setFormData = (updateOrValue) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  };

  /**
   * Main render - displays stepper UI with conditional step components
   * Shows appropriate form step based on currentStep value
   * Each step collects specific DOS officer information
   */
  /**
   * Main render - displays stepper UI with conditional step components
   * Shows appropriate form step based on currentStep value
   * Each step collects specific DOS officer information
   */
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Back button - navigates to DOS officers list */}
      <BackToListButton onClick={handleBackToList} label="Back To List" className="mb-8" />

      {/* Main form container with stepper */}
      <div className="border border-gray-200 overflow-hidden rounded-lg">
        {/* Step indicator header */}
        <StepperHeader steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

        {/* Step content area - conditional rendering based on current step */}
        <div className="p-6 lg:p-8">
          {/* Step 1: NIC Verification */}
          {currentStep === 1 && (
            <StepNICVerification formData={formData} setFormData={setFormData} onVerified={() => dispatch({ type: "SET_NIC_VERIFIED", payload: true })} />
          )}

          {/* Step 2: Personal Details (Name, Date of Birth, etc.) */}
          {currentStep === 2 && (
            <StepPersonalDetails formData={formData} setFormData={setFormData} onValid={(isValid) => dispatch({ type: "SET_PERSONAL_VALID", payload: isValid })} />
          )}

          {/* Step 3: Contact Details (Email, Phone, Address) */}
          {currentStep === 3 && (
            <StepContactDetails formData={formData} setFormData={setFormData} onValid={(isValid) => dispatch({ type: "SET_CONTACT_VALID", payload: isValid })} />
          )}

          {/* Step 4: First Appointment (Service, Rank, Position, Institution) */}
          {currentStep === 4 && (
            <StepFirstAppointment formData={formData} setFormData={setFormData} onValid={(isValid) => dispatch({ type: "SET_FIRST_APPT_VALID", payload: isValid })} />
          )}

          {/* Step 5: Current Appointment (Service, Rank, Position, Workplace) */}
          {currentStep === 5 && (
            <StepCurrentAppointment formData={formData} setFormData={setFormData} onValid={(isValid) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: isValid })} />
          )}

          {/* Step 6: Completion Confirmation - displays success message and summary */}
          {currentStep === 6 && (
            <div className="space-y-8">
              {/* Success banner */}
              <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 w-8 h-8 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">Zonal Administrator Registration Successful</h3>
                  <p className="text-sm text-green-700 mt-1">Registration has been completed successfully.</p>
                </div>
              </div>

              {/* Registration summary data */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <strong className="text-gray-700">Name:</strong> <span className="text-gray-600">{formData.fullName}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">NIC:</strong> <span className="text-gray-600">{formData.nic}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Email:</strong> <span className="text-gray-600">{formData.email}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Contact Number:</strong> <span className="text-gray-600">{formData.contact}</span>
                  </p>
                  <p className="md:col-span-2">
                    <strong className="text-gray-700">Current Position:</strong> <span className="text-gray-600">{formData.currentAppointmentPositionLabel || formData.currentAppointmentPosition}</span>
                  </p>
                </div>
              </div>

              {/* Completion actions: New Registration or Download Profile */}
              <div className="flex justify-center gap-4 pt-4">
                <Button variant="secondary" onClick={resetRegistration}>New Registration</Button>
                <Button variant="primary">Download Profile</Button>
              </div>
            </div>
          )}
        </div>

        {/* Step navigation footer - hidden on completion step */}
        {currentStep !== 6 && (
          <div className="border-t">
            {/* Error message display */}
            {error && (
              <div className="px-6 pt-4">
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{error}</div>
              </div>
            )}
            {/* Back/Next navigation buttons */}
            <StepNavigation currentStep={currentStep} totalSteps={STEPS.length} onBack={back} onNext={handleNext} isProcessing={isSubmitting} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * RegDos - DOS Officer Registration Page Wrapper
 * 
 * Wraps RegDosInner component with TeacherFormProvider for context management
 * This provider manages the multi-step form state, validation, and draft persistence
 * 
 * @returns {JSX.Element} The DOS registration page with context provider
 */
export default function RegDos() {
  return (
    <TeacherFormProvider>
      <RegDosInner />
    </TeacherFormProvider>
  );
}
