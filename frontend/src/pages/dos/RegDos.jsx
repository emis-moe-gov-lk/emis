"use client";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "flowbite-react";
import {
  TeacherFormContext,
  TeacherFormProvider,
} from "@/context/TeacherFormContext";

import StepperHeader from "@/components/teacher/StepperHeader";
import StepNavigation from "@/components/teacher/StepNavigation";

import { registerDeoOfficer, registerDosAdmin } from "@/api/deoOfficerService";
import toast from "react-hot-toast";
import { HiCheckCircle, HiArrowLeft } from "react-icons/hi";
import StepNICVerification from "../../components/dos/steps/StepNICVerification";
import StepPersonalDetails from "../../components/dos/steps/StepPersonalDetails";
import StepContactDetails from "../../components/dos/steps/StepContactDetails";
import StepFirstAppointment from "../../components/dos/steps/StepFirstAppointment";
import StepCurrentAppointment from "../../components/dos/steps/StepCurrentAppointment";

function RegDosInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useContext(TeacherFormContext);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEduDirectorPath = location.pathname.includes("/employees/edu-directors");
  const isZonalDirectorPath = location.pathname.includes(
    "/employees/zonaldirector",
  );

  const employeeType = isZonalDirectorPath ? "Zonal Director" : "Edu Director";
  const employeeTypePlural = isZonalDirectorPath
    ? "Zonal Directors"
    : "Edu Directors";
  const backPath = isZonalDirectorPath
    ? "/employees/zonaldirector"
    : "/employees/edu-directors";

  const DRAFT_STORAGE_KEY = `${employeeType
    .toLowerCase()
    .replace(/ /g, "_")}_form_draft_v2`;
  const LEAVE_WARNING_MESSAGE =
    `Saved ${employeeType} registration draft will be lost. Do you want to continue?`;

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
    currentStep > 1 || Object.keys(formData || {}).length > 0;

  const discardDraft = () => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    dispatch({ type: "CLEAR" });
  };

  const confirmDiscardAndRun = (onConfirm) => {
    if (!hasDraftData) {
      onConfirm();
      return;
    }

    const confirmed = window.confirm(LEAVE_WARNING_MESSAGE);
    if (!confirmed) return;

    discardDraft();
    onConfirm();
  };

  useEffect(() => {
    if (!hasDraftData) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleLinkNavigation = (event) => {
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

      const confirmed = window.confirm(LEAVE_WARNING_MESSAGE);
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      discardDraft();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkNavigation, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkNavigation, true);
    };
  }, [hasDraftData]);

  // Wait for state restoration from sessionStorage
  if (!isRestored) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Wrapper to handle both object and function updates (like React setState)
  const setFormData = (updateOrValue) => {
    dispatch({ type: "UPDATE_FORM_DATA", payload: updateOrValue });
  };

  // 🔹 Step 06 = Finishing
  const steps = [
    { id: 1, label: "Verification" },
    { id: 2, label: "Personal" },
    { id: 3, label: "Contact" },
    { id: 4, label: "First Appt" },
    { id: 5, label: "Current Appt" },
    { id: 6, label: "Finishing" },
  ];

  /* ===============================
     RESET REGISTRATION (NEW)
     =============================== */
  const resetRegistration = () => {
    dispatch({ type: "CLEAR" });
  };

  const handleStepClick = (stepId) => {
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
      toast.error("Please verify NIC before continuing.");
      return;
    }
    if (currentStep === 2 && !isPersonalValid) {
      toast.error("Compulsory fields should be completed.");
      return;
    }
    if (currentStep === 3 && !isContactValid) {
      toast.error("Compulsory fields should be completed.");
      return;
    }
    if (currentStep === 4 && !isFirstApptValid) {
      toast.error("Compulsory fields should be completed.");
      return;
    }
    if (currentStep === 5 && !isCurrentApptValid) {
      toast.error("Compulsory fields should be completed.");
      return;
    }

    // 🔹 FINAL SUBMISSION (Step 05 → Step 06)
    if (currentStep === 5) {
      try {
        setIsSubmitting(true);
        dispatch({ type: "SET_ERROR", payload: null });

        const dosPayload = {
          // Personal
          nic: formData.nic,
          is_new_registration: formData.is_new_registration,
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
          // Contact
          email: formData.email,
          contact: formData.contact,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          addressLine3: formData.addressLine3,
          postalCode: formData.postalCode,
          // First Appointment
          firstAppointmentDate: formData.firstAppointmentDate,
          firstAppointmentLetter: formData.firstAppointmentLetter,
          firstAppointmentService: formData.firstAppointmentService,
          firstAppointmentRank: formData.firstAppointmentRank,
          firstAppointmentOfficeLevel: formData.workingPlaceLevel,
          firstAppointmentWorkplace: formData.workingPlace,
          firstAppointmentPosition: formData.appointedPosition,
          recruitmentCategory: formData.recruitmentCategory,
          recruitmentSubject: formData.recruitmentSubject,
          // Current Appointment
          currentAppointmentDate: formData.currentAppointmentDate,
          currentAppointmentLetter: formData.currentAppointmentLetter,
          currentAppointmentRank: formData.currentAppointmentRank,
          currentAppointmentWorkplace: formData.currentAppointmentWorkingPlace,
          currentAppointmentPosition: formData.currentAppointmentPosition,
        };

        const result = await registerDosAdmin(dosPayload);

        if (result.status === "success") {
          toast.success(`${employeeType} registered successfully`);
          dispatch({ type: "SET_STEP", payload: 6 });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: result.message || `Failed to register ${employeeType}`,
          });
        }
      } catch (err) {
        console.error("Registration error:", err);
        const responseData = err.response?.data;
        if (responseData?.errors) {
          const errorMessages = Object.values(responseData.errors).flat();
          dispatch({
            type: "SET_ERROR",
            payload: errorMessages,
          });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: responseData?.message || "Unable to complete registration. Please try again.",
          });
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    dispatch({
      type: "SET_STEP",
      payload: Math.min(currentStep + 1, steps.length),
    });
  };

  const back = () => {
    if (currentStep === 6) return;

    const targetStep = Math.max(currentStep - 1, 1);
    if (targetStep === 1 && currentStep > 1) {
      confirmDiscardAndRun(() => {
        dispatch({ type: "SET_STEP", payload: 1 });
      });
      return;
    }

    dispatch({ type: "SET_STEP", payload: targetStep });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <Button
        onClick={() => {
          confirmDiscardAndRun(() => navigate(backPath));
        }}
        color="blue"
        className="mb-8 rounded-full px-6 py-2"
      >
        <HiArrowLeft /> Back To List
      </Button>
      <div className="border border-gray-200 overflow-hidden">
        {/* STEP HEADER */}
        <StepperHeader
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* STEP CONTENT */}
        <div className="p-6 lg:p-8">
          {currentStep === 1 && (
            <StepNICVerification
              formData={formData}
              setFormData={setFormData}
              onVerified={() =>
                dispatch({ type: "SET_NIC_VERIFIED", payload: true })
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

          {/* ================= STEP 06 – FINISHING ================= */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 w-8 h-8 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    Edu Director Registration Successful
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Registration has been completed successfully.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {formData.fullName}
                </p>
                <p>
                  <strong>NIC:</strong> {formData.nic}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Contact Number:</strong> {formData.contact}
                </p>
                <p>
                  <strong>Current Appointed Position:</strong>{" "}
                  {formData.currentAppointmentPositionLabel ||
                    formData.currentAppointmentPosition}
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  className="px-6 py-2 rounded-full bg-gray-600 text-white"
                  onClick={resetRegistration}
                >
                  New Registration
                </button>

                <button className="px-6 py-2 rounded-full bg-blue-600 text-white">
                  Download Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAVIGATION (HIDDEN FOR STEP 06) */}
        {currentStep !== 6 && (
          <div className="border-t">
            {error && (
              <div className="px-6 pt-4">
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">
                  {Array.isArray(error) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {error.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  ) : (
                    error
                  )}
                </div>
              </div>
            )}
            <StepNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onBack={back}
              onNext={next}
              isProcessing={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper Component - Provides context only for this page
export default function RegDos() {
  return (
    <TeacherFormProvider>
      <RegDosInner />
    </TeacherFormProvider>
  );
}
