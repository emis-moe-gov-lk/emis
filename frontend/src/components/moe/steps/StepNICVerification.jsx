/**
 * StepNICVerification - MOE Administrator NIC Verification Step
 * 
 * This component handles the verification of the National Identity Card (NIC) number
 * for MOE Administrator registration. It:
 * - Validates NIC format (supports both old 9-digit and new 12-digit formats)
 * - Checks if NIC exists in the system via API
 * - Pre-loads existing person data if found
 * - Initiates new registration flow if NIC is not found
 * 
 * NIC Validation Rules:
 * - Old format: 9 digits followed by V or X (e.g., 900000000V)
 * - New format: 12 digits (e.g., 900000000001)
 * - Day value must be between 1-866 (accounting for leap years)
 * - Must be issued within the last 100 years
 * 
 * API Integration:
 * - Endpoint: GET /teachers/check-nic/{nicNumber}
 * - Returns: existing person data or 404 if not found
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.formData - Current form data from context
 * @param {Function} props.setFormData - Updates form data in context
 * @param {Function} props.onVerified - Callback triggered after successful verification
 * @returns {JSX.Element} NIC verification form with validation feedback
 */
import { useState, useCallback } from "react";
import api from "@/api/axios";
import { Button, TextInput, Label, Alert } from "flowbite-react";
import { HiXCircle, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

/**
 * NIC validation patterns and constraints
 * Supports both old (9-digit with V/X) and new (12-digit) Sri Lankan NIC formats
 */
const NIC_VALIDATION = {
  OLD_FORMAT: /^[0-9]{9}[VX]$/,          // Legacy format: 900000000V
  NEW_FORMAT: /^[0-9]{12}$/,             // New format: 900000000001
  MIN_DAY: 1,                             // Minimum valid day of year
  MAX_DAY: 866,                           // Maximum valid day (accounting for leap years)
};

export default function StepNICVerification({
  formData,
  setFormData,
  onVerified,
}) {
  // Local NIC input value (separate from formData)
  const [nic, setNic] = useState(formData.nic || "");

  /**
   * Verification status states:
   * - null: initial state or user typing
   * - checking: API request in progress
   * - result: API responded (successful or error)
   * - invalid: client-side validation failed
   */
  const [status, setStatus] = useState(null);

  /**
   * Result tone indicates the type of result:
   * - green: NIC verified, new registration
   * - orange: NIC found, but needs appointment details
   * - red: NIC found with active appointment (conflict)
   * - null: invalid/error state
   */
  const [resultTone, setResultTone] = useState(null);

  // Message displayed to user based on verification result
  const [message, setMessage] = useState("");

  /**
   * Validates NIC format according to Sri Lankan standards
   * Checks both old and new formats, validates day value range
   * 
   * @param {string} value - NIC number to validate
   * @returns {boolean} True if NIC format is valid
   */
  const isValidSriLankaNIC = useCallback((value) => {
    const v = value.trim().toUpperCase();

    // Old format validation (9 digits + V/X)
    if (NIC_VALIDATION.OLD_FORMAT.test(v)) {
      const days = parseInt(v.substring(2, 5), 10);
      return days >= NIC_VALIDATION.MIN_DAY && days <= NIC_VALIDATION.MAX_DAY;
    }

    // New format validation (12 digits)
    if (NIC_VALIDATION.NEW_FORMAT.test(v)) {
      const days = parseInt(v.substring(4, 7), 10);
      return days >= NIC_VALIDATION.MIN_DAY && days <= NIC_VALIDATION.MAX_DAY;
    }

    return false;
  }, []);

  /**
   * Validates if NIC is within acceptable age range for NEMIS system
   * Administrators should be within 100 years of current date
   * 
   * @param {string} value - NIC number to validate
   * @returns {boolean} True if NIC's birth year is within acceptable range
   */
  const isAppropriateNICForNEMIS = useCallback((value) => {
    const v = value.trim().toUpperCase();
    const minYear = new Date().getFullYear() - 100;

    // Check new format (first 4 digits = birth year)
    if (NIC_VALIDATION.NEW_FORMAT.test(v)) {
      const firstFourDigits = parseInt(v.substring(0, 4), 10);
      return firstFourDigits > minYear;
    }

    // Check old format (first 2 digits = birth year, relative to century)
    if (NIC_VALIDATION.OLD_FORMAT.test(v)) {
      const thresholdTwoDigits = parseInt(String(minYear).slice(-2), 10);
      const firstTwoDigits = parseInt(v.substring(0, 2), 10);
      return firstTwoDigits > thresholdTwoDigits;
    }

    return false;
  }, []);

  /**
   * Verifies NIC via API and handles three outcomes:
   * 1. NIC exists with active appointment → Warning (red)
   * 2. NIC exists without active appointment → Load data (orange)
   * 3. NIC not found → New registration (green)
   * 
   * Also handles client-side validation errors
   */
  const verifyNIC = useCallback(async () => {
    const clean = nic.trim().toUpperCase();

    // ===== CLIENT-SIDE VALIDATION =====

    if (!clean) {
      setStatus("invalid");
      setResultTone(null);
      setMessage("NIC number is required");
      return;
    }

    if (!isValidSriLankaNIC(clean)) {
      setStatus("invalid");
      setResultTone(null);
      setMessage("Invalid NIC format");
      return;
    }

    if (!isAppropriateNICForNEMIS(clean)) {
      setStatus("invalid");
      setResultTone(null);
      setMessage("Inappropriate NIC for NEMIS system");
      return;
    }

    try {
      setStatus("checking");

      // ===== API VERIFICATION =====
      const res = await api.get(`/teachers/check-nic/${clean}`);
      const teacher = res.data?.data;
      const activeAppointment = !!res.data?.active_appointment;
      const nicAvailable = !!teacher;
      const workplaceInstitutionName =
        teacher?.current_appointment?.workplace?.institution?.name?.trim?.() ||
        teacher?.current_appointment?.workplace_id?.trim?.() ||
        teacher?.appointment?.workplace_id?.trim?.() ||
        "";

      // ===== NIC FOUND IN SYSTEM =====
      if (nicAvailable) {
        // Pre-populate form with existing person data
        setFormData((prev) => ({
          ...prev,
          nic: clean,
          is_new_registration: false,
          titleId: teacher.title_id ?? teacher.title?.title_id ?? "",
          fullName: teacher.full_name ?? "",
          dateOfBirth: teacher.date_of_birth ?? "",
          genderId: teacher.gender_id ?? teacher.gender?.gender_id ?? "",
          religionId:
            teacher.religion_id ?? teacher.religion?.religion_id ?? "",
          ethnicityId:
            teacher.ethnicity_id ?? teacher.ethnicity?.ethnicity_id ?? "",
          civilStatusId:
            teacher.civil_status_id ??
            teacher.civil_status?.civil_status_id ??
            "",
          bloodGroupId:
            teacher.blood_group_id ?? teacher.blood_group?.blood_group_id ?? "",
          healthCondition: teacher.health_condition ?? "",
          healthConditionDescription:
            teacher.health_condition_description ?? "",
          districtId:
            teacher.district_id ?? teacher.district?.district_id ?? "",
          gnDivisionId:
            teacher.gn_division_id ?? teacher.gn_division?.gn_division_id ?? "",
          dsOfficeId:
            teacher.ds_office_id ??
            teacher.gn_division?.divisional_secretariat_office?.dso_id ??
            "",
          addressLine1: teacher.address_line1 ?? "",
          addressLine2: teacher.address_line2 ?? "",
          addressLine3: teacher.address_line3 ?? "",
          postalCode: teacher.postal_code ?? "",
          latitude: teacher.latitude ?? null,
          longitude: teacher.longitude ?? null,
          tAddressLine1: teacher.t_address_line1 ?? "",
          tAddressLine2: teacher.t_address_line2 ?? "",
          tAddressLine3: teacher.t_address_line3 ?? "",
          email: teacher.email ?? "",
          contact: teacher.phone ?? "",
        }));

        setStatus("result");

        // Warn if the person already has an active appointment
        if (activeAppointment) {
          setResultTone("red");
          setMessage(
            `NIC Already Exists with Current Workplace: ${workplaceInstitutionName}`,
          );
          onVerified?.(false);
        } else {
          // Allow updating if no active appointment
          setResultTone("orange");
          setMessage(
            "NIC Found - Data Loaded. Please add appointment details.",
          );
          onVerified?.(true);
        }
        return;
      }

      // ===== NIC NOT FOUND - NEW REGISTRATION =====
      setFormData((prev) => ({
        ...prev,
        nic: clean,
        people_id: null,
        is_new_registration: true,
        // Clear all other fields for fresh registration
        titleId: "",
        fullName: "",
        dateOfBirth: "",
        genderId: "",
        religionId: "",
        ethnicityId: "",
        civilStatusId: "",
        bloodGroupId: "",
        healthCondition: "",
        healthConditionDescription: "",
        districtId: "",
        dsOfficeId: "",
        gnDivisionId: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        postalCode: "",
        latitude: null,
        longitude: null,
        tAddressLine1: "",
        tAddressLine2: "",
        tAddressLine3: "",
        email: "",
        contact: "",
      }));

      setStatus("result");
      setResultTone("green");
      setMessage("NIC Verified Successfully - Continue with new registration");
      onVerified?.(true);
    } catch (error) {
      console.error("NIC verification error:", error);
      setStatus("invalid");
      setResultTone(null);
      setMessage(
        error.response?.data?.message ||
          "Verification failed. Please try again.",
      );
    }
  }, [
    nic,
    isValidSriLankaNIC,
    isAppropriateNICForNEMIS,
    setFormData,
    onVerified,
  ]);

  /**
   * Resets status when user changes NIC input
   */
  const handleInputChange = useCallback((e) => {
    setNic(e.target.value);
    setStatus(null);
    setResultTone(null);
    setMessage("");
  }, []);

  /**
   * Handles form submission
   */
  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      verifyNIC();
    },
    [verifyNIC],
  );

  return (
    <div className="flex flex-col justify-center px-4 py-2">
      {/* Step title */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          01
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Identity Verification
        </h2>
      </div>

      <div className="w-full max-w-2xl">
        {/* Information banner */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-800">
            Before starting the registration, ensure that the National Identity
            Card (NIC) number already exists in the system. After confirming the
            correctness of the NIC you enter, proceed further.
          </p>
        </div>

        {/* NIC Input Form */}
        <form className="mb-4" onSubmit={handleFormSubmit}>
          <Label
            htmlFor="nic-input"
            value="NIC Number"
            className="mb-2 block text-sm font-semibold"
          />
          <div className="flex items-center gap-3">
            <TextInput
              id="nic-input"
              className="flex-1 [&_input]:bg-white dark:[&_input]:bg-gray-800"
              placeholder="Enter NIC number (e.g., 9908811970 or 990881197V)"
              value={nic}
              onChange={handleInputChange}
              disabled={status === "checking"}
              aria-label="NIC number input"
            />
            <Button
              type="submit"
              disabled={status === "checking" || !nic.trim()}
              className="rounded-full bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {status === "checking" ? "Verifying..." : "Verify"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Standard Sri Lanka NIC Formats: 9908811970 (12-digit) or 990881197V
            (9-digit+letter)
          </p>
        </form>

        {/* Status Messages */}
        {status === "checking" && (
          <Alert color="warning" icon={HiExclamationCircle} className="mt-6">
            <span className="font-medium">Verifying NIC number...</span>
          </Alert>
        )}

        {status === "result" && resultTone === "green" && (
          <Alert color="success" icon={HiCheckCircle} className="mt-6">
            <span className="font-medium">{message}</span>
          </Alert>
        )}

        {status === "result" && resultTone === "orange" && (
          <Alert color="warning" icon={HiExclamationCircle} className="mt-6">
            <span className="font-medium">{message}</span>
          </Alert>
        )}

        {status === "result" && resultTone === "red" && (
          <Alert color="failure" icon={HiXCircle} className="mt-6">
            <span className="font-medium">{message}</span>
          </Alert>
        )}

        {status === "invalid" && (
          <Alert color="failure" icon={HiXCircle} className="mt-6">
            <span className="font-medium">{message}</span>
          </Alert>
        )}
      </div>
    </div>
  );
}
