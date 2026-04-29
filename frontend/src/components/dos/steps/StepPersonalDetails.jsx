import { Label, TextInput, Select, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";
import api from "@/api/axios";

export default function StepPersonalDetails({
  formData,
  setFormData,
  onValid, // optional: used by parent to enable Next
}) {
  const ENGLISH_NAME_REGEX = /^[A-Za-z ]+$/;
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = new Date();
  const maxDateOfBirth = formatDate(today);
  const minDobDate = new Date(today);
  minDobDate.setFullYear(minDobDate.getFullYear() - 100);
  const minDateOfBirth = formatDate(minDobDate);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [titles, setTitles] = useState([]);
  const [genders, setGenders] = useState([]);
  const [ethnicities, setEthnicities] = useState([]);
  const [religions, setReligions] = useState([]);
  const [civilStatuses, setCivilStatuses] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [dsOffices, setDsOffices] = useState([]);
  const [gnDivisions, setGnDivisions] = useState([]);

  /* ===============================
     Update helper (clear error)
  =============================== */
  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* ===============================
     Fetch Personal Form Data
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/teachers/personal-form-data?district=${formData.districtId || ""}&ds_office=${formData.dsOfficeId || ""}`,
        );

        setTitles(res.data?.titles || []);
        setGenders(res.data?.genders || []);
        setEthnicities(res.data?.ethnicities || []);
        setReligions(res.data?.religions || []);
        setCivilStatuses(res.data?.civilStatuses || []);
        setBloodGroups(res.data?.bloodGroups || []);
        setDistricts(res.data?.districts || []);
        setDsOffices(res.data?.divisionalSecretariats || []);
        setGnDivisions(res.data?.gnDivisions || []);
      } catch (error) {
        console.error("Failed to load personal form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData.districtId, formData.dsOfficeId]);

  /* ===============================
     Validation Logic (UNCHANGED)
  =============================== */
  const validate = () => {
    const e = {};

    if (!formData.titleId) e.titleId = "Title is required";
    if (!formData.fullName?.trim()) {
      e.fullName = "Full name is required";
    } else if (!ENGLISH_NAME_REGEX.test(formData.fullName.trim())) {
      e.fullName = "Only English letters and spaces are allowed";
    }
    if (!formData.genderId) e.genderId = "Gender is required";
    if (!formData.dateOfBirth) {
      e.dateOfBirth = "Date of birth is required";
    } else if (formData.dateOfBirth > maxDateOfBirth) {
      e.dateOfBirth = "Date of birth cannot be a future date";
    } else if (formData.dateOfBirth < minDateOfBirth) {
      e.dateOfBirth = "Date of birth cannot be more than 100 years ago";
    }
    if (!formData.ethnicityId) e.ethnicityId = "Ethnicity is required";
    if (!formData.religionId) e.religionId = "Religion is required";
    if (!formData.civilStatusId) e.civilStatusId = "Civil status is required";
    if (!formData.bloodGroupId) e.bloodGroupId = "Blood group is required";

    if (
      formData.healthCondition === "" ||
      formData.healthCondition === undefined
    ) {
      e.healthCondition = "Health condition is required";
    }

    if (
      formData.healthCondition === "0" &&
      !formData.healthConditionDescription
    ) {
      e.healthConditionDescription =
        "Health condition description is required";
    }

    if (!formData.districtId) e.districtId = "District is required";
    if (!formData.dsOfficeId) e.dsOfficeId = "DS office is required";
    if (!formData.gnDivisionId) e.gnDivisionId = "GN division is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ===============================
     Notify parent when valid
  =============================== */
  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const renderError = (key) =>
    errors[key] ? <p className="mt-1 text-xs text-red-600">{errors[key]}</p> : null;

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-4xl rounded-2xl px-6 py-0 [&_input]:bg-white [&_select]:bg-white [&_textarea]:bg-white [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700">
        {/* Step title */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            02
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Personal Details
          </h2>
        </div>

        <div className="space-y-2">
          {/* Title + Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-x-4 gap-y-2">
            <div>
              <Label>
                Title <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.titleId || ""}
                disabled={loading}
                color={errors.titleId ? "failure" : "gray"}
                onChange={(e) => update("titleId", e.target.value)}
              >
                <option value="">{loading ? "Loading..." : "Select"}</option>
                {titles.map((t) => (
                  <option key={t.title_id} value={t.title_id}>
                    {t.title_name}
                  </option>
                ))}
              </Select>
              {renderError("titleId")}
            </div>

            <div>
              <Label>
                Full Name <span className="text-red-600">*</span>
              </Label>
              <TextInput
                value={formData.fullName || ""}
                placeholder="Enter full name"
                color={errors.fullName ? "failure" : "gray"}
                onChange={(e) =>
                  update("fullName", e.target.value.replace(/[^A-Za-z ]+/g, ""))
                }
              />
              {renderError("fullName")}
            </div>
          </div>

          {/* Gender / Ethnicity / Religion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <Label>
                Gender <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.genderId || ""}
                disabled={loading}
                color={errors.genderId ? "failure" : "gray"}
                onChange={(e) => update("genderId", e.target.value)}
              >
                <option value="">Select</option>
                {genders.map((g) => (
                  <option key={g.gender_id} value={g.gender_id}>
                    {g.gender_name}
                  </option>
                ))}
              </Select>
              {renderError("genderId")}
            </div>

            <div>
              <Label>
                Ethnicity <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.ethnicityId || ""}
                color={errors.ethnicityId ? "failure" : "gray"}
                onChange={(e) => update("ethnicityId", e.target.value)}
              >
                <option value="">Select</option>
                {ethnicities.map((e) => (
                  <option key={e.ethnicity_id} value={e.ethnicity_id}>
                    {e.ethnicity_name}
                  </option>
                ))}
              </Select>
              {renderError("ethnicityId")}
            </div>

            <div>
              <Label>
                Religion <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.religionId || ""}
                color={errors.religionId ? "failure" : "gray"}
                onChange={(e) => update("religionId", e.target.value)}
              >
                <option value="">Select</option>
                {religions.map((r) => (
                  <option key={r.religion_id} value={r.religion_id}>
                    {r.religion_name}
                  </option>
                ))}
              </Select>
              {renderError("religionId")}
            </div>
          </div>

          {/* Date of Birth / Blood Group / Healthy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <Label>
                Date of Birth <span className="text-red-600">*</span>
              </Label>
              <TextInput
                type="date"
                value={formData.dateOfBirth || ""}

                min={minDateOfBirth}
                max={maxDateOfBirth}

                color={errors.dateOfBirth ? "failure" : "gray"}
                onChange={(e) => update("dateOfBirth", e.target.value)}
              />
              {renderError("dateOfBirth")}
            </div>

            <div>
              <Label>
                Blood Group <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.bloodGroupId || ""}
                color={errors.bloodGroupId ? "failure" : "gray"}
                onChange={(e) => update("bloodGroupId", e.target.value)}
              >
                <option value="">Select</option>
                {bloodGroups.map((b) => (
                  <option key={b.blood_group_id} value={b.blood_group_id}>
                    {b.blood_group}
                  </option>
                ))}
              </Select>
              {renderError("bloodGroupId")}
            </div>

            <div>
              <Label>
                Healthy? <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.healthCondition ?? ""}
                color={errors.healthCondition ? "failure" : "gray"}
                onChange={(e) => update("healthCondition", e.target.value)}
              >
                <option value="">Select</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </Select>
              {renderError("healthCondition")}
            </div>
          </div>

          {/* Civil Status + Describe Health Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <Label>
                Civil Status <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.civilStatusId || ""}
                color={errors.civilStatusId ? "failure" : "gray"}
                onChange={(e) => update("civilStatusId", e.target.value)}
              >
                <option value="">Select</option>
                {civilStatuses.map((c) => (
                  <option key={c.civil_status_id} value={c.civil_status_id}>
                    {c.civil_status_name}
                  </option>
                ))}
              </Select>
              {renderError("civilStatusId")}
            </div>

            <div className="sm:col-span-2">
              <Label>
                Describe Health Condition{" "}
                <span className="text-red-600">*</span>{" "}

                (If Healthy is NO)

              </Label>
              <Textarea
                rows={3}
                disabled={formData.healthCondition !== "0"}
                color={errors.healthConditionDescription ? "failure" : "gray"}
                value={formData.healthConditionDescription || ""}
                onChange={(e) =>
                  update("healthConditionDescription", e.target.value)
                }
              />
              {renderError("healthConditionDescription")}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <Label>
                District <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.districtId || ""}
                color={errors.districtId ? "failure" : "gray"}
                onChange={(e) => {
                  update("districtId", e.target.value);
                  update("dsOfficeId", "");
                  update("gnDivisionId", "");
                }}
              >
                <option value="">Select</option>
                {districts.map((d) => (
                  <option key={d.district_id} value={d.district_id}>
                    {d.district_name}
                  </option>
                ))}
              </Select>
              {renderError("districtId")}
            </div>

            <div>
              <Label>
                DS Office <span className="text-red-600">*</span>
              </Label>
              <Select
                disabled={!formData.districtId}
                value={formData.dsOfficeId || ""}
                color={errors.dsOfficeId ? "failure" : "gray"}
                onChange={(e) => {
                  update("dsOfficeId", e.target.value);
                  update("gnDivisionId", "");
                }}
              >
                <option value="">Select</option>
                {dsOffices.map((ds) => (
                  <option key={ds.dso_id} value={ds.dso_id}>
                    {ds.dso_name}
                  </option>
                ))}
              </Select>
              {renderError("dsOfficeId")}
            </div>

            <div>
              <Label>
                GN Division <span className="text-red-600">*</span>
              </Label>
              <Select
                disabled={!formData.dsOfficeId}
                value={formData.gnDivisionId || ""}
                color={errors.gnDivisionId ? "failure" : "gray"}
                onChange={(e) => update("gnDivisionId", e.target.value)}
              >
                <option value="">Select</option>
                {gnDivisions.map((gn) => (
                  <option key={gn.gn_division_id} value={gn.gn_division_id}>
                    {gn.gn_division_name}
                  </option>
                ))}
              </Select>
              {renderError("gnDivisionId")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
