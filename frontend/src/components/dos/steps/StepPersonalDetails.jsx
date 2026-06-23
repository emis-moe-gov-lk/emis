import { Label, TextInput, Select, Textarea } from "flowbite-react";
import { useEffect, useState, useCallback } from "react";
import api from "@/api/axios";

const FormGroup = ({ label, required = false, error, children }) => (
  <div>
    <Label className="mb-2 text-xs font-semibold text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </Label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const ENGLISH_NAME_REGEX = /^[A-Za-z ]+$/;

export default function StepPersonalDetails({
  formData,
  setFormData,
  onValid,
}) {
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

  // Date helpers
  const formatDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const today = new Date();
  const maxDateOfBirth = formatDate(today);
  const minDobDate = new Date(today);
  minDobDate.setFullYear(minDobDate.getFullYear() - 100);
  const minDateOfBirth = formatDate(minDobDate);

  // Update helper - clears errors for that field
  const update = useCallback(
    (key, value) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [setFormData],
  );

  // Fetch form data
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

  // Validation logic
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.titleId) {
      newErrors.titleId = "Title is required";
    }

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!ENGLISH_NAME_REGEX.test(formData.fullName.trim())) {
      newErrors.fullName = "Only English letters and spaces are allowed";
    }

    if (!formData.genderId) {
      newErrors.genderId = "Gender is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (formData.dateOfBirth > maxDateOfBirth) {
      newErrors.dateOfBirth = "Date of birth cannot be a future date";
    } else if (formData.dateOfBirth < minDateOfBirth) {
      newErrors.dateOfBirth = "Date of birth cannot be more than 100 years ago";
    }

    if (!formData.ethnicityId) {
      newErrors.ethnicityId = "Ethnicity is required";
    }

    if (!formData.religionId) {
      newErrors.religionId = "Religion is required";
    }

    if (!formData.civilStatusId) {
      newErrors.civilStatusId = "Civil status is required";
    }

    if (!formData.bloodGroupId) {
      newErrors.bloodGroupId = "Blood group is required";
    }

    if (
      formData.healthCondition === "" ||
      formData.healthCondition === undefined
    ) {
      newErrors.healthCondition = "Health condition is required";
    }

    if (
      formData.healthCondition === "0" &&
      !formData.healthConditionDescription
    ) {
      newErrors.healthConditionDescription =
        "Health condition description is required";
    }

    if (!formData.districtId) {
      newErrors.districtId = "District is required";
    }

    if (!formData.dsOfficeId) {
      newErrors.dsOfficeId = "DS office is required";
    }

    if (!formData.gnDivisionId) {
      newErrors.gnDivisionId = "GN division is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, maxDateOfBirth, minDateOfBirth]);

  // Notify parent when valid
  useEffect(() => {
    onValid?.(validate());
  }, [formData, validate, onValid]);

  const renderError = (key) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
    ) : null;


  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-4xl space-y-6">
        {/* Step Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            02
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Personal Details
          </h2>
        </div>

        {/* Title + Full Name */}
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          <FormGroup label="Title" required error={errors.titleId}>
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
          </FormGroup>

          <FormGroup label="Full Name" required error={errors.fullName}>
            <TextInput
              value={formData.fullName || ""}
              placeholder="Enter full name"
              color={errors.fullName ? "failure" : "gray"}
              onChange={(e) =>
                update("fullName", e.target.value.replace(/[^A-Za-z ]+/g, ""))
              }
            />
          </FormGroup>
        </div>

        {/* Gender / Ethnicity / Religion */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormGroup label="Gender" required error={errors.genderId}>
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
          </FormGroup>

          <FormGroup label="Ethnicity" required error={errors.ethnicityId}>
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
          </FormGroup>

          <FormGroup label="Religion" required error={errors.religionId}>
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
          </FormGroup>
        </div>

        {/* Date of Birth / Blood Group / Health */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormGroup label="Date of Birth" required error={errors.dateOfBirth}>
            <TextInput
              type="date"
              value={formData.dateOfBirth || ""}
              min={minDateOfBirth}
              max={maxDateOfBirth}
              color={errors.dateOfBirth ? "failure" : "gray"}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Blood Group" required error={errors.bloodGroupId}>
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
          </FormGroup>

          <FormGroup label="Healthy?" required error={errors.healthCondition}>
            <Select
              value={formData.healthCondition ?? ""}
              color={errors.healthCondition ? "failure" : "gray"}
              onChange={(e) => update("healthCondition", e.target.value)}
            >
              <option value="">Select</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </Select>
          </FormGroup>
        </div>

        {/* Civil Status + Health Condition Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormGroup label="Civil Status" required error={errors.civilStatusId}>
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
          </FormGroup>

          <div className="sm:col-span-2">
            <FormGroup
              label="Describe Health Condition"
              required={formData.healthCondition === "0"}
              error={errors.healthConditionDescription}
            >
              <Textarea
                rows={3}
                disabled={formData.healthCondition !== "0"}
                color={errors.healthConditionDescription ? "failure" : "gray"}
                value={formData.healthConditionDescription || ""}
                placeholder={
                  formData.healthCondition === "0"
                    ? "Describe the health condition"
                    : "Only applicable if Healthy is No"
                }
                onChange={(e) =>
                  update("healthConditionDescription", e.target.value)
                }
              />
            </FormGroup>
          </div>
        </div>

        {/* Location Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormGroup label="District" required error={errors.districtId}>
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
          </FormGroup>

          <FormGroup label="DS Office" required error={errors.dsOfficeId}>
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
          </FormGroup>

          <FormGroup label="GN Division" required error={errors.gnDivisionId}>
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
          </FormGroup>
        </div>
      </div>
    </div>
  );
}
