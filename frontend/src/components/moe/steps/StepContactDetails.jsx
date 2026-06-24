import { useEffect, useState, useCallback } from "react";
import { Label, TextInput } from "flowbite-react";

const VALIDATION_PATTERNS = {
  PHONE: /^0\d{9}$/,
  POSTAL_CODE: /^\d{5}$/,
  COORDINATE: /^\d{1,3}(\.\d{1,6})?$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
};

const SRI_LANKA_BOUNDS = {
  LAT_MIN: 5.9,
  LAT_MAX: 9.9,
  LNG_MIN: 79.5,
  LNG_MAX: 81.9,
};

const FormGroup = ({ label, error, required = false, children }) => (
  <div>
    <Label className="mb-2 text-xs font-semibold text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </Label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default function StepContactDetails({ formData, setFormData, onValid }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const getFieldError = (key) => (touched[key] ? errors[key] : undefined);
  const getFieldColor = (key) => (touched[key] && errors[key] ? "failure" : "gray");

  // Mark existing fields as touched on mount so pre-loaded data behaves correctly
  useEffect(() => {
    const initialTouched = {};
    Object.keys(formData || {}).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== undefined && formData[key] !== null) {
        initialTouched[key] = true;
      }
    });
    setTouched(initialTouched);
  }, []);

  const update = useCallback(
    (key, value) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
      setTouched((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [setFormData],
  );

  const validateContactDetails = useCallback(() => {
    const newErrors = {};

    // Contact Validation
    if (!formData.contact) {
      newErrors.contact = "Contact number is required";
    } else if (!VALIDATION_PATTERNS.PHONE.test(formData.contact)) {
      newErrors.contact =
        "Invalid contact number (must be 10 digits starting with 0)";
    }

    // Email Validation
    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!VALIDATION_PATTERNS.EMAIL.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Permanent Address Validation
    if (!formData.addressLine1) {
      newErrors.addressLine1 = "Address Line 1 is required";
    }

    if (!formData.addressLine2) {
      newErrors.addressLine2 = "Address Line 2 is required";
    }

    if (!formData.postalCode) {
      newErrors.postalCode = "Postal code is required";
    } else if (!VALIDATION_PATTERNS.POSTAL_CODE.test(formData.postalCode)) {
      newErrors.postalCode = "Postal code must be 5 digits";
    }

    // Optional temporary postal code validation
    if (
      formData.tPostalCode &&
      !VALIDATION_PATTERNS.POSTAL_CODE.test(formData.tPostalCode)
    ) {
      newErrors.tPostalCode = "Postal code must be 5 digits";
    }

    // Optional coordinates validation
    if (formData.latitude?.trim()) {
      const lat = formData.latitude.trim();
      const latNum = Number(lat);
      if (!VALIDATION_PATTERNS.COORDINATE.test(lat)) {
        newErrors.latitude = "Latitude must be decimal format (e.g., 6.9271)";
      } else if (
        Number.isNaN(latNum) ||
        latNum < SRI_LANKA_BOUNDS.LAT_MIN ||
        latNum > SRI_LANKA_BOUNDS.LAT_MAX
      ) {
        newErrors.latitude =
          "Latitude must be within Sri Lanka range (5.9 to 9.9)";
      }
    }

    if (formData.longitude?.trim()) {
      const lng = formData.longitude.trim();
      const lngNum = Number(lng);
      if (!VALIDATION_PATTERNS.COORDINATE.test(lng)) {
        newErrors.longitude =
          "Longitude must be decimal format (e.g., 79.8612)";
      } else if (
        Number.isNaN(lngNum) ||
        lngNum < SRI_LANKA_BOUNDS.LNG_MIN ||
        lngNum > SRI_LANKA_BOUNDS.LNG_MAX
      ) {
        newErrors.longitude =
          "Longitude must be within Sri Lanka range (79.5 to 81.9)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  useEffect(() => {
    onValid?.(validateContactDetails());
  }, [formData, validateContactDetails, onValid]);

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-4xl space-y-6">
        {/* Step Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            03
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Contact Details
          </h2>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Email" required error={getFieldError("email")}>
            <TextInput
              type="email"
              placeholder="example@email.com"
              value={formData.email || ""}
              onChange={(e) => update("email", e.target.value)}
              color={getFieldColor("email")}
            />
          </FormGroup>

          <FormGroup label="Phone Number" required error={getFieldError("contact")}>
            <TextInput
              type="tel"
              placeholder="07XXXXXXXX"
              value={formData.contact || ""}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) =>
                update(
                  "contact",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              color={getFieldColor("contact")}
            />
          </FormGroup>
        </div>

        {/* Permanent Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Permanent Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup
              label="Address Line 1"
              required
              error={getFieldError("addressLine1")}
            >
              <TextInput
                value={formData.addressLine1 || ""}
                onChange={(e) => update("addressLine1", e.target.value)}
                color={getFieldColor("addressLine1")}
                placeholder="Street address"
              />
            </FormGroup>

            <FormGroup
              label="Address Line 2"
              required
              error={getFieldError("addressLine2")}
            >
              <TextInput
                value={formData.addressLine2 || ""}
                onChange={(e) => update("addressLine2", e.target.value)}
                color={getFieldColor("addressLine2")}
                placeholder="City/Town"
              />
            </FormGroup>

            <FormGroup label="Address Line 3 (Optional)">
              <TextInput
                value={formData.addressLine3 || ""}
                onChange={(e) => update("addressLine3", e.target.value)}
                placeholder="Additional details"
              />
            </FormGroup>

            <FormGroup label="Postal Code" required error={getFieldError("postalCode")}>
              <TextInput
                value={formData.postalCode || ""}
                inputMode="numeric"
                maxLength={5}
                onChange={(e) =>
                  update(
                    "postalCode",
                    e.target.value.replace(/\D/g, "").slice(0, 5),
                  )
                }
                color={getFieldColor("postalCode")}
                placeholder="5-digit code"
              />
            </FormGroup>

            <FormGroup label="Latitude (Optional)" error={getFieldError("latitude")}>
              <TextInput
                value={formData.latitude || ""}
                onChange={(e) => update("latitude", e.target.value)}
                inputMode="decimal"
                color={getFieldColor("latitude")}
                placeholder="e.g., 6.9271"
              />
            </FormGroup>

            <FormGroup label="Longitude (Optional)" error={getFieldError("longitude")}>
              <TextInput
                value={formData.longitude || ""}
                onChange={(e) => update("longitude", e.target.value)}
                inputMode="decimal"
                color={getFieldColor("longitude")}
                placeholder="e.g., 79.8612"
              />
            </FormGroup>
          </div>
        </div>

        {/* Temporary Address */}
        <div className="space-y-4 p-6 rounded-2xl border border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Temporary Address
            <span className="text-sm font-normal text-gray-600 ml-2">
              (If different from permanent address)
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Address Line 1">
              <TextInput
                value={formData.tAddressLine1 || ""}
                onChange={(e) => update("tAddressLine1", e.target.value)}
                placeholder="Street address"
              />
            </FormGroup>

            <FormGroup label="Address Line 2">
              <TextInput
                value={formData.tAddressLine2 || ""}
                onChange={(e) => update("tAddressLine2", e.target.value)}
                placeholder="City/Town"
              />
            </FormGroup>

            <FormGroup label="Address Line 3 (Optional)">
              <TextInput
                value={formData.tAddressLine3 || ""}
                onChange={(e) => update("tAddressLine3", e.target.value)}
                placeholder="Additional details"
              />
            </FormGroup>

            <FormGroup label="Postal Code" error={getFieldError("tPostalCode")}>
              <TextInput
                value={formData.tPostalCode || ""}
                inputMode="numeric"
                maxLength={5}
                onChange={(e) =>
                  update(
                    "tPostalCode",
                    e.target.value.replace(/\D/g, "").slice(0, 5),
                  )
                }
                color={getFieldColor("tPostalCode")}
                placeholder="5-digit code"
              />
            </FormGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
