import { Label, TextInput, Select, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";
import api from "@/api/axios";

export default function StepPersonalDetails({
  formData,
  setFormData,
  onValid, // optional: used by parent to enable Next
}) {
  const [hasAttempted, setHasAttempted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [displayErrors, setDisplayErrors] = useState({});

  // Expose validation trigger to parent via window
  useEffect(() => {
    window.__triggerPersonalDetailsValidation = () => {
      setHasAttempted(true);
    };
    return () => {
      delete window.__triggerPersonalDetailsValidation;
    };
  }, []);

  const ENGLISH_NAME_REGEX = /^[A-Za-z ]+$/;
  const pad2 = (num) => String(num).padStart(2, "0");
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    return `${year}-${month}-${day}`;
  };
  const today = new Date();
  const maxEligibleDobDate = new Date(today);
  maxEligibleDobDate.setFullYear(maxEligibleDobDate.getFullYear() - 18);
  const maxDateOfBirth = formatDate(maxEligibleDobDate);
  const minDobDate = new Date(today);
  minDobDate.setFullYear(minDobDate.getFullYear() - 100);
  const minDateOfBirth = formatDate(minDobDate);
  const [loading, setLoading] = useState(true);

  const [titles, setTitles] = useState([]);
  const [genders, setGenders] = useState([]);
  const [ethnicities, setEthnicities] = useState([]);
  const [religions, setReligions] = useState([]);
  const [civilStatuses, setCivilStatuses] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [dsOffices, setDsOffices] = useState([]);
  const [gnDivisions, setGnDivisions] = useState([]);

  const parseDobParts = (value) => {
    if (!value) return { year: "", month: "", day: "" };
    const [year, month, day] = value.split("-");
    return {
      year: year || "",
      month: month ? String(Number(month)) : "",
      day: day ? String(Number(day)) : "",
    };
  };

  const [dobParts, setDobParts] = useState(() =>
    parseDobParts(formData.dateOfBirth),
  );

  const selectedYear = Number(dobParts.year);
  const selectedMonth = Number(dobParts.month);
  const maxDaysInSelectedMonth =
    selectedYear && selectedMonth
      ? new Date(selectedYear, selectedMonth, 0).getDate()
      : 31;

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const yearOptions = [];
  for (
    let year = maxEligibleDobDate.getFullYear();
    year >= minDobDate.getFullYear();
    year -= 1
  ) {
    yearOptions.push(year);
  }

  const dayOptions = [];
  for (let day = 1; day <= maxDaysInSelectedMonth; day += 1) {
    dayOptions.push(day);
  }

  const updateDateOfBirthPart = (part, nextValue) => {
    const next = { ...dobParts, [part]: nextValue };

    if (next.year && next.month && next.day) {
      const maxDay = new Date(Number(next.year), Number(next.month), 0).getDate();
      if (Number(next.day) > maxDay) {
        next.day = String(maxDay);
      }
    }

    setDobParts(next);

    if (!next.year || !next.month || !next.day) {
      update("dateOfBirth", "");
      return;
    }

    const year = Number(next.year);
    const month = Number(next.month);
    const day = Number(next.day);

    if (!year || !month || !day) {
      update("dateOfBirth", "");
      return;
    }

    const maxDay = new Date(year, month, 0).getDate();
    const safeDay = Math.min(day, maxDay);

    update("dateOfBirth", `${year}-${pad2(month)}-${pad2(safeDay)}`);
  };

  /* ===============================
     Update helper (clear error)
  =============================== */
  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* ===============================
     Fetch Personal Form Data
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with Admin-specific endpoint if available
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
     Validation Logic
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
      e.dateOfBirth = "Admin must be at least 18 years old";
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

    setValidationErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ===============================
     Notify parent when valid
  =============================== */
  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    if (hasAttempted) {
      setDisplayErrors(validationErrors);
    } else {
      setDisplayErrors({});
    }
  }, [hasAttempted, validationErrors]);

  useEffect(() => {
    if (!formData.dateOfBirth) return;
    setDobParts(parseDobParts(formData.dateOfBirth));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.dateOfBirth]);

  const renderError = (key) =>
    displayErrors[key] ? (
      <p className="mt-1 text-xs text-red-600">{displayErrors[key]}</p>
    ) : null;

  const getFieldColor = (key) => (displayErrors[key] ? "failure" : "gray");

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-4xl rounded-2xl px-6 py-0 [&_input]:bg-white dark:[&_input]:bg-gray-800 [&_select]:bg-white dark:[&_select]:bg-gray-800 [&_textarea]:bg-white dark:[&_textarea]:bg-gray-800 [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-gray-300">
        {/* Step title */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            02
          </div>
          <h2 className="text-lg font-semibold">
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
                color={getFieldColor("titleId")}
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
                color={getFieldColor("fullName")}
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
                color={getFieldColor("genderId")}
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
                color={getFieldColor("ethnicityId")}
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
                color={getFieldColor("religionId")}
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
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={dobParts.month}
                  color={getFieldColor("dateOfBirth")}
                  onChange={(e) => updateDateOfBirthPart("month", e.target.value)}
                >
                  <option value="">Month</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Select>

                <Select
                  value={dobParts.day}
                  color={getFieldColor("dateOfBirth")}
                  onChange={(e) => updateDateOfBirthPart("day", e.target.value)}
                >
                  <option value="">Date</option>
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Select>

                <Select
                  value={dobParts.year}
                  color={getFieldColor("dateOfBirth")}
                  onChange={(e) => updateDateOfBirthPart("year", e.target.value)}
                >
                  <option value="">Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </div>
              {renderError("dateOfBirth")}
            </div>

            <div>
              <Label>
                Blood Group <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.bloodGroupId || ""}
                color={getFieldColor("bloodGroupId")}
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
                color={getFieldColor("healthCondition")}
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
                color={getFieldColor("civilStatusId")}
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
                color={getFieldColor("healthConditionDescription")}
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
                color={getFieldColor("districtId")}
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
                color={getFieldColor("dsOfficeId")}
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
                color={getFieldColor("gnDivisionId")}
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
