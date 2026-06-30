import { useState } from "react";
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

    // TODO: Implement NIC verification for Admin.
    // For now, simulate success.
    setStatus("result");
    setResultTone("green");
    setMessage("Verification Success, NIC not found, You can continue");
    setFormData((prev) => ({
      ...prev,
      nic: clean,
      people_id: null,
      is_new_registration: true,
    }));
    onVerified();
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
        {/* NIC input + Verify button */}
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

        {/* Status message */}
        {status === "result" && resultTone === "green" && (
          <Alert color="success" icon={HiCheckCircle} className="mt-6">
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
