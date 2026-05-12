import { useState, useEffect } from "react";
import { Label, Select, TextInput } from "flowbite-react";
import api from "@/api/axios";

export default function StepFirstAppointment({
  formData,
  setFormData,
  onValid,
}) {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Dropdown data
  const [services, setServices] = useState([]);
  const [serviceRanks, setServiceRanks] = useState([]);
  const [officeLevels, setOfficeLevels] = useState([]);
  const [workplacesByLevel, setWorkplacesByLevel] = useState([]);
  const [positions, setPositions] = useState([]);
  const [recruitmentCategories, setRecruitmentCategories] = useState([]);
  const [recruitmentSubjects, setRecruitmentSubjects] = useState([]);

  /* -------------------- INITIAL FETCH -------------------- */
  useEffect(() => {
    const fetchBase = async () => {
      try {
        const res = await api.get(`/register/appointment-form-data`);
        setServices(res.data.service ?? []);
        setOfficeLevels(res.data.officeLevels ?? []);
        setRecruitmentCategories(res.data.recruitmentCategories ?? []);
        setRecruitmentSubjects(res.data.apointmentSubjects ?? []);
      } catch (error) {
        console.error("Failed to load appointment base data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBase();
  }, []);

  /* -------------------- RE-FETCH ON SERVICE CHANGE -------------------- */
  useEffect(() => {
    if (!formData.firstAppointmentService) {
      setServiceRanks([]);
      setPositions([]);
      return;
    }
    const fetchServiceData = async () => {
      try {
        const res = await api.get(
          `/register/appointment-form-data?service=${formData.firstAppointmentService}`
        );
        setServiceRanks(res.data.serviceRanks ?? []);
        setPositions(res.data.positions ?? []);
      } catch (error) {
        console.error("Failed to load service data", error);
      }
    };
    fetchServiceData();
  }, [formData.firstAppointmentService]);

  /* -------------------- RE-FETCH ON OFFICE LEVEL CHANGE -------------------- */
  useEffect(() => {
    if (!formData.workingPlaceLevel) {
      setWorkplacesByLevel([]);
      return;
    }
    const fetchWorkplaces = async () => {
      try {
        const res = await api.get(
          `/register/appointment-form-data?office_level=${formData.workingPlaceLevel}`
        );
        setWorkplacesByLevel(res.data.workplacesByLevel ?? []);
      } catch (error) {
        console.error("Failed to load workplaces", error);
      }
    };
    fetchWorkplaces();
  }, [formData.workingPlaceLevel]);

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    const e = {};
    if (!formData.firstAppointmentDate) e.firstAppointmentDate = "Required";
    if (!formData.firstAppointmentLetter) e.firstAppointmentLetter = "Required";
    if (!formData.firstAppointmentService) e.firstAppointmentService = "Required";
    if (!formData.firstAppointmentRank) e.firstAppointmentRank = "Required";
    if (!formData.recruitmentCategory) e.recruitmentCategory = "Required";
    if (!formData.recruitmentSubject) e.recruitmentSubject = "Required";
    if (!formData.workingPlaceLevel) e.workingPlaceLevel = "Required";
    if (!formData.workingPlace) e.workingPlace = "Required";
    if (!formData.appointedPosition) e.appointedPosition = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
  }, [formData]);

  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "firstAppointmentService") {
        next.firstAppointmentRank = "";
        next.appointedPosition = "";
      }
      if (key === "workingPlaceLevel") {
        next.workingPlace = "";
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-5xl rounded-2xl px-6 py-0 space-y-2 [&_input]:border-gray-300 [&_input]:text-gray-900 [&_select]:border-gray-300 [&_select]:text-gray-900 [&_textarea]:border-gray-300 [&_textarea]:text-gray-900 [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700">

        {/* STEP TITLE */}
        <div className="mb-6 flex items-center gap-3 pb-3 border-b border-gray-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-800 text-xs font-bold text-white">
            04
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            First Appointment Details of Education Directors
          </h2>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

          {/* Appointment Date */}
          <div>
            <Label className="text-gray-700 font-semibold">
              First Appointment Date
            </Label>
            <TextInput
              type="date"
              value={formData.firstAppointmentDate || ""}
              onChange={(e) => update("firstAppointmentDate", e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Appointment Letter No */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Appointment Letter No
            </Label>
            <TextInput
              value={formData.firstAppointmentLetter || ""}
              onChange={(e) => update("firstAppointmentLetter", e.target.value)}
              placeholder="e.g., SLEAS/2024/001"
              className="mt-1"
            />
          </div>

          {/* Service */}
          <div>
            <Label className="text-gray-700 font-semibold">Service</Label>
            <Select
              value={formData.firstAppointmentService || ""}
              disabled={loading}
              onChange={(e) => update("firstAppointmentService", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {services.map((s) => (
                <option key={s.id} value={s.service_id}>
                  {s.service_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Service Rank */}
          <div>
            <Label className="text-gray-700 font-semibold">Service Rank</Label>
            <Select
              value={formData.firstAppointmentRank || ""}
              disabled={!formData.firstAppointmentService}
              onChange={(e) => update("firstAppointmentRank", e.target.value)}
              className="mt-1"
            >
              <option value="">
                {!formData.firstAppointmentService
                  ? "Select a service first"
                  : serviceRanks.length === 0
                  ? "Loading..."
                  : "Select"}
              </option>
              {serviceRanks.map((r) => (
                <option key={r.id} value={r.rank_id}>
                  {r.rank_name ?? r.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Recruitment Category */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Recruitment Category
            </Label>
            <Select
              value={formData.recruitmentCategory || ""}
              onChange={(e) => update("recruitmentCategory", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {recruitmentCategories.map((c) => (
                <option key={c.id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Recruitment Subjects */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Recruitment Subject
            </Label>
            <Select
              value={formData.recruitmentSubject || ""}
              disabled={loading}
              onChange={(e) => update("recruitmentSubject", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {recruitmentSubjects.map((s) => (
                <option key={s.id} value={s.a_subject_id}>
                  {s.name_en}
                </option>
              ))}
            </Select>
          </div>

          {/* Working Place Level */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Working Place Level
            </Label>
            <Select
              value={formData.workingPlaceLevel || ""}
              disabled={loading}
              onChange={(e) => update("workingPlaceLevel", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {officeLevels.map((l) => (
                <option key={l.id} value={l.office_level_id}>
                  {l.office_level_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Working Place */}
          <div>
            <Label className="text-gray-700 font-semibold">Working Place</Label>
            <Select
              value={formData.workingPlace || ""}
              disabled={!formData.workingPlaceLevel}
              onChange={(e) => update("workingPlace", e.target.value)}
              className="mt-1"
            >
              <option value="">
                {!formData.workingPlaceLevel
                  ? "Select a level first"
                  : workplacesByLevel.length === 0
                  ? "Loading..."
                  : "Select"}
              </option>
              {workplacesByLevel.map((w) => (
                <option key={w.id} value={w.workplace_id}>
                  {w.census_no ? `${w.census_no} - ${w.name}` : w.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Appointed Position */}
          <div className="md:col-span-2">
            <Label className="text-gray-700 font-semibold">
              Appointed Position
            </Label>
            <Select
              value={formData.appointedPosition || ""}
              disabled={!formData.firstAppointmentService}
              onChange={(e) => update("appointedPosition", e.target.value)}
              className="mt-1"
            >
              <option value="">
                {!formData.firstAppointmentService
                  ? "Select a service first"
                  : positions.length === 0
                  ? "Loading..."
                  : "Select"}
              </option>
              {positions.map((p) => (
                <option key={p.id} value={p.position_id}>
                  {p.position_name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Note:</span> Service rank and positions are filtered based on the selected service. Working places are filtered by the selected office level.
          </p>
        </div>
      </div>
    </div>
  );
}
