import { useEffect, useState } from "react";
import { Label, TextInput } from "flowbite-react";

export default function StepContactDetails({ formData, setFormData, onValid }) {

  const PHONE_REGEX = /^0\d{9}$/;
  const SL_POSTAL_CODE_REGEX = /^\d{5}$/;
  const COORDINATE_REGEX = /^\d{1,3}(\.\d{1,6})?$/;
  const SRI_LANKA_LAT_MIN = 5.9;
  const SRI_LANKA_LAT_MAX = 9.9;
  const SRI_LANKA_LNG_MIN = 79.5;
  const SRI_LANKA_LNG_MAX = 81.9;

  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const newErrors = {};

    // Contact Validation
    if (!formData.contact) {
      newErrors.contact = "Contact number is required";
    } else if (!PHONE_REGEX.test(formData.contact)) {
      newErrors.contact =
        "Invalid contact number (must be 10 digits and start with 0)";
    }

    // Email Validation
    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Permanent Address Validation
    if (!formData.addressLine1)
      newErrors.addressLine1 = "Address Line 1 is required";
    if (!formData.addressLine2)
      newErrors.addressLine2 = "Address Line 2 is required";
    if (!formData.postalCode) {
      newErrors.postalCode = "Postal code is required";
    } else if (!SL_POSTAL_CODE_REGEX.test(formData.postalCode)) {
      newErrors.postalCode = "Postal code must be 5 digits (Sri Lanka format)";
    }

    if (
      formData.tPostalCode &&
      !SL_POSTAL_CODE_REGEX.test(formData.tPostalCode)
    ) {
      newErrors.tPostalCode =
        "Temporary postal code must be 5 digits (Sri Lanka format)";
    }

    // Optional coordinates: validate only when entered
    if (formData.latitude) {
      const lat = formData.latitude.trim();
      const latNum = Number(lat);
      if (!COORDINATE_REGEX.test(lat)) {
        newErrors.latitude =
          "Latitude must be decimal format (e.g., 6.9271)";
      } else if (
        Number.isNaN(latNum) ||
        latNum < SRI_LANKA_LAT_MIN ||
        latNum > SRI_LANKA_LAT_MAX
      ) {
        newErrors.latitude =
          "Latitude must be within Sri Lanka range (5.9 to 9.9)";
      }
    }

    if (formData.longitude) {
      const lng = formData.longitude.trim();
      const lngNum = Number(lng);
      if (!COORDINATE_REGEX.test(lng)) {
        newErrors.longitude =
          "Longitude must be decimal format (e.g., 79.8612)";
      } else if (
        Number.isNaN(lngNum) ||
        lngNum < SRI_LANKA_LNG_MIN ||
        lngNum > SRI_LANKA_LNG_MAX
      ) {
        newErrors.longitude =
          "Longitude must be within Sri Lanka range (79.5 to 81.9)";
      }
    }

    setErrors(newErrors);
    onValid?.(Object.keys(newErrors).length === 0);
  }, [formData, onValid]);

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-4xl rounded-2xl px-6 py-0 space-y-2 [&_input]:bg-white [&_select]:bg-white [&_textarea]:bg-white [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700">
        {/* Step Title */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            03
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Contact Details
          </h2>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Label>Email</Label>
            <TextInput
              placeholder="example@email.com"
              value={formData.email || ""}
              onChange={(e) => update("email", e.target.value)}
              color={errors.email ? "failure" : "gray"}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <Label>Phone Number</Label>
            <TextInput
              placeholder="07XXXXXXXX"
              value={formData.contact || ""}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) =>
                update("contact", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              color={errors.contact ? "failure" : "gray"}
            />
            {errors.contact && (
              <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
            )}
          </div>
        </div>

        {/* Permanent Address */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Permanent Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <Label>Address Line 01</Label>
              <TextInput
                value={formData.addressLine1 || ""}
                onChange={(e) => update("addressLine1", e.target.value)}
                color={errors.addressLine1 ? "failure" : "gray"}
              />
            </div>

            <div>
              <Label>Address Line 02</Label>
              <TextInput
                value={formData.addressLine2 || ""}
                onChange={(e) => update("addressLine2", e.target.value)}
                color={errors.addressLine2 ? "failure" : "gray"}
              />
            </div>

            <div>
              <Label>Address Line 03 (Optional)</Label>
              <TextInput
                value={formData.addressLine3 || ""}
                onChange={(e) => update("addressLine3", e.target.value)}
              />
            </div>

            <div>
              <Label>Postal Code</Label>
              <TextInput
                value={formData.postalCode || ""}
                inputMode="numeric"
                maxLength={5}
                onChange={(e) =>
                  update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                color={errors.postalCode ? "failure" : "gray"}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>

            <div>
              <Label>Latitude (Optional)</Label>
              <TextInput
                value={formData.latitude || ""}
                onChange={(e) => update("latitude", e.target.value)}
                inputMode="decimal"
                color={errors.latitude ? "failure" : "gray"}
              />
              {errors.latitude && (
                <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
              )}
            </div>

            <div>
              <Label>Longitude (Optional)</Label>
              <TextInput
                value={formData.longitude || ""}
                onChange={(e) => update("longitude", e.target.value)}
                inputMode="decimal"
                color={errors.longitude ? "failure" : "gray"}
              />
              {errors.longitude && (
                <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
              )}
            </div>
          </div>
        </div>

        {/* Temporary Address */}
        <div className="bg-gray-50 p-6 rounded-2xl border space-y-2">
          <h3 className="font-semibold text-gray-800">
            Temporary Address{" "}
            <span className="text-sm text-gray-500 font-normal">
              (If different from permanent address)
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <Label>Address Line 01</Label>
              <TextInput
                value={formData.tAddressLine1 || ""}
                onChange={(e) => update("tAddressLine1", e.target.value)}
              />
            </div>

            <div>
              <Label>Address Line 02</Label>
              <TextInput
                value={formData.tAddressLine2 || ""}
                onChange={(e) => update("tAddressLine2", e.target.value)}
              />
            </div>

            <div>
              <Label>Address Line 03 (Optional)</Label>
              <TextInput
                value={formData.tAddressLine3 || ""}
                onChange={(e) => update("tAddressLine3", e.target.value)}
              />
            </div>

            <div>
              <Label>Postal Code</Label>
              <TextInput
                value={formData.tPostalCode || ""}
                inputMode="numeric"
                maxLength={5}
                onChange={(e) =>
                  update("tPostalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                color={errors.tPostalCode ? "failure" : "gray"}
              />
              {errors.tPostalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.tPostalCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
