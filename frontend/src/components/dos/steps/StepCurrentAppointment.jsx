import { Label, Select, TextInput, Radio } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useState, useEffect, useCallback } from "react";
import api from "@/api/axios";

const FormGroup = ({ label, error, required = false, children }) => (
  <div>
    <Label className="mb-2 text-xs font-semibold text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </Label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const isSLTSService = (service) =>
  [service?.service_name, service?.name, service?.service_code, service?.code]
    .filter(Boolean)
    .some((value) => String(value).trim().toUpperCase() === "SLTS");

export default function StepCurrentAppointment({
  formData,
  setFormData,
  onValid,
}) {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [data, setData] = useState({
    services: [],
    ranks: [],
    subjects: [],
    zonalOffices: [],
    instCategories: [],
    institutions: [],
    positions: [],
  });

  const sltsServices = data.services.filter(isSLTSService);

  const isAllowedService = useCallback(
    (serviceId) =>
      sltsServices.some(
        (service) => String(service.service_id) === String(serviceId),
      ),
    [sltsServices],
  );

  // Fetch form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/register/appointment-form-data?service=${formData.currentAppointmentService || ""}&ins_cat=${formData.currentAppointmentInstCategory || ""}&zone=${formData.currentAppointmentZone || ""}`,
        );

        setData({
          services: res.data.service ?? [],
          ranks: res.data.serviceRanks ?? [],
          subjects: res.data.mainTeachingSubjects ?? [],
          zonalOffices: res.data.zonalEducationOffices ?? [],
          instCategories: res.data.institutionCategory ?? [],
          institutions: res.data.institutions ?? [],
          positions: res.data.positions ?? [],
        });
      } catch (error) {
        console.error("Failed to load current appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    formData.currentAppointmentService,
    formData.currentAppointmentInstCategory,
    formData.currentAppointmentZone,
  ]);

  // Validation
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.currentAppointmentRegType)
      newErrors.currentAppointmentRegType = "Required";
    if (!formData.currentAppointmentDate)
      newErrors.currentAppointmentDate = "Required";
    if (!formData.currentAppointmentLetter)
      newErrors.currentAppointmentLetter = "Required";

    if (!formData.currentAppointmentService) {
      newErrors.currentAppointmentService = "Required";
    } else if (!isAllowedService(formData.currentAppointmentService)) {
      newErrors.currentAppointmentService = "Only SLTS service can be selected";
    }

    if (!formData.currentAppointmentRank)
      newErrors.currentAppointmentRank = "Required";
    if (!formData.currentAppointmentSubject)
      newErrors.currentAppointmentSubject = "Required";
    if (!formData.currentAppointmentZone)
      newErrors.currentAppointmentZone = "Required";
    if (!formData.currentAppointmentInstCategory)
      newErrors.currentAppointmentInstCategory = "Required";
    if (!formData.currentAppointmentInstitution)
      newErrors.currentAppointmentInstitution = "Required";
    if (!formData.currentAppointmentPosition)
      newErrors.currentAppointmentPosition = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isAllowedService]);

  useEffect(() => {
    onValid?.(validate());
  }, [formData, validate, onValid]);

  // Set default registration type
  useEffect(() => {
    if (!formData.currentAppointmentRegType) {
      update("currentAppointmentRegType", "existing");
    }
  }, []);

  const update = useCallback(
    (key, value) => {
      setFormData((prev) => {
        const next = { ...prev, [key]: value };

        // Reset dependent fields
        if (key === "currentAppointmentService") {
          next.currentAppointmentRank = "";
        }
        if (
          key === "currentAppointmentZone" ||
          key === "currentAppointmentInstCategory"
        ) {
          next.currentAppointmentInstitution = "";
        }

        return next;
      });

      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [setFormData],
  );


  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="space-y-6 px-4 py-2">
      {/* Step Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          05
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Current Appointment Details
        </h2>
      </div>

      {/* Registration Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700">
          Select registration type for the Officer
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* New Officer - Disabled */}
          <label className="relative flex p-4 cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-50 transition-all">
            <div className="flex items-start gap-3">
              <Radio
                name="reg_type"
                value="new"
                disabled
                checked={formData.currentAppointmentRegType === "new"}
                onChange={(e) =>
                  update("currentAppointmentRegType", e.target.value)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-gray-400 dark:text-gray-500">
                  New Officer
                </span>
                <span className="block text-xs text-gray-400 mt-1">
                  Officer appointed for the first time.
                </span>
              </div>
            </div>
          </label>

          {/* Existing Officer */}
          <label
            className={`relative flex p-4 cursor-pointer rounded-2xl border transition-all ${
              formData.currentAppointmentRegType === "existing"
                ? "border-blue-600 bg-blue-50/10"
                : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 hover:border-blue-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <Radio
                name="reg_type"
                value="existing"
                checked={formData.currentAppointmentRegType === "existing"}
                onChange={(e) =>
                  update("currentAppointmentRegType", e.target.value)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Existing Officer
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Officer with prior service history.
                </span>
              </div>
            </div>
          </label>
        </div>

        {errors.currentAppointmentRegType && (
          <p className="text-xs text-red-600">
            {errors.currentAppointmentRegType}
          </p>
        )}
      </div>

      {/* Information Alert */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <HiInformationCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-blue-800 text-sm">
          <p className="font-medium leading-relaxed">
            Only for the registration of an officer with a period of service, if
            not appointed as a new officer.
          </p>
        </div>
      </div>

      {/* Appointment Date & Letter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormGroup
          label="Current Appointment Date"
          required
          error={errors.currentAppointmentDate}
        >
          <TextInput
            type="date"
            value={formData.currentAppointmentDate || ""}
            color={errors.currentAppointmentDate ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentDate", e.target.value)}
          />
        </FormGroup>

        <FormGroup
          label="Appointment/Transfer Letter No"
          required
          error={errors.currentAppointmentLetter}
        >
          <TextInput
            placeholder="Enter letter number"
            value={formData.currentAppointmentLetter || ""}
            color={errors.currentAppointmentLetter ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentLetter", e.target.value)}
          />
        </FormGroup>
      </div>

      {/* Service & Rank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormGroup
          label="Current Service"
          required
          error={errors.currentAppointmentService}
        >
          <Select
            value={formData.currentAppointmentService || ""}
            disabled={loading}
            color={errors.currentAppointmentService ? "failure" : "gray"}
            onChange={(e) =>
              update("currentAppointmentService", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {sltsServices.map((s) => (
              <option key={s.id} value={s.service_id}>
                {s.service_name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Current Service Rank"
          required
          error={errors.currentAppointmentRank}
        >
          <Select
            value={formData.currentAppointmentRank || ""}
            disabled={loading}
            color={errors.currentAppointmentRank ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentRank", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.ranks.map((r) => (
              <option key={r.id} value={r.rank_id}>
                {r.name || r.rank_name}
              </option>
            ))}
          </Select>
        </FormGroup>
      </div>

      {/* Teaching Subject */}
      <FormGroup
        label="Current Teaching Subject"
        required
        error={errors.currentAppointmentSubject}
      >
        <Select
          value={formData.currentAppointmentSubject || ""}
          disabled={loading}
          color={errors.currentAppointmentSubject ? "failure" : "gray"}
          onChange={(e) => update("currentAppointmentSubject", e.target.value)}
        >
          <option value="">{selectPlaceholder}</option>
          {data.subjects.map((s) => (
            <option key={s.id} value={s.subject_id}>
              {s.name_en}
            </option>
          ))}
        </Select>
      </FormGroup>

      {/* Zone & Institution Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormGroup
          label="Zonal Education Office"
          required
          error={errors.currentAppointmentZone}
        >
          <Select
            value={formData.currentAppointmentZone || ""}
            disabled={loading}
            color={errors.currentAppointmentZone ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentZone", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.zonalOffices.map((z) => (
              <option key={z.id} value={z.workplace_id}>
                {z.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Institution Category"
          required
          error={errors.currentAppointmentInstCategory}
        >
          <Select
            value={formData.currentAppointmentInstCategory || ""}
            disabled={loading}
            color={errors.currentAppointmentInstCategory ? "failure" : "gray"}
            onChange={(e) =>
              update("currentAppointmentInstCategory", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {data.instCategories.map((c) => (
              <option key={c.id} value={c.institution_category_id}>
                {c.institution_category_name || c.name}
              </option>
            ))}
          </Select>
        </FormGroup>
      </div>

      {/* Institution */}
      <FormGroup
        label="Current Appointment Institution"
        required
        error={errors.currentAppointmentInstitution}
      >
        <Select
          value={formData.currentAppointmentInstitution || ""}
          disabled={loading}
          color={errors.currentAppointmentInstitution ? "failure" : "gray"}
          onChange={(e) =>
            update("currentAppointmentInstitution", e.target.value)
          }
        >
          <option value="">{selectPlaceholder}</option>
          {data.institutions.map((i) => (
            <option key={i.id} value={i.workplace_id}>
              {i.census_no} - {i.name}
            </option>
          ))}
        </Select>
      </FormGroup>

      {/* Position */}
      <FormGroup
        label="Current Appointed Position"
        required
        error={errors.currentAppointmentPosition}
      >
        <Select
          value={formData.currentAppointmentPosition || ""}
          disabled={loading}
          color={errors.currentAppointmentPosition ? "failure" : "gray"}
          onChange={(e) => update("currentAppointmentPosition", e.target.value)}
        >
          <option value="">{selectPlaceholder}</option>
          {data.positions.map((p) => (
            <option key={p.id} value={p.position_id}>
              {p.position_name}
            </option>
          ))}
        </Select>
      </FormGroup>
    </div>
  );
}
