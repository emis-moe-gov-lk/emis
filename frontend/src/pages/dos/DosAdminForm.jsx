/**
 * DosAdminForm - Enhanced DOS Admin Registration Form
 * 
 * This is an advanced version of the DOS Officer registration form with:
 * - Browser history state management for step persistence across navigation
 * - Enhanced draft protection using SweetAlert2 instead of basic confirm dialogs
 * - Role-based access control (Super Admin and Zonal DEO only)
 * - Ref-based state tracking for complex navigation scenarios
 * - Pre-populated form data with auto-restoration from localStorage
 * 
 * Features:
 * - 6-step multi-step form with validation at each step
 * - Browser back/forward button integration with popstate event handling
 * - Automatic draft restoration on page load
 * - SweetAlert2 confirmation dialogs for better UX
 * - Complete registration summary with profile download
 * 
 * @component
 * @returns {JSX.Element} The enhanced DOS Admin registration form
 */

"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { TeacherFormContext, TeacherFormProvider } from "@/context/TeacherFormContext";
import Swal from "sweetalert2";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import StepNICVerification from "@/components/dos/steps/StepNICVerification";
import StepPersonalDetails from "@/components/dos/steps/StepPersonalDetails";
import StepContactDetails from "@/components/dos/steps/StepContactDetails";
import StepCurrentAppointment from "@/components/dos/steps/StepCurrentAppointment";

import {
  registerDosAdmin,
  downloadDosAdminProfileDocument,
} from "@/api/dosAdminService";
import toast from "react-hot-toast";
import { HiCheckCircle, HiArrowLeft } from "react-icons/hi";
import { useAuthUser } from "@/context/useAuthUser";

/**
 * History state management constants
 * These are used to track DOS Admin form state in browser history
 */
const REG_DOS_ADMIN_HISTORY_OWNER = "regDosAdminCreate";
const REG_DOS_ADMIN_HISTORY_STEP_KEY = "regDosAdminStep";
const REG_DOS_ADMIN_TOTAL_STEPS = 6;

/**
 * Step configuration for the DOS Admin registration form
 */
const STEPS = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Contact" },
  { id: 4, label: "Current Appt" },
  { id: 5, label: "Review" },
  { id: 6, label: "Finishing" },
];

/**
 * DosAdminFormInner - Internal component handling DOS Admin registration logic
 * 
 * Manages:
 * - Multi-step form navigation with browser history integration
 * - Form data state through context
 * - Draft data persistence
 * - Role-based access control
 * - Complex navigation with popstate event handling
 * - API submission to backend
 * 
 * @returns {JSX.Element} The DOS Admin registration form UI
 */
function DosAdminFormInner() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(TeacherFormContext);
  const {
    identity,
    hasRole,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthUser();

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Contact validation errors from API
  const [contactApiErrors, setContactApiErrors] = useState({});
  
  // Registration completion tracking
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);

  /**
   * Refs for managing complex navigation state
   * These persist across re-renders and help track history transitions
   */
  const isPopNavigationRef = useRef(false);
  const lastHistoryStepRef = useRef(null);
  const currentStepRef = useRef(1);

  const LEAVE_WARNING_MESSAGE =
    "Saved DOS Admin registration draft will be lost. Do you want to continue?";

  // Destructure form state from context
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

  // Determine if draft data exists
  const hasDraftData =
    !isRegistrationComplete &&
    (currentStep > 1 || Object.keys(formData || {}).length > 0);

  // Access control: Only Super Admin and Zonal DEO can create DOS Admin profiles
  const canCreateDosAdmin = hasRole("super admin") || hasRole("zonal deo");
  const isDosAdminCreateAuthLoading =
    isAuthLoading || (isAuthenticated && !identity);

  /**
   * Clamps step value to valid range (1 to REG_DOS_ADMIN_TOTAL_STEPS)
   * 
   * @param {number|string} value - Step value to clamp
   * @returns {number} Clamped step value
   */
  const clampStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), REG_DOS_ADMIN_TOTAL_STEPS);
  };

  /**
   * Validates if history state belongs to DOS Admin form
   * Uses a marker to ensure state is from this form, not another
   * 
   * @param {Object} historyState - Browser history state object
   * @returns {boolean} True if state is DOS Admin form history state
   */
  const isDosAdminFormHistoryState = (historyState) =>
    Boolean(
      historyState &&
      historyState.__dosAdminFormOwner === REG_DOS_ADMIN_HISTORY_OWNER &&
      Number.isFinite(Number(historyState[REG_DOS_ADMIN_HISTORY_STEP_KEY])),
    );

  /**
   * Builds a new history state object with DOS Admin form metadata
   * Preserves existing state while adding form-specific tracking
   * 
   * @param {number} step - Current form step
   * @returns {Object} Updated history state with form metadata
   */
  const buildDosAdminFormHistoryState = (step) => {
    const baseState = window.history.state || {};
    return {
      ...baseState,
      __dosAdminFormOwner: REG_DOS_ADMIN_HISTORY_OWNER,
      [REG_DOS_ADMIN_HISTORY_STEP_KEY]: clampStep(step),
    };
  };

  /**
   * Effect: Sync currentStepRef with context currentStep
   * Keeps ref updated for navigation handlers
   */
  useEffect(() => {
    currentStepRef.current = clampStep(currentStep);
  }, [currentStep]);

  /**
   * Effect: Authorization check
   * Redirects non-authorized users to DOS Admin list page
   */
  useEffect(() => {
    if (isDosAdminCreateAuthLoading || canCreateDosAdmin) return;

    dispatch({ type: "CLEAR" });
    toast.error("Only Super Admin and Zonal DEO can create DOS Admin profiles.", {
      id: "dos-admin-create-unauthorized",
    });
    navigate("/employees/dos-admins", { replace: true });
  }, [canCreateDosAdmin, dispatch, isDosAdminCreateAuthLoading, navigate]);

  /**
   * Effect: History state management and popstate handling
   * 
   * Initializes browser history tracking when form is restored.
   * Handles browser back/forward buttons with draft protection.
   */
  useEffect(() => {
    if (!isRestored) return;

    const currentUrl = window.location.href;
    const initialStep = clampStep(currentStepRef.current);
    const baseState = window.history.state;

    // Initialize history if not already set
    if (!isDosAdminFormHistoryState(baseState)) {
      window.history.replaceState(buildDosAdminFormHistoryState(initialStep), "", currentUrl);
    } else if (clampStep(baseState[REG_DOS_ADMIN_HISTORY_STEP_KEY]) !== initialStep) {
      window.history.replaceState(
        buildDosAdminFormHistoryState(initialStep),
        "",
        currentUrl,
      );
    }

    window.history.pushState(buildDosAdminFormHistoryState(initialStep), "", currentUrl);
    lastHistoryStepRef.current = initialStep;

    /**
     * Handle browser back/forward buttons with popstate event
     * Shows confirmation dialog if draft exists when navigating back to step 1
     */
    const handlePopState = async (event) => {
      const currentUiStep = clampStep(currentStepRef.current);

      // Ignore if not DOS Admin form state
      if (!isDosAdminFormHistoryState(event.state)) {
        window.history.pushState(
          buildDosAdminFormHistoryState(lastHistoryStepRef.current || currentUiStep || 1),
          "",
          currentUrl,
        );
        return;
      }

      const stepFromHistory = clampStep(event.state[REG_DOS_ADMIN_HISTORY_STEP_KEY]);

      // Handle navigation back to step 1 with draft protection
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
              buildDosAdminFormHistoryState(currentUiStep),
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

  /**
   * Effect: Update browser history when step changes via UI navigation
   * Maintains history state synchronization with form state
   */
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
      buildDosAdminFormHistoryState(normalizedStep),
      "",
      window.location.href,
    );
    lastHistoryStepRef.current = normalizedStep;
  }, [currentStep, isRestored]);

  /**
   * Clears form draft from context
   */
  const discardDraft = () => {
    dispatch({ type: "CLEAR" });
  };

  /**
   * Shows confirmation dialog if draft exists, then executes callback
   * Optional: Can skip prompt or force discard based on options
   * 
   * @param {Function} onConfirm - Callback to execute after confirmation
   * @param {Object} options - Configuration options
   * @param {boolean} options.skipPrompt - Skip confirmation dialog
   * @param {boolean} options.forceDiscard - Force draft discard regardless
   */
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
      text: "Saved DOS Admin registration draft will be lost. Do you want to continue?",
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

  /**
   * Effect: Unsaved changes protection for link navigation
   * Intercepts navigation links and shows confirmation dialog
   */
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
        text: "Saved DOS Admin registration draft will be lost. Do you want to continue?",
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

  /**
   * Loading state check before rendering
   */
  if (!isRestored || isDosAdminCreateAuthLoading || !canCreateDosAdmin) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">
            {isDosAdminCreateAuthLoading ? "Loading form..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Helper to update form data in context
   */
  const setFormData = (updateOrValue) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  };

  /**
   * Navigates back to DOS Admin list with draft protection
   */
  const handleBackToList = async () => {
    await confirmDiscardAndRun(() => navigate("/employees/dos-admins"));
  };

  /**
   * Handle step navigation via stepper
   */
  const handleStepClick = (stepId) => {
    if (stepId < currentStep) {
      dispatch({ type: "SET_STEP", payload: stepId });
      return;
    }

    // Validate current step before forward navigation
    if (currentStep === 1 && !isNicVerified) return;
    if (currentStep === 2 && !isPersonalValid) return;
    if (currentStep === 3 && !isContactValid) return;
    if (currentStep === 4 && !isCurrentApptValid) return;

    if (stepId === currentStep + 1) {
      dispatch({ type: "SET_STEP", payload: stepId });
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      dispatch({ type: "SET_STEP", payload: currentStep - 1 });
    }
  };

  /**
   * Handle step progression and form submission
   */
  const handleNext = async () => {
    // Review step shows summary before submission
    if (currentStep === 5) {
      dispatch({ type: "SET_STEP", payload: 6 });
      return;
    }

    // Final submission on step 5
    if (currentStep === 6) {
      try {
        setIsSubmitting(true);
        const res = await registerDosAdmin(formData);
        
        if (res.status === "success") {
          toast.success("DOS Admin registered successfully");
          setIsRegistrationComplete(true);
          setRegistrationSummary(res.data);
        } else {
          toast.error(res.message || "Registration failed");
        }
      } catch (err) {
        console.error("Registration error:", err);
        toast.error("Unable to complete registration. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Standard step progression with validation
    dispatch({ type: "SET_STEP", payload: Math.min(currentStep + 1, STEPS.length) });
  };

  /**
   * Main render - displays DOS Admin registration form
   */
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <Button onClick={handleBackToList} color="blue" className="mb-8 rounded-full px-6 py-2">
        <HiArrowLeft /> Back To List
      </Button>

      {/* Main form container */}
      <div className="border border-gray-200 overflow-hidden rounded-lg">
        {/* Stepper header */}
        <StepperHeader steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

        {/* Step content */}
        <div className="p-6 lg:p-8">
          {/* Step 1: NIC Verification */}
          {currentStep === 1 && (
            <StepNICVerification
              formData={formData}
              setFormData={setFormData}
              onVerified={() => dispatch({ type: "SET_NIC_VERIFIED", payload: true })}
            />
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <StepPersonalDetails
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) => dispatch({ type: "SET_PERSONAL_VALID", payload: isValid })}
            />
          )}

          {/* Step 3: Contact Details */}
          {currentStep === 3 && (
            <StepContactDetails
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) => dispatch({ type: "SET_CONTACT_VALID", payload: isValid })}
            />
          )}

          {/* Step 4: Current Appointment */}
          {currentStep === 4 && (
            <StepCurrentAppointment
              formData={formData}
              setFormData={setFormData}
              onValid={(isValid) => dispatch({ type: "SET_CURRENT_APPT_VALID", payload: isValid })}
            />
          )}

          {/* Step 5: Review Summary */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Information</h3>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Name:</strong> {formData.fullName}</p>
                  <p><strong>NIC:</strong> {formData.nic}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Contact:</strong> {formData.contact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Completion */}
          {currentStep === 6 && isRegistrationComplete && (
            <div className="space-y-8">
              <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 w-8 h-8 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">DOS Admin Registration Successful</h3>
                  <p className="text-sm text-green-700 mt-1">Registration has been completed successfully.</p>
                </div>
              </div>

              {registrationSummary && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-sm text-gray-600">Admin ID: {registrationSummary.id}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation footer */}
        {currentStep < STEPS.length && (
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
              onBack={handleBack}
              onNext={handleNext}
              isProcessing={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * DosAdminForm - DOS Admin Registration Page Wrapper
 * 
 * Wraps DosAdminFormInner with TeacherFormProvider for context management
 * @returns {JSX.Element} DOS Admin registration form with context provider
 */
export default function DosAdminForm() {
  return (
    <TeacherFormProvider>
      <DosAdminFormInner />
    </TeacherFormProvider>
  );
}
