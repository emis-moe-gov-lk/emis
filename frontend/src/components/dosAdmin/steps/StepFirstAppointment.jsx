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

export default function StepFirstAppointment({ formData, setFormData, onValid }) {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [data, setData] = useState({
    services: [],
    ranks: [],
    positions: [],
    officeLevels: [],
    workplaces: [],
    recruitmentCategories: [],
    recruitmentSubjects: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/register/appointment-form-data?service=${formData.firstAppointmentService || ""}&office_level=${formData.firstAppointmentOfficeLevel || ""}`,
        );
        const d = res.data;
        setData({
          services: d.service ?? [],
          ranks: d.serviceRanks ?? [],
          positions: d.positions ?? [],
          officeLevels: d.officeLevels ?? [],
          workplaces: d.workplacesByLevel ?? [],
          recruitmentCategories: d.recruitmentCategories ?? [],
          recruitmentSubjects: d.apointmentSubjects ?? [],
        });
      } catch (error) {
        console.error("Failed to load first appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData.firstAppointmentService, formData.firstAppointmentOfficeLevel]);

  const validate = useCallback(() => {
    const e = {};
    if (!formData.firstAppointmentDate) e.firstAppointmentDate = "Required";
    if (!formData.firstAppointmentLetter) e.firstAppointmentLetter = "Required";
    if (!formData.firstAppointmentService) e.firstAppointmentService = "Required";
    if (!formData.firstAppointmentRank) e.firstAppointmentRank = "Required";
    if (!formData.firstAppointmentPosition) e.firstAppointmentPosition = "Required";
    if (!formData.firstAppointmentOfficeLevel) e.firstAppointmentOfficeLevel = "Required";
    if (!formData.firstAppointmentWorkplace) e.firstAppointmentWorkplace = "Required";
    if (!formData.recruitmentCategory) e.recruitmentCategory = "Required";
    if (!formData.recruitmentSubject) e.recruitmentSubject = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  useEffect(() => {
    onValid?.(validate());
  }, [formData, validate, onValid]);

  const update = useCallback((key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "firstAppointmentService") {
        next.firstAppointmentRank = "";
        next.firstAppointmentPosition = "";
      }
      if (key === "firstAppointmentOfficeLevel") {
        next.firstAppointmentWorkplace = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, [setFormData]);

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="space-y-6 px-4 py-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          04
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">First Appointment Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormGroup label="First Appointment Date" required error={errors.firstAppointmentDate}>
          <TextInput
            type="date"
            value={formData.firstAppointmentDate || ""}
            color={errors.firstAppointmentDate ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentDate", e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Appointment Letter No" required error={errors.firstAppointmentLetter}>
          <TextInput
            value={formData.firstAppointmentLetter || ""}
            placeholder="Enter letter number"
            color={errors.firstAppointmentLetter ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentLetter", e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Service" required error={errors.firstAppointmentService}>
          <Select
            value={formData.firstAppointmentService || ""}
            disabled={loading}
            color={errors.firstAppointmentService ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentService", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.services.map((s) => (
              <option key={s.id} value={s.service_id}>{s.service_name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Service Rank" required error={errors.firstAppointmentRank}>
          <Select
            value={formData.firstAppointmentRank || ""}
            disabled={loading || !formData.firstAppointmentService}
            color={errors.firstAppointmentRank ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentRank", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.ranks.map((r) => (
              <option key={r.id} value={r.rank_id}>{r.name || r.rank_name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Position" required error={errors.firstAppointmentPosition}>
          <Select
            value={formData.firstAppointmentPosition || ""}
            disabled={loading || !formData.firstAppointmentService}
            color={errors.firstAppointmentPosition ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentPosition", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.positions.map((p) => (
              <option key={p.id} value={p.position_id}>{p.position_name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Office Level" required error={errors.firstAppointmentOfficeLevel}>
          <Select
            value={formData.firstAppointmentOfficeLevel || ""}
            disabled={loading}
            color={errors.firstAppointmentOfficeLevel ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentOfficeLevel", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.officeLevels.map((o) => (
              <option key={o.office_level_id} value={o.office_level_id}>{o.office_level_name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Workplace" required error={errors.firstAppointmentWorkplace}>
          <Select
            value={formData.firstAppointmentWorkplace || ""}
            disabled={loading || !formData.firstAppointmentOfficeLevel}
            color={errors.firstAppointmentWorkplace ? "failure" : "gray"}
            onChange={(e) => update("firstAppointmentWorkplace", e.target.value)}
          >
            <option value="">{!formData.firstAppointmentOfficeLevel ? "Select office level first" : selectPlaceholder}</option>
            {data.workplaces.map((w) => (
              <option key={w.id} value={w.workplace_id}>{w.name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Recruitment Category" required error={errors.recruitmentCategory}>
          <Select
            value={formData.recruitmentCategory || ""}
            disabled={loading}
            color={errors.recruitmentCategory ? "failure" : "gray"}
            onChange={(e) => update("recruitmentCategory", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.recruitmentCategories.map((c) => (
              <option key={c.id} value={c.category_id}>{c.category_name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Recruitment Subject" required error={errors.recruitmentSubject}>
          <Select
            value={formData.recruitmentSubject || ""}
            disabled={loading}
            color={errors.recruitmentSubject ? "failure" : "gray"}
            onChange={(e) => update("recruitmentSubject", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.recruitmentSubjects.map((s) => (
              <option key={s.id} value={s.a_subject_id}>{s.name_en}</option>
            ))}
          </Select>
        </FormGroup>
      </div>
    </div>
  );
}
