/**
 * StepNICVerification - Provincial DEO Officer NIC Verification Step
 */
import { useState, useCallback } from "react";
import api from "@/api/axios";
import { Button, TextInput, Label, Alert } from "flowbite-react";
import { HiXCircle, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

const NIC_VALIDATION = {
  OLD_FORMAT: /^[0-9]{9}[VX]$/,
  NEW_FORMAT: /^[0-9]{12}$/,
  MIN_DAY: 1,
  MAX_DAY: 866,
};

export default function StepNICVerification({
  formData,
  setFormData,
  onVerified,
}) {
  const [nic, setNic] = useState(formData.nic || "");
  const [status, setStatus] = useState(null);
  const [resultTone, setResultTone] = useState(null);
  const [message, setMessage] = useState("");

  const isValidSriLankaNIC = useCallback((value) => {
    const v = value.trim().toUpperCase();
    if (NIC_VALIDATION.OLD_FORMAT.test(v)) {
      const days = parseInt(v.substring(2, 5), 10);
      return days >= NIC_VALIDATION.MIN_DAY && days <= NIC_VALIDATION.MAX_DAY;
    }
    if (NIC_VALIDATION.NEW_FORMAT.test(v)) {
      const days = parseInt(v.substring(4, 7), 10);
      return days >= NIC_VALIDATION.MIN_DAY && days <= NIC_VALIDATION.MAX_DAY;
    }
    return false;
  }, []);

  const isAppropriateNICForNEMIS = useCallback((value) => {
    const v = value.trim().toUpperCase();
    const minYear = new Date().getFullYear() - 100;
    if (NIC_VALIDATION.NEW_FORMAT.test(v)) {
      const firstFourDigits = parseInt(v.substring(0, 4), 10);
      return firstFourDigits > minYear;
    }
    if (NIC_VALIDATION.OLD_FORMAT.test(v)) {
      const thresholdTwoDigits = parseInt(String(minYear).slice(-2), 10);
      const firstTwoDigits = parseInt(v.substring(0, 2), 10);
      return firstTwoDigits > thresholdTwoDigits;
    }
    return false;
  }, []);

  const verifyNIC = useCallback(async () => {
    const clean = nic.trim().toUpperCase();

    if (!clean) {
      setStatus("invalid");
      setResultTone(null);
      setMessage("NIC number is required");
      onVerified?.(false);
      return;
    }

    if (!isValidSriLankaNIC(clean)) {
      setStatus("invalid");
      setResultTone(null);
      setMessage("Invalid NIC format");
      onVerified?.(false);
      return;
    }

    if (!isAppropriateNICForNEMIS(clean)) {
      setStatus("invalid");
      setResultTone(null);
      setMessage("Inappropriate NIC for NEMIS system");
      onVerified?.(false);
      return;
    }

    try {
      setStatus("checking");
      const res = await api.get(`/teachers/check-nic/${clean}`);
      const teacher = res.data?.data;
      const activeAppointment = !!res.data?.active_appointment;
      const nicAvailable = !!teacher;
      const workplaceInstitutionName =
        teacher?.current_appointment?.workplace?.institution?.name?.trim?.() ||
        teacher?.current_appointment?.workplace_id?.trim?.() ||
        teacher?.appointment?.workplace_id?.trim?.() ||
        "";

      if (nicAvailable) {
        setFormData((prev) => ({
          ...prev,
          nic: clean,
          is_new_registration: false,
          titleId: teacher.title_id ?? teacher.title?.title_id ?? "",
          fullName: teacher.full_name ?? "",
          dateOfBirth: teacher.date_of_birth ?? "",
          genderId: teacher.gender_id ?? teacher.gender?.gender_id ?? "",
          religionId: teacher.religion_id ?? teacher.religion?.religion_id ?? "",
          ethnicityId: teacher.ethnicity_id ?? teacher.ethnicity?.ethnicity_id ?? "",
          civilStatusId: teacher.civil_status_id ?? teacher.civil_status?.civil_status_id ?? "",
          bloodGroupId: teacher.blood_group_id ?? teacher.blood_group?.blood_group_id ?? "",
          healthCondition: teacher.health_condition ?? "",
          healthConditionDescription: teacher.health_condition_description ?? "",
          districtId: teacher.district_id ?? teacher.district?.district_id ?? "",
          gnDivisionId: teacher.gn_division_id ?? teacher.gn_division?.gn_division_id ?? "",
          dsOfficeId: teacher.ds_office_id ?? teacher.gn_division?.divisional_secretariat_office?.dso_id ?? "",
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

        if (activeAppointment) {
          setResultTone("red");
          setMessage(`NIC Already Exists with Current Workplace: ${workplaceInstitutionName}`);
          onVerified?.(false);
        } else {
          setResultTone("orange");
          setMessage("NIC Found - Data Loaded. Please add appointment details.");
          onVerified?.(true);
        }
        return;
      }

      setFormData((prev) => ({
        ...prev,
        nic: clean,
        people_id: null,
        is_new_registration: true,
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
      setMessage(error.response?.data?.message || "Verification failed. Please try again.");
      onVerified?.(false);
    }
  }, [nic, isValidSriLankaNIC, isAppropriateNICForNEMIS, setFormData, onVerified]);

  const handleInputChange = useCallback((e) => {
    setNic(e.target.value);
    setStatus(null);
    setResultTone(null);
    setMessage("");
    onVerified?.(false);
  }, [onVerified]);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    verifyNIC();
  }, [verifyNIC]);

  return (
    <div className="flex flex-col justify-center px-4 py-2">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          01
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Identity Verification</h2>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-800">
            Before starting the registration, ensure that the National Identity Card (NIC) number already exists in the system. After confirming the correctness of the NIC you enter, proceed further.
          </p>
        </div>

        <form className="mb-4" onSubmit={handleFormSubmit}>
          <Label htmlFor="nic-input" value="NIC Number" className="mb-2 block text-sm font-semibold" />
          <div className="flex items-center gap-3">
            <TextInput
              id="nic-input"
              className="flex-1 [&_input]:bg-white dark:[&_input]:bg-gray-800"
              placeholder="Enter NIC number (e.g., 9908811970 or 990881197V)"
              value={nic}
              onChange={handleInputChange}
              disabled={status === "checking"}
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
            Standard Sri Lanka NIC Formats: 9908811970 (12-digit) or 990881197V (9-digit+letter)
          </p>
        </form>

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
