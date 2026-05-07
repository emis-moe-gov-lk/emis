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

  // Dropdown data states
  const [recruitmentSubjects, setRecruitmentSubjects] = useState([]);
  const [recruitmentCategories, setRecruitmentCategories] = useState([]);
  const [zonalPositions, setZonalPositions] = useState([]);

  // Service Ranks for SLEAS
  const sleasServiceRanks = [
    { id: 1, rank_id: "SLEAS-III", rank_name: "Class III (SLEAS III)" },
    { id: 2, rank_id: "SLEAS-II", rank_name: "Class II (SLEAS II)" },
    { id: 3, rank_id: "SLEAS-I", rank_name: "Class I (SLEAS I)" },
  ];

  const workingPlaceLevelsList = [
    { id: 1, name: "Ministry" },
    { id: 2, name: "Provincial Ministry" },
    { id: 3, name: "Provincial Education Office" },
    { id: 4, name: "Zonal Education Office" },
    { id: 5, name: "Divisional Education Office" },
    { id: 6, name: "Institution" }
  ];

  const workingPlacesList = [
    { id: 1, name: "Ministry of Education - Western Province" },
    { id: 2, name: "Ministry of Education - Central Province" },
    { id: 3, name: "Ministry of Education - Southern Province" },
    { id: 4, name: "Ministry of Education - Northern Province" },
    { id: 5, name: "Ministry of Education - Eastern Province" },
    { id: 6, name: "Ministry of Education - North Western Province" },
    { id: 7, name: "Ministry of Education - North Central Province" },
    { id: 8, name: "Ministry of Education - Uva Province" },
    { id: 9, name: "Ministry of Education - Sabaragamuwa Province" }
  ];

  /* Auto-set SLEAS service on component mount */
  useEffect(() => {
    if (!formData.firstAppointmentService) {
      setFormData((prev) => ({ ...prev, firstAppointmentService: "SLEAS" }));
    }
  }, []);

  /* -------------------- FETCH FORM DATA FROM API -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/register/appointment-form-data`);

        setRecruitmentSubjects(res.data.apointmentSubjects ?? []);
        setRecruitmentCategories(res.data.recruitmentCategories ?? []);
        setZonalPositions(res.data.zonalPositions ?? []);
      } catch (error) {
        console.error("Failed to load appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    const e = {};
    
    if (!formData.firstAppointmentDate) e.firstAppointmentDate = "Required";
    if (!formData.firstAppointmentLetter) e.firstAppointmentLetter = "Required";
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

      // Reset working place when level changes
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

          {/* Service - Auto-loaded SLEAS as text box */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Service
            </Label>
            <TextInput
              value="Sri Lanka Education Administrative Service (SLEAS)"
              disabled
              className="mt-1 bg-gray-50 text-gray-900 font-medium"
            />
          </div>

          {/* Service Rank - SLEAS Ranks */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Service Rank
            </Label>
            <Select
              value={formData.firstAppointmentRank || ""}
              disabled={loading}
              onChange={(e) => update("firstAppointmentRank", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {sleasServiceRanks.map((r) => (
                <option key={r.id} value={r.rank_id}>
                  {r.rank_name}
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

          {/* Recruitment Subjects - Loaded from API */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Recruitment Subjects
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

          {/* Appointment Working Place Level */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Working Place Level
            </Label>
            <Select
              value={formData.workingPlaceLevel || ""}
              onChange={(e) => update("workingPlaceLevel", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {workingPlaceLevelsList.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Working Place */}
          <div>
            <Label className="text-gray-700 font-semibold">
              Working Place
            </Label>
            <Select
              value={formData.workingPlace || ""}
              disabled={!formData.workingPlaceLevel}
              onChange={(e) => update("workingPlace", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {workingPlacesList.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
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
              onChange={(e) => update("appointedPosition", e.target.value)}
              className="mt-1"
            >
              <option value="">{selectPlaceholder}</option>
              {zonalPositions.map((p) => (
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
            <span className="font-semibold">Note:</span> Service is automatically set to SLEAS (Sri Lanka Education Administrative Service).
          </p>
        </div>
      </div>
    </div>
  );
}