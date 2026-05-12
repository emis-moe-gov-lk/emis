import { useState, useEffect } from "react";
import { Label, Select, TextInput } from "flowbite-react";
import api from "@/api/axios";

export default function StepFirstAppointmentPrincipal({ formData, setFormData, onValid }) {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMinimumFirstAppointmentDate = (dateOfBirth) => {
    if (!dateOfBirth) return undefined;
    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return undefined;
    birthDate.setDate(birthDate.getDate() + 1);
    return formatDate(birthDate);
  };

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [zonalOffices, setZonalOffices] = useState([]);
  const [instCategories, setInstCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [positions, setPositions] = useState([]);

  const minFirstAppointmentDate = getMinimumFirstAppointmentDate(formData.dateOfBirth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/teachers/appointment-form-data?service=${formData.firstAppointmentService}&ins_cat=${formData.firstAppointmentInstCategory}&zone=${formData.firstAppointmentZone}`,
        );
        const data = res.data || {};
        // Principal recruitment categories come from a dedicated endpoint
        // Try to load principal recruitment categories first; fall back to teacher categories
        try {
          const catRes = await api.get(`/principal-recruitment-categories`);
          const catData = catRes.data;
          // support different shapes: {data: [...] } or direct array
          setCategories(catData?.data ?? catData ?? []);
        } catch (catErr) {
          setCategories(data.teacherCategorys ?? []);
        }
        setServices(data.service ?? []);
        setRanks(data.serviceRanks ?? []);
        setZonalOffices(data.zonalEducationOffices ?? []);
        setInstCategories(data.institutionCategory ?? []);
        setInstitutions(data.institutions ?? []);
        setPositions(data.positions ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData.firstAppointmentService, formData.firstAppointmentInstCategory, formData.firstAppointmentZone]);

  const validate = () => {
    const e = {};
    if (!formData.firstAppointmentCategory) e.firstAppointmentCategory = "Required";
    if (!formData.firstAppointmentDate) e.firstAppointmentDate = "Required";
    if (
      formData.firstAppointmentDate &&
      formData.dateOfBirth &&
      formData.firstAppointmentDate <= formData.dateOfBirth
    ) {
      e.firstAppointmentDate = "First appointment date must be after date of birth";
    }
    if (!formData.firstAppointmentLetter) e.firstAppointmentLetter = "Required";
    if (!formData.firstAppointmentService) e.firstAppointmentService = "Required";
    if (!formData.firstAppointmentRank) e.firstAppointmentRank = "Required";
    if (!formData.firstAppointmentInstCategory) e.firstAppointmentInstCategory = "Required";
    if (!formData.firstAppointmentZone) e.firstAppointmentZone = "Required";
    if (!formData.firstAppointmentInstitution) e.firstAppointmentInstitution = "Required";
    if (!formData.firstAppointmentPosition) e.firstAppointmentPosition = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, loading]);

  const renderError = (key) => (errors[key] ? <p className="mt-1 text-xs text-red-600">{errors[key]}</p> : null);

  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "firstAppointmentService") next.firstAppointmentRank = "";
      if (key === "firstAppointmentZone" || key === "firstAppointmentInstCategory") next.firstAppointmentInstitution = "";
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-4xl rounded-2xl px-6 py-0 space-y-2 [&_input]:bg-white dark:[&_input]:bg-gray-800 [&_select]:bg-white dark:[&_select]:bg-gray-800 [&_textarea]:bg-white dark:[&_textarea]:bg-gray-800 [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-gray-300">

        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            04
          </div>
          <h2 className="text-lg font-semibold">First Appointment Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Label>Principal Recruitment Category <span className="text-red-600">*</span></Label>
            <Select
              value={formData.firstAppointmentCategory || ""}
              disabled={loading}
              color={errors.firstAppointmentCategory ? "failure" : "gray"}
              onChange={(e) => update("firstAppointmentCategory", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {categories.map((c) => {
                const id = c.category_id ?? c.principal_recruitment_category_id ?? c.categories_id ?? c.id ?? c.value ?? "";
                const label = c.category_name ?? c.recruitment_category_name ?? c.name ?? c.label ?? String(id);
                return (
                  <option key={id || JSON.stringify(c)} value={id}>
                    {label}
                  </option>
                );
              })}
            </Select>
            {renderError("firstAppointmentCategory")}
          </div>

          <div>
            <Label>First Appointment Date <span className="text-red-600">*</span></Label>
            <TextInput type="date" value={formData.firstAppointmentDate || ""} min={minFirstAppointmentDate} color={errors.firstAppointmentDate ? "failure" : "gray"} onChange={(e) => update("firstAppointmentDate", e.target.value)} />
            {renderError("firstAppointmentDate")}
          </div>

          <div>
            <Label>Appointment Letter No <span className="text-red-600">*</span></Label>
            <TextInput value={formData.firstAppointmentLetter || ""} color={errors.firstAppointmentLetter ? "failure" : "gray"} onChange={(e) => update("firstAppointmentLetter", e.target.value)} />
            {renderError("firstAppointmentLetter")}
          </div>

          <div>
            <Label>Service <span className="text-red-600">*</span></Label>
            <Select value={formData.firstAppointmentService || ""} disabled={loading} color={errors.firstAppointmentService ? "failure" : "gray"} onChange={(e) => update("firstAppointmentService", e.target.value)}>
              <option value="">{selectPlaceholder}</option>
              {services.map((s) => (
                <option key={s.id} value={s.service_id}>{s.service_name}</option>
              ))}
            </Select>
            {renderError("firstAppointmentService")}
          </div>

          <div>
            <Label>Service Rank <span className="text-red-600">*</span></Label>
            <Select value={formData.firstAppointmentRank || ""} disabled={loading} color={errors.firstAppointmentRank ? "failure" : "gray"} onChange={(e) => update("firstAppointmentRank", e.target.value)}>
              <option value="">{selectPlaceholder}</option>
              {ranks.map((r) => (
                <option key={r.id} value={r.rank_id}>{r.name || r.rank_name}</option>
              ))}
            </Select>
            {renderError("firstAppointmentRank")}
          </div>

          <div>
            <Label>Zonal Education Office <span className="text-red-600">*</span></Label>
            <Select value={formData.firstAppointmentZone || ""} disabled={loading} color={errors.firstAppointmentZone ? "failure" : "gray"} onChange={(e) => update("firstAppointmentZone", e.target.value)}>
              <option value="">{selectPlaceholder}</option>
              {zonalOffices.map((z) => (
                <option key={z.id} value={z.workplace_id}>{z.name}</option>
              ))}
            </Select>
            {renderError("firstAppointmentZone")}
          </div>

          <div>
            <Label>Institution Category <span className="text-red-600">*</span></Label>
            <Select value={formData.firstAppointmentInstCategory || ""} disabled={loading} color={errors.firstAppointmentInstCategory ? "failure" : "gray"} onChange={(e) => update("firstAppointmentInstCategory", e.target.value)}>
              <option value="">{selectPlaceholder}</option>
              {instCategories.map((c) => (
                <option key={c.id} value={c.institution_category_id}>{c.institution_category_name || c.name}</option>
              ))}
            </Select>
            {renderError("firstAppointmentInstCategory")}
          </div>

          <div>
            <Label>First Appointment Institution <span className="text-red-600">*</span></Label>
            <Select value={formData.firstAppointmentInstitution || ""} disabled={loading} color={errors.firstAppointmentInstitution ? "failure" : "gray"} onChange={(e) => update("firstAppointmentInstitution", e.target.value)}>
              <option value="">{selectPlaceholder}</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.workplace_id}>{i.census_no} - {i.name}</option>
              ))}
            </Select>
            {renderError("firstAppointmentInstitution")}
          </div>

          <div>
            <Label>Appointed Position <span className="text-red-600">*</span></Label>
            <Select value={formData.firstAppointmentPosition || ""} disabled={loading} color={errors.firstAppointmentPosition ? "failure" : "gray"} onChange={(e) => update("firstAppointmentPosition", e.target.value)}>
              <option value="">{selectPlaceholder}</option>
              {positions.map((p) => (
                <option key={p.id} value={p.position_id}>{p.position_name}</option>
              ))}
            </Select>
            {renderError("firstAppointmentPosition")}
          </div>
        </div>
      </div>
    </div>
  );
}
