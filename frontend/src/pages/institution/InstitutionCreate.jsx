import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea, TextInput, Select, Label } from "flowbite-react";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";
import api from "@/api/axios";
import { createInstitution } from "@/api/institutionService";
import toast from "react-hot-toast";

const fieldBaseClass =
  "rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

const labelClass =
  "mb-2 block text-[13px] font-semibold tracking-wide text-gray-700 dark:text-gray-200";

function Field({ htmlFor, label, children, error }) {
  return (
    <div>
      <div className={labelClass}>
        <Label htmlFor={htmlFor}>{label}</Label>
      </div>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

const InstitutionCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    census_no: "",
    workplace_id: "",
    peo_wp_id: "",
    zeo_wp_id: "",
    deo_wp_id: "",
    gn_division_id: "",
    police_station_id: "",
    moh_area_id: "",
    district_id: "",
    category_id: "",
    authority_id: "",
    type_id: "",
    language_id: "",
    gradespan: "",
    ethnicity_id: "",
    gender_id: "",
    facility_id: "",
    established_year: "",
    name: "",
    other_name: "",
    address: "",
    postal_code: "",
    email: "",
    contact_number: "",
    latitude: "",
    longitude: "",
    mission: "",
    vision: "",
    logo: "",
    active_status: "1"
  });

  const [options, setOptions] = useState({
    provinces: [],
    zones: [],
    divisions: [],
    authorities: [],
    districts: [],
    categories: [],
    genders: [],
    languages: [],
    types: [],
    ethnicities: [],
    facilities: [],
    gradeSpans: [],
    gnDivisions: [],
    policeStations: [],
    mohAreas: [],
  });

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const res = await api.get("/institutions/filters");
        setOptions((prev) => ({ ...prev, ...res.data.data }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load form options.");
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);

  const validateField = (name, value) => {
    const requiredSelectFields = new Set([
      "peo_wp_id",
      "zeo_wp_id",
      "deo_wp_id",
      "district_id",
      "category_id",
      "authority_id",
      "type_id",
      "language_id",
      "ethnicity_id",
      "gender_id",
      "facility_id",
      "active_status",
    ]);

    if (requiredSelectFields.has(name) && !String(value).trim()) {
      const labelMap = {
        peo_wp_id: "Provincial Education Office is required.",
        zeo_wp_id: "Zonal Education Office is required.",
        deo_wp_id: "Divisional Education Office is required.",
        district_id: "Administrative District is required.",
        category_id: "Institution Category is required.",
        authority_id: "Authority Category is required.",
        type_id: "Institution Type is required.",
        language_id: "Language Category is required.",
        ethnicity_id: "Ethnicity is required.",
        gender_id: "Institution Gender is required.",
        facility_id: "Facility is required.",
        active_status: "Institution Status is required.",
      };

      return labelMap[name] ?? "This field is required.";
    }

    if (name === "workplace_id") {
      if (!value.trim()) return "Workplace ID is required.";
      if (value.length > 10) return "Max 10 characters allowed (e.g. INS0000001).";
    }
    if (name === "census_no" && value.length > 10) {
      return "Max 10 characters allowed.";
    }
    if (name === "name") {
      if (!value.trim()) return "Institution Name is required.";
    }
    if (name === "logo" && value.length > 255) {
      return "Logo path/name is too long.";
    }
    return undefined;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "peo_wp_id") {
        return { ...prev, peo_wp_id: value, zeo_wp_id: "", deo_wp_id: "" };
      }
      if (name === "zeo_wp_id") {
        return { ...prev, zeo_wp_id: value, deo_wp_id: "" };
      }
      return { ...prev, [name]: value };
    });

    const fieldError = validateField(name, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (fieldError) newErrors[name] = fieldError;
      else delete newErrors[name];
      if (name === "peo_wp_id") {
        delete newErrors.zeo_wp_id;
        delete newErrors.deo_wp_id;
      }
      if (name === "zeo_wp_id") {
        delete newErrors.deo_wp_id;
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    const nextErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) nextErrors[key] = err;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form before submitting.");
      return;
    }

    setLoading(true);
    try {
      await createInstitution(formData);
      toast.success("Institution created successfully!");
      navigate("/institution");
    } catch (error) {
      console.error("Axios Error:", error);
      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        for (const key in backendErrors) {
          newErrors[key] = backendErrors[key][0];
        }
        setErrors(newErrors);
        toast.error("Validation Failed. Please check the highlighted fields.");
      } else {
        toast.error("Failed to create institution.");
      }
    } finally {
      setLoading(false);
    }
  };

  const visibleZones = useMemo(() => {
    if (!formData.peo_wp_id) return options.zones || [];
    return options.zones?.filter((z) => String(z.peo_wp_id) === String(formData.peo_wp_id)) || [];
  }, [formData.peo_wp_id, options.zones]);

  const visibleDivisions = useMemo(() => {
    if (!formData.zeo_wp_id) return options.divisions || [];
    return options.divisions?.filter((d) => String(d.zeo_wp_id) === String(formData.zeo_wp_id)) || [];
  }, [formData.zeo_wp_id, options.divisions]);

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10 mx-auto">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <BackToListButton to="/institution" label="Back to List" />
        </div>

      <div className="rounded-[28px] border border-gray-100 bg-gradient-to-r from-white via-sky-50/70 to-indigo-50/70 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 sm:p-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Create Institution</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create institution profile and account
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section
          title="Institution Details"
          subtitle="Keep the core registration and classification data here."
        >
          {optionsLoading ? (
            <div className="grid place-items-center py-16 text-sm text-gray-500 dark:text-gray-400">
              Loading form options...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field htmlFor="census_no" label="Census No" error={errors.census_no}>
                <TextInput
                  id="census_no"
                  name="census_no"
                  placeholder="Enter census number"
                  value={formData.census_no}
                  onChange={handleChange}
                  color={errors.census_no ? "failure" : "gray"}
                  className={fieldBaseClass}
                  maxLength={10}
                />
              </Field>

              <Field htmlFor="workplace_id" label="Workplace ID" error={errors.workplace_id}>
                <TextInput
                  id="workplace_id"
                  name="workplace_id"
                  placeholder="Enter workplace ID"
                  value={formData.workplace_id}
                  onChange={handleChange}
                  color={errors.workplace_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                  maxLength={10}
                />
              </Field>

              <div className="md:col-span-2">
                <Field htmlFor="peo_wp_id" label="Provincial Education Office" error={errors.peo_wp_id}>
                  <Select
                    id="peo_wp_id"
                    name="peo_wp_id"
                    value={formData.peo_wp_id}
                    onChange={handleChange}
                    color={errors.peo_wp_id ? "failure" : "gray"}
                    className={fieldBaseClass}
                  >
                    <option value="">Select Provincial Education Office</option>
                    {options.provinces.map((p) => (
                      <option key={p.workplace_id} value={p.workplace_id}>
                        {p.short_name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field htmlFor="zeo_wp_id" label="Zonal Education Office" error={errors.zeo_wp_id}>
                <Select
                  id="zeo_wp_id"
                  name="zeo_wp_id"
                  value={formData.zeo_wp_id}
                  onChange={handleChange}
                  color={errors.zeo_wp_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Education Zone</option>
                  {visibleZones.map((z) => (
                    <option key={z.workplace_id} value={z.workplace_id}>
                      {z.short_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="deo_wp_id" label="Divisional Education Office" error={errors.deo_wp_id}>
                <Select
                  id="deo_wp_id"
                  name="deo_wp_id"
                  value={formData.deo_wp_id}
                  onChange={handleChange}
                  color={errors.deo_wp_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Education Division</option>
                  {visibleDivisions.map((d) => (
                    <option key={d.workplace_id} value={d.workplace_id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="md:col-span-2">
                <Field htmlFor="district_id" label="Administrative District" error={errors.district_id}>
                  <Select
                    id="district_id"
                    name="district_id"
                    value={formData.district_id}
                    onChange={handleChange}
                    color={errors.district_id ? "failure" : "gray"}
                    className={fieldBaseClass}
                  >
                    <option value="">Select Administrative District</option>
                    {options.districts.map((district) => (
                    <option key={district.district_id} value={district.district_id}>
                        {district.district_name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field htmlFor="gn_division_id" label="GN Division" error={errors.gn_division_id}>
                <Select
                  id="gn_division_id"
                  name="gn_division_id"
                  value={formData.gn_division_id}
                  onChange={handleChange}
                  color={errors.gn_division_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select GN Division</option>
                  {options.gnDivisions.map((gn) => (
                    <option key={gn.gn_division_id} value={gn.gn_division_id}>
                      {gn.gn_division_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                htmlFor="police_station_id"
                label="Police Station"
                error={errors.police_station_id}
              >
                <Select
                  id="police_station_id"
                  name="police_station_id"
                  value={formData.police_station_id}
                  onChange={handleChange}
                  color={errors.police_station_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Police Station</option>
                  {options.policeStations.map((station) => (
                    <option
                      key={station.police_station_id}
                      value={station.police_station_id}
                    >
                      {station.police_station_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="moh_area_id" label="MOH Area" error={errors.moh_area_id}>
                <Select
                  id="moh_area_id"
                  name="moh_area_id"
                  value={formData.moh_area_id}
                  onChange={handleChange}
                  color={errors.moh_area_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select MOH Area</option>
                  {options.mohAreas.map((area) => (
                    <option key={area.moh_area_id} value={area.moh_area_id}>
                      {area.moh_area_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="category_id" label="Institution Category" error={errors.category_id}>
                <Select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  color={errors.category_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Institution Category</option>
                  {options.categories.map((category) => (
                    <option
                      key={category.institution_category_id}
                      value={category.institution_category_id}
                    >
                      {category.institution_category_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="authority_id" label="Authority Category" error={errors.authority_id}>
                <Select
                  id="authority_id"
                  name="authority_id"
                  value={formData.authority_id}
                  onChange={handleChange}
                  color={errors.authority_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Authority Category</option>
                  {options.authorities.map((a) => (
                    <option key={a.authority_id} value={a.authority_id}>
                      {a.authority_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="type_id" label="Institution Type" error={errors.type_id}>
                <Select
                  id="type_id"
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleChange}
                  color={errors.type_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Institution Type</option>
                  {options.types.map((type) => (
                    <option key={type.institution_types_id} value={type.institution_types_id}>
                      {type.institution_types_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="language_id" label="Language Category" error={errors.language_id}>
                <Select
                  id="language_id"
                  name="language_id"
                  value={formData.language_id}
                  onChange={handleChange}
                  color={errors.language_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Language Category</option>
                  {options.languages.map((language) => (
                    <option key={language.language_id} value={language.language_id}>
                      {language.language_name ?? language.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="gradespan" label="Gradespan" error={errors.gradespan}>
                <Select
                  id="gradespan"
                  name="gradespan"
                  value={formData.gradespan}
                  onChange={handleChange}
                  color={errors.gradespan ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Gradespan</option>
                  {options.gradeSpans.map((gradeSpan) => (
                    <option key={gradeSpan.grade_span_id} value={gradeSpan.grade_span_id}>
                      {gradeSpan.grade_span_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="ethnicity_id" label="Ethnicity" error={errors.ethnicity_id}>
                <Select
                  id="ethnicity_id"
                  name="ethnicity_id"
                  value={formData.ethnicity_id}
                  onChange={handleChange}
                  color={errors.ethnicity_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Ethnicity</option>
                  {options.ethnicities.map((ethnicity) => (
                    <option key={ethnicity.ethnicity_id} value={ethnicity.ethnicity_id}>
                      {ethnicity.ethnicity_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="gender_id" label="Institution Gender" error={errors.gender_id}>
                <Select
                  id="gender_id"
                  name="gender_id"
                  value={formData.gender_id}
                  onChange={handleChange}
                  color={errors.gender_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Institution Gender</option>
                  {options.genders.map((gender) => (
                    <option key={gender.gender_id} value={gender.gender_id}>
                      {gender.gender_name ?? gender.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="facility_id" label="Facility" error={errors.facility_id}>
                <Select
                  id="facility_id"
                  name="facility_id"
                  value={formData.facility_id}
                  onChange={handleChange}
                  color={errors.facility_id ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Facility</option>
                  {options.facilities.map((facility) => (
                    <option key={facility.facilities_id} value={facility.facilities_id}>
                      {facility.facilities_name ?? facility.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          )}
        </Section>

        <Section
          title="Institution Identity"
          subtitle="Name and year details for public-facing records."
        >
          <div className="grid grid-cols-1 gap-5">
            <Field htmlFor="established_year" label="Established Year" error={errors.established_year}>
              <TextInput
                id="established_year"
                name="established_year"
                placeholder="Established Year"
                value={formData.established_year}
                onChange={handleChange}
                color={errors.established_year ? "failure" : "gray"}
                className={fieldBaseClass}
              />
            </Field>

            <Field htmlFor="name" label="Institution Name" error={errors.name}>
              <TextInput
                id="name"
                name="name"
                placeholder="Institution Name"
                value={formData.name}
                onChange={handleChange}
                color={errors.name ? "failure" : "gray"}
                className={fieldBaseClass}
              />
              </Field>

              <Field htmlFor="other_name" label="Other Name (Optional)" error={errors.other_name}>
                <TextInput
                id="other_name"
                name="other_name"
                placeholder="Other Name (Optional)"
                value={formData.other_name}
                onChange={handleChange}
                color={errors.other_name ? "failure" : "gray"}
                className={fieldBaseClass}
                />
              </Field>

              <Field htmlFor="logo" label="Logo" error={errors.logo}>
                <TextInput
                  id="logo"
                  name="logo"
                  placeholder="Logo file name or path"
                  value={formData.logo}
                  onChange={handleChange}
                  color={errors.logo ? "failure" : "gray"}
                  className={fieldBaseClass}
                />
              </Field>
            </div>
        </Section>

        <Section
          title="Contact Details & Location Information"
          subtitle="Address, contact details, and coordinates."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field htmlFor="address" label="Address Line 1" error={errors.address}>
              <TextInput
                id="address"
                name="address"
                placeholder="Address Line 1"
                value={formData.address}
                onChange={handleChange}
                color={errors.address ? "failure" : "gray"}
                className={fieldBaseClass}
              />
            </Field>

            <Field htmlFor="postal_code" label="Postal Code" error={errors.postal_code}>
              <TextInput
                id="postal_code"
                name="postal_code"
                placeholder="Postal Code"
                value={formData.postal_code}
                onChange={handleChange}
                color={errors.postal_code ? "failure" : "gray"}
                className={fieldBaseClass}
                maxLength={10}
              />
            </Field>

            <div className="md:col-span-2">
              <Field htmlFor="email" label="Email Address" error={errors.email}>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  color={errors.email ? "failure" : "gray"}
                  className={fieldBaseClass}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field htmlFor="contact_number" label="Contact Number" error={errors.contact_number}>
                <TextInput
                  id="contact_number"
                  name="contact_number"
                  placeholder="055-5555555"
                  value={formData.contact_number}
                  onChange={handleChange}
                  color={errors.contact_number ? "failure" : "gray"}
                  className={fieldBaseClass}
                  maxLength={15}
                />
              </Field>
            </div>

            <Field htmlFor="latitude" label="Latitude (5.916 - 9.835)" error={errors.latitude}>
              <TextInput
                id="latitude"
                name="latitude"
                placeholder="Enter latitude (5.916 - 9.835)"
                value={formData.latitude}
                onChange={handleChange}
                color={errors.latitude ? "failure" : "gray"}
                className={fieldBaseClass}
                maxLength={10}
              />
            </Field>

            <Field htmlFor="longitude" label="Longitude (79.652 - 81.881)" error={errors.longitude}>
              <TextInput
                id="longitude"
                name="longitude"
                placeholder="Enter longitude (79.652 - 81.881)"
                value={formData.longitude}
                onChange={handleChange}
                color={errors.longitude ? "failure" : "gray"}
                className={fieldBaseClass}
                maxLength={10}
              />
            </Field>

            <div className="md:col-span-2">
              <Field htmlFor="mission" label="Mission" error={errors.mission}>
                <Textarea
                  id="mission"
                  name="mission"
                  placeholder="Institution mission"
                  value={formData.mission}
                  onChange={handleChange}
                  color={errors.mission ? "failure" : "gray"}
                  className={fieldBaseClass}
                  rows={4}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field htmlFor="vision" label="Vision" error={errors.vision}>
                <Textarea
                  id="vision"
                  name="vision"
                  placeholder="Institution vision"
                  value={formData.vision}
                  onChange={handleChange}
                  color={errors.vision ? "failure" : "gray"}
                  className={fieldBaseClass}
                  rows={4}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field htmlFor="active_status" label="Institution Status" error={errors.active_status}>
                <Select
                  id="active_status"
                  name="active_status"
                  value={formData.active_status}
                  onChange={handleChange}
                  color={errors.active_status ? "failure" : "gray"}
                  className={fieldBaseClass}
                >
                  <option value="">Select Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </Select>
              </Field>
            </div>
          </div>
        </Section>

        <div className="flex justify-center pb-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || optionsLoading}
            className="min-w-48 bg-gray-900 px-8 py-3 text-white hover:bg-gray-800"
          >
            {loading ? "Creating..." : "Create Institution"}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default InstitutionCreate;
