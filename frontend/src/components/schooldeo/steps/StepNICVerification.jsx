import { useState } from "react";
import api from "@/api/axios";
import { Button, TextInput, Label, Alert } from "flowbite-react";
import { HiXCircle, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

export default function StepNICVerification({
  formData,
  setFormData,
  onVerified,
  onVerificationReset,
  isVerified = false,
}) {
  const [nic, setNic] = useState(formData.nic || "");
  const [status, setStatus] = useState(null); // null | checking | result | invalid
  const [resultTone, setResultTone] = useState(null); // green | orange | red
  const [message, setMessage] = useState("");

  const isValidSriLankaNIC = (value) => {
    const v = value.trim().toUpperCase();

    if (/^[0-9]{9}[VX]$/.test(v)) {
      const days = parseInt(v.substring(2, 5), 10);
      return days >= 1 && days <= 866;
    }

    if (/^[0-9]{12}$/.test(v)) {
      const days = parseInt(v.substring(4, 7), 10);
      return days >= 1 && days <= 866;
    }

    return false;
  };

  const isAppropriateNICForNEMIS = (value) => {
    const v = value.trim().toUpperCase();
    const minYear = new Date().getFullYear() - 100;

    if (/^[0-9]{12}$/.test(v)) {
      const firstFourDigits = parseInt(v.substring(0, 4), 10);
      return firstFourDigits > minYear;
    }

    if (/^[0-9]{9}[VX]$/.test(v)) {
      const thresholdTwoDigits = parseInt(String(minYear).slice(-2), 10);
      const firstTwoDigits = parseInt(v.substring(0, 2), 10);
      return firstTwoDigits > thresholdTwoDigits;
    }

    return false;
  };

  const verifyNIC = async () => {
    const clean = nic.trim().toUpperCase();

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
      setMessage("In appropriate NIC for NEMIS system");
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
        if (activeAppointment) {
          setResultTone("red");
          setMessage(
            `NIC Already Exist and Current workplace is  - ${workplaceInstitutionName}`,
          );
          onVerificationReset?.();
        } else {
          setResultTone("orange");
          setMessage(
            "NIC Already available Data loaded, you add appointment details",
          );
          onVerified(); // Enable NEXT only when no active appointment exists
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

        addr1: "",
        addr2: "",
        addr3: "",
        postal: "",
        latitude: null,
        longitude: null,
        tempAddr1: "",
        tempAddr2: "",
        tempAddr3: "",

        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        postalCode: "",
        tAddressLine1: "",
        tAddressLine2: "",
        tAddressLine3: "",

        email: "",
        contact: "",
      }));

      setStatus("result");
      setResultTone("green");
      setMessage("Varification Sucess, NIC not found, You can continue");
      onVerified(); // Enable NEXT
    } catch (error) {
      console.error(error);
      setStatus("invalid");
      setResultTone(null);
      setMessage(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="flex flex-col justify-center px-4 py-2">
      {/* Title */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          01
        </div>
        <h2 className="text-lg font-semibold">
          Identity Verification
        </h2>
      </div>

      <div className="w-full max-w-xl">
        {/* NIC input + Verify button (INLINE — EXACT DESIGN) */}
        <form
          className="mb-2"
          onSubmit={(e) => {
            e.preventDefault();
            verifyNIC();
          }}
        >
          <Label value="NIC Number" className="mb-1 block" />
          <div className="flex items-center gap-4">
            <TextInput
              className="flex-1 [&_input]:bg-white dark:[&_input]:bg-gray-800"
              placeholder="Enter NIC number"
              value={nic}
              onChange={(e) => {
                const nextNic = e.target.value;
                const normalizedNextNic = nextNic.trim().toUpperCase();
                const normalizedVerifiedNic = (formData.nic || "").trim().toUpperCase();

                if (isVerified && normalizedNextNic !== normalizedVerifiedNic) {
                  onVerificationReset?.();
                }

                setNic(nextNic);
                setStatus(null);
                setResultTone(null);
                setMessage("");
              }}
            />
            <Button
              type="submit"
              className="rounded-full bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Verify
            </Button>
          </div>
          <p className="mt-1 text-sm text-gray-500">Standard SL NIC Formats</p>
        </form>

        {/* Status message (ONE at a time) */}
        {status === "checking" && (
          <Alert color="warning" icon={HiExclamationCircle} className="mt-6">
            Verifying NIC number...
          </Alert>
        )}

        {status === "result" && resultTone === "green" && (
          <Alert color="success" icon={HiCheckCircle} className="mt-6">
            {message}
          </Alert>
        )}

        {status === "result" && resultTone === "orange" && (
          <Alert color="warning" icon={HiExclamationCircle} className="mt-6">
            {message}
          </Alert>
        )}

        {status === "result" && resultTone === "red" && (
          <Alert color="failure" icon={HiXCircle} className="mt-6">
            {message}
          </Alert>
        )}

        {status === "invalid" && (
          <Alert color="failure" icon={HiXCircle} className="mt-6">
            {message}
          </Alert>
        )}
      </div>
    </div>
  );
}
