import { useState, useEffect, useCallback } from "react";
import { Label, Select, TextInput } from "flowbite-react";
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

export default function StepFirstAppointment({
  formData,
  setFormData,
  onValid,
}) {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [data, setData] = useState({
    categories: [],
    types: [],
    subjects: [],
    mediums: [],
    services: [],
    ranks: [],
    teachingSubjects: [],
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
          `/teachers/appointment-form-data?service=${formData.firstAppointmentService || ""}&ins_cat=${formData.firstAppointmentInstCategory || ""}&zone=${formData.firstAppointmentZone || ""}`,
        );

        setData({
          categories: res.data.teacherCategorys ?? [],
          types: res.data.teacherTypes ?? [],
          subjects: res.data.apointmentSubjects ?? [],
          mediums: res.data.appointmentMedium ?? [],
          services: res.data.service ?? [],
          ranks: res.data.serviceRanks ?? [],
          teachingSubjects: res.data.mainTeachingSubjects ?? [],
          zonalOffices: res.data.zonalEducationOffices ?? [],
          instCategories: res.data.institutionCategory ?? [],
          institutions: res.data.institutions ?? [],
          positions: res.data.positions ?? [],
        });
      } catch (error) {
        console.error("Failed to load appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    formData.firstAppointmentService,
    formData.firstAppointmentInstCategory,
    formData.firstAppointmentZone,
  ]);

  // Validation
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.firstAppointmentCategory)
      newErrors.firstAppointmentCategory = "Required";
    if (!formData.firstAppointmentDate)
      newErrors.firstAppointmentDate = "Required";
    if (!formData.firstAppointmentLetter)
      newErrors.firstAppointmentLetter = "Required";

    if (!formData.firstAppointmentService) {
      newErrors.firstAppointmentService = "Required";
    } else if (!isAllowedService(formData.firstAppointmentService)) {
      newErrors.firstAppointmentService = "Only SLTS service can be selected";
    }

    if (!formData.firstAppointmentRank)
      newErrors.firstAppointmentRank = "Required";
    if (!formData.firstAppointmentType)
      newErrors.firstAppointmentType = "Required";
    if (!formData.firstAppointmentSubject)
      newErrors.firstAppointmentSubject = "Required";
    if (!formData.firstAppointmentMedium)
      newErrors.firstAppointmentMedium = "Required";
    if (!formData.firstAppointmentTeachingSubject)
      newErrors.firstAppointmentTeachingSubject = "Required";
    if (!formData.firstAppointmentZone)
      newErrors.firstAppointmentZone = "Required";
    if (!formData.firstAppointmentInstCategory)
      newErrors.firstAppointmentInstCategory = "Required";
    if (!formData.firstAppointmentInstitution)
      newErrors.firstAppointmentInstitution = "Required";
    if (!formData.firstAppointmentPosition)
      newErrors.firstAppointmentPosition = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isAllowedService]);

  useEffect(() => {
    onValid?.(validate());
  }, [formData, validate, onValid]);

  const update = useCallback(
    (key, value) => {
      setFormData((prev) => {
        const next = { ...prev, [key]: value };

        // Reset dependent fields
        if (key === "firstAppointmentService") {
          next.firstAppointmentRank = "";
        }
        if (
          key === "firstAppointmentZone" ||
          key === "firstAppointmentInstCategory"
        ) {
          next.firstAppointmentInstitution = "";
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
          04
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          First Appointment Details
        </h2>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormGroup
          label="Teacher Appointment Category"
          required
          error={errors.firstAppointmentCategory}
        >
          <Select
            value={formData.firstAppointmentCategory || ""}
            disabled={loading}
            color={errors.firstAppointmentCategory ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentCategory", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.categories_id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Types of Teachers"
          required
          error={errors.firstAppointmentType}
        >
          <Select
            value={formData.firstAppointmentType || ""}
            disabled={loading}
            color={errors.firstAppointmentType ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentType", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.types.map((t) => (
              <option key={t.id} value={t.teacher_types_id}>
                {t.type_name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Appointment Letter No"
          required
          error={errors.firstAppointmentLetter}
        >
          <TextInput
            value={formData.firstAppointmentLetter || ""}
            color={errors.firstAppointmentLetter ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentLetter", e.target.value)}
            placeholder="Enter letter number"
          />
        </FormGroup>

        <FormGroup
          label="First Appointment Date"
          required
          error={errors.firstAppointmentDate}
        >
          <TextInput
            type="date"
            value={formData.firstAppointmentDate || ""}
            color={errors.firstAppointmentDate ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentDate", e.target.value)}
          />
        </FormGroup>

        <FormGroup
          label="Service"
          required
          error={errors.firstAppointmentService}
        >
          <Select
            value={formData.firstAppointmentService || ""}
            disabled={loading}
            color={errors.firstAppointmentService ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentService", e.target.value)}
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
          label="Service Rank"
          required
          error={errors.firstAppointmentRank}
        >
          <Select
            value={formData.firstAppointmentRank || ""}
            disabled={loading}
            color={errors.firstAppointmentRank ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentRank", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.ranks.map((r) => (
              <option key={r.id} value={r.rank_id}>
                {r.name || r.rank_name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Appointment Subject"
          required
          error={errors.firstAppointmentSubject}
        >
          <Select
            value={formData.firstAppointmentSubject || ""}
            disabled={loading}
            color={errors.firstAppointmentSubject ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentSubject", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.subjects.map((s) => (
              <option key={s.id} value={s.a_subject_id}>
                {s.name_en}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Appointment Medium"
          required
          error={errors.firstAppointmentMedium}
        >
          <Select
            value={formData.firstAppointmentMedium || ""}
            disabled={loading}
            color={errors.firstAppointmentMedium ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentMedium", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.mediums.map((m) => (
              <option key={m.id} value={m.medium_id}>
                {m.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Main Teaching Subject"
          required
          error={errors.firstAppointmentTeachingSubject}
        >
          <Select
            value={formData.firstAppointmentTeachingSubject || ""}
            disabled={loading}
            color={errors.firstAppointmentTeachingSubject ? "failure" : "gray"}
            onChange={(e) =>
              update("firstAppointmentTeachingSubject", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {data.teachingSubjects.map((s) => (
              <option key={s.id} value={s.subject_id}>
                {s.name_en}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Secondary Teaching Subject">
          <Select
            value={formData.firstAppointmentSecondarySubject || ""}
            disabled={loading}
            onChange={(e) =>
              update("firstAppointmentSecondarySubject", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {data.teachingSubjects.map((s) => (
              <option key={s.id} value={s.subject_id}>
                {s.name_en}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="Institution Category"
          required
          error={errors.firstAppointmentInstCategory}
        >
          <Select
            value={formData.firstAppointmentInstCategory || ""}
            disabled={loading}
            color={errors.firstAppointmentInstCategory ? "failure" : "gray"}
            onChange={(e) =>
              update("firstAppointmentInstCategory", e.target.value)
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

        <FormGroup
          label="Zonal Education Office"
          required
          error={errors.firstAppointmentZone}
        >
          <Select
            value={formData.firstAppointmentZone || ""}
            disabled={loading}
            color={errors.firstAppointmentZone ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentZone", e.target.value)}
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
          label="First Appointment Institution"
          required
          error={errors.firstAppointmentInstitution}
        >
          <Select
            value={formData.firstAppointmentInstitution || ""}
            disabled={loading}
            color={errors.firstAppointmentInstitution ? "failure" : "gray"}
            onChange={(e) =>
              update("firstAppointmentInstitution", e.target.value)
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

        <FormGroup
          label="Appointed Position"
          required
          error={errors.firstAppointmentPosition}
        >
          <Select
            value={formData.firstAppointmentPosition || ""}
            disabled={loading}
            color={errors.firstAppointmentPosition ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentPosition", e.target.value)}
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
    </div>
  );
}
