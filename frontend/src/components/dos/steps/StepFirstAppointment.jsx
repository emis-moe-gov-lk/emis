import { useState, useEffect } from "react";
import { Label, Select, TextInput } from "flowbite-react";
import api from "@/api/axios";

export default function StepFirstAppointment({
  formData,
  setFormData,
  onValid,
}) {
  const isSLTSService = (service) =>
    [service?.service_name, service?.name, service?.service_code, service?.code]
      .filter(Boolean)
      .some((value) => String(value).trim().toUpperCase() === "SLTS");

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [firstAppointmentCategories, setFirstAppointmentCategories] = useState([]);
  const [firstAppointmentTypes, setFirstAppointmentTypes] = useState([]);
  const [firstAppointmentSubjects, setFirstAppointmentSubjects] = useState([]);
  const [firstAppointmentMediums, setFirstAppointmentMediums] = useState([]);
  const [firstAppointmentServices, setFirstAppointmentServices] = useState([]);
  const [firstAppointmentRanks, setFirstAppointmentRanks] = useState([]);
  const [firstAppointmentTeachingSubjects, setFirstAppointmentTeachingSubjects] = useState([]);
  const [firstAppointmentZonalOffices, setFirstAppointmentZonalOffices] = useState([]);
  const [firstAppointmentInstCategories, setFirstAppointmentInstCategories] = useState([]);
  const [firstAppointmentInstitutions, setFirstAppointmentInstitutions] = useState([]);
  const [firstAppointmentPositions, setFirstAppointmentPositions] = useState([]);
  const sltsFirstAppointmentServices = firstAppointmentServices.filter(isSLTSService);
  const isAllowedFirstAppointmentService = (serviceId) =>
    sltsFirstAppointmentServices.some(
      (service) => String(service.service_id) === String(serviceId),
    );

  /* -------------------- FETCH DATA (UNCHANGED) -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/teachers/appointment-form-data?service=${formData.firstAppointmentService}&ins_cat=${formData.firstAppointmentInstCategory}&zone=${formData.firstAppointmentZone}`,
        );

        const data = res.data;

        setFirstAppointmentCategories(data.teacherCategorys ?? []);
        setFirstAppointmentTypes(data.teacherTypes ?? []);
        setFirstAppointmentSubjects(data.apointmentSubjects ?? []);
        setFirstAppointmentMediums(data.appointmentMedium ?? []);
        setFirstAppointmentServices(data.service ?? []);
        setFirstAppointmentRanks(data.serviceRanks ?? []);
        setFirstAppointmentTeachingSubjects(data.mainTeachingSubjects ?? []);
        setFirstAppointmentZonalOffices(data.zonalEducationOffices ?? []);
        setFirstAppointmentInstCategories(data.institutionCategory ?? []);
        setFirstAppointmentInstitutions(data.institutions ?? []);
        setFirstAppointmentPositions(data.positions ?? []);
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

  /* -------------------- VALIDATION (UNCHANGED) -------------------- */
  const validate = () => {
    const e = {};
    if (!formData.firstAppointmentCategory) e.firstAppointmentCategory = "Required";
    if (!formData.firstAppointmentDate) e.firstAppointmentDate = "Required";
    if (!formData.firstAppointmentLetter) e.firstAppointmentLetter = "Required";
    if (!formData.firstAppointmentService) {
      e.firstAppointmentService = "Required";
    } else if (!isAllowedFirstAppointmentService(formData.firstAppointmentService)) {
      e.firstAppointmentService = "Only SLTS service can be selected";
    }
    if (!formData.firstAppointmentRank) e.firstAppointmentRank = "Required";
    if (!formData.firstAppointmentType) e.firstAppointmentType = "Required";
    if (!formData.firstAppointmentSubject) e.firstAppointmentSubject = "Required";
    if (!formData.firstAppointmentMedium) e.firstAppointmentMedium = "Required";
    if (!formData.firstAppointmentTeachingSubject) e.firstAppointmentTeachingSubject = "Required";
    if (!formData.firstAppointmentZone) e.firstAppointmentZone = "Required";
    if (!formData.firstAppointmentInstCategory) e.firstAppointmentInstCategory = "Required";
    if (!formData.firstAppointmentInstitution) e.firstAppointmentInstitution = "Required";
    if (!formData.firstAppointmentPosition) e.firstAppointmentPosition = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
  }, [formData]);

  const renderError = (key) =>
    errors[key] ? <p className="mt-1 text-xs text-red-600">{errors[key]}</p> : null;

  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "firstAppointmentService") {
        next.firstAppointmentRank = "";
      }
      if (key === "firstAppointmentZone" || key === "firstAppointmentInstCategory") {
        next.firstAppointmentInstitution = "";
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-4xl rounded-2xl px-6 py-0 space-y-2 [&_input]:bg-white [&_select]:bg-white [&_textarea]:bg-white [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700">

        {/* STEP TITLE */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            04
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            First Appointment Details
          </h2>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">

          {/* Teacher Appointment Category */}
          <div>
            <Label>Teacher Appointment Category</Label>
            <Select
              value={formData.firstAppointmentCategory || ""}
              disabled={loading}
              color={errors.firstAppointmentCategory ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentCategory", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentCategories.map((c) => (
                <option key={c.id} value={c.categories_id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentCategory")}
          </div>

          {/* Types of Teachers */}
          <div>
            <Label>Types of Teachers</Label>
            <Select
              value={formData.firstAppointmentType || ""}
              disabled={loading}
              color={errors.firstAppointmentType ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentType", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentTypes.map((t) => (
                <option key={t.id} value={t.teacher_types_id}>
                  {t.type_name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentType")}
          </div>

          {/* Appointment Letter */}
          <div>
            <Label>Appointment Letter No</Label>
            <TextInput
              value={formData.firstAppointmentLetter || ""}
              color={errors.firstAppointmentLetter ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentLetter", e.target.value)}
            />
            {renderError("firstAppointmentLetter")}
          </div>

          {/* Appointment Date */}
          <div>
            <Label>First Appointment Date</Label>
            <TextInput
              type="date"
              value={formData.firstAppointmentDate || ""}
              color={errors.firstAppointmentDate ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentDate", e.target.value)}
            />
            {renderError("firstAppointmentDate")}
          </div>

          {/* Service */}
          <div>
            <Label>Service</Label>
            <Select
              value={formData.firstAppointmentService || ""}
              disabled={loading}
              color={errors.firstAppointmentService ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentService", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {sltsFirstAppointmentServices.map((s) => (
                <option key={s.id} value={s.service_id}>
                  {s.service_name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentService")}
          </div>

          {/* Service Rank */}
          <div>
            <Label>Service Rank</Label>
            <Select
              value={formData.firstAppointmentRank || ""}
              disabled={loading}
              color={errors.firstAppointmentRank ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentRank", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentRanks.map((r) => (
                <option key={r.id} value={r.rank_id}>
                  {r.name || r.rank_name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentRank")}
          </div>

          {/* Appointment Subject */}
          <div>
            <Label>Appointment Subject</Label>
            <Select
              value={formData.firstAppointmentSubject || ""}
              disabled={loading}
              color={errors.firstAppointmentSubject ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentSubject", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentSubjects.map((s) => (
                <option key={s.id} value={s.a_subject_id}>
                  {s.name_en}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentSubject")}
          </div>

          {/* Appointment Medium */}
          <div>
            <Label>Appointment Medium</Label>
            <Select
              value={formData.firstAppointmentMedium || ""}
              disabled={loading}
              color={errors.firstAppointmentMedium ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentMedium", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentMediums.map((m) => (
                <option key={m.id} value={m.medium_id}>
                  {m.name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentMedium")}
          </div>

          {/* Main Teaching Subject */}
          <div>
            <Label>Main Teaching Subject</Label>
            <Select
              value={formData.firstAppointmentTeachingSubject || ""}
              disabled={loading}
              color={errors.firstAppointmentTeachingSubject ? "failure" : "gray"}
              onChange={(e) =>
                update("firstAppointmentTeachingSubject", e.target.value)
              }
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentTeachingSubjects.map((s) => (
                <option key={s.id} value={s.subject_id}>
                  {s.name_en}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentTeachingSubject")}
          </div>

          {/* Secondary Teaching Subject */}
          <div>
            <Label>Secondary Teaching Subject</Label>
            <Select
              value={formData.firstAppointmentSecondarySubject || ""}
              disabled={loading}
              onChange={(e) =>
                update("firstAppointmentSecondarySubject", e.target.value)
              }
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentTeachingSubjects.map((s) => (
                <option key={s.id} value={s.subject_id}>
                  {s.name_en}
                </option>
              ))}
            </Select>
          </div>

          {/* Institution Category */}
          <div>
            <Label>Institution Category</Label>
            <Select
              value={formData.firstAppointmentInstCategory || ""}
              disabled={loading}
              color={errors.firstAppointmentInstCategory ? "failure" : "gray"}
              onChange={(e) =>
                update("firstAppointmentInstCategory", e.target.value)
              }
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentInstCategories.map((c) => (
                <option key={c.id} value={c.institution_category_id}>
                  {c.institution_category_name || c.name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentInstCategory")}
          </div>

          {/* Zonal Education Office */}
          <div>
            <Label>Zonal Education Office</Label>
            <Select
              value={formData.firstAppointmentZone || ""}
              disabled={loading}
              color={errors.firstAppointmentZone ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentZone", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentZonalOffices.map((z) => (
                <option key={z.id} value={z.workplace_id}>
                  {z.name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentZone")}
          </div>

          {/* First Appointment Institution */}
          <div>
            <Label>First Appointment Institution</Label>
            <Select
              value={formData.firstAppointmentInstitution || ""}
              disabled={loading}
              color={errors.firstAppointmentInstitution ? "failure" : "gray"}
              onChange={(e) =>
                update("firstAppointmentInstitution", e.target.value)
              }
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentInstitutions.map((i) => (
                <option key={i.id} value={i.workplace_id}>
                  {i.census_no} - {i.name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentInstitution")}
          </div>

          {/* Appointed Position */}
          <div>
            <Label>Appointed Position</Label>
            <Select
              value={formData.firstAppointmentPosition || ""}
              disabled={loading}
              color={errors.firstAppointmentPosition ? "failure" : "gray"}
              onChange={(e) =>
                update("firstAppointmentPosition", e.target.value)
              }
            >
              <option value="">{selectPlaceholder}</option>
              {firstAppointmentPositions.map((p) => (
                <option key={p.id} value={p.position_id}>
                  {p.position_name}
                </option>
              ))}
            </Select>
            {renderError("firstAppointmentPosition")}
          </div>
        </div>
      </div>
    </div>
  );
}
