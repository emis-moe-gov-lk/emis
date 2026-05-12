import { Label, Select, TextInput, Radio } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useEffect, useState } from "react";
import api from "@/api/axios";

export default function StepCurrentAppointment({
  formData,
  setFormData,
  onValid,
}) {
  const isSLPSService = (service) =>
    [service?.service_name, service?.name, service?.service_code, service?.code]
      .filter(Boolean)
      .some((value) => String(value).trim().toUpperCase() === "SLPS");

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [currentAppointmentServices, setCurrentAppointmentServices] = useState(
    [],
  );
  const [currentAppointmentRanks, setCurrentAppointmentRanks] = useState([]);
  const [currentAppointmentSubjects, setCurrentAppointmentSubjects] = useState(
    [],
  );
  const [currentAppointmentZonalOffices, setCurrentAppointmentZonalOffices] =
    useState([]);
  const [
    currentAppointmentInstCategories,
    setCurrentAppointmentInstCategories,
  ] = useState([]);
  const [currentAppointmentInstitutions, setCurrentAppointmentInstitutions] =
    useState([]);
  const [currentAppointmentPositions, setCurrentAppointmentPositions] =
    useState([]);

  const minCurrentAppointmentDate = formData.firstAppointmentDate || undefined;
  const slpsCurrentAppointmentServices =
    currentAppointmentServices.filter(isSLPSService);
  const isAllowedCurrentAppointmentService = (serviceId) =>
    slpsCurrentAppointmentServices.some(
      (service) => String(service.service_id) === String(serviceId),
    );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/teachers/current-appointment-form-data?service=${formData.currentAppointmentService || ""}&ins_cat=${formData.currentAppointmentInstCategory || ""}&zone=${formData.currentAppointmentZone || ""}`,
        );

        const data = res.data || {};

        setCurrentAppointmentServices(data.service ?? []);
        setCurrentAppointmentRanks(data.serviceRanks ?? []);
        setCurrentAppointmentSubjects(data.mainTeachingSubjects ?? []);
        setCurrentAppointmentZonalOffices(data.zonalEducationOffices ?? []);
        setCurrentAppointmentInstCategories(data.institutionCategory ?? []);
        setCurrentAppointmentInstitutions(data.institutions ?? []);
        setCurrentAppointmentPositions(data.positions ?? []);
      } catch (error) {
        console.error("Failed to load current appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    formData.currentAppointmentService,
    formData.currentAppointmentInstCategory,
    formData.currentAppointmentZone,
  ]);

  const validate = () => {
    const e = {};

    if (!formData.currentAppointmentRegType) {
      e.currentAppointmentRegType = "Required";
    }
    if (!formData.currentAppointmentDate) {
      e.currentAppointmentDate = "Required";
    }
    if (
      formData.currentAppointmentDate &&
      formData.firstAppointmentDate &&
      formData.currentAppointmentDate < formData.firstAppointmentDate
    ) {
      e.currentAppointmentDate =
        "Current appointment date must be same or after first appointment date";
    }
    if (!formData.currentAppointmentLetter) {
      e.currentAppointmentLetter = "Required";
    }
    if (!formData.currentAppointmentService) {
      e.currentAppointmentService = "Required";
    } else if (
      !isAllowedCurrentAppointmentService(formData.currentAppointmentService)
    ) {
      e.currentAppointmentService = "Only SLPS service can be selected";
    }
    if (!formData.currentAppointmentRank) {
      e.currentAppointmentRank = "Required";
    }
    if (!formData.currentAppointmentSubject) {
      e.currentAppointmentSubject = "Required";
    }
    if (!formData.currentAppointmentZone) {
      e.currentAppointmentZone = "Required";
    }
    if (!formData.currentAppointmentInstCategory) {
      e.currentAppointmentInstCategory = "Required";
    }
    if (!formData.currentAppointmentInstitution) {
      e.currentAppointmentInstitution = "Required";
    }
    if (!formData.currentAppointmentPosition) {
      e.currentAppointmentPosition = "Required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, loading, slpsCurrentAppointmentServices.length]);

  useEffect(() => {
    if (!formData.currentAppointmentRegType) {
      update("currentAppointmentRegType", "existing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "currentAppointmentService") {
        next.currentAppointmentRank = "";
      }
      if (
        key === "currentAppointmentZone" ||
        key === "currentAppointmentInstCategory"
      ) {
        next.currentAppointmentInstitution = "";
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 py-0 [&_input]:bg-white dark:[&_input]:bg-gray-800 [&_select]:bg-white dark:[&_select]:bg-gray-800 [&_textarea]:bg-white dark:[&_textarea]:bg-gray-800 [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-gray-300">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          05
        </div>
        <h2 className="text-lg font-semibold">Current Appointment Details</h2>
      </div>

      <div className="space-y-2">
        <Label>Select registration type for the Teacher</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <label className="relative flex p-4 cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-50 transition-all">
            <div className="flex items-start gap-3">
              <Radio
                name="reg_type"
                value="new"
                disabled
                checked={formData.currentAppointmentRegType === "new"}
                onChange={(e) =>
                  update("currentAppointmentRegType", e.target.value)
                }
                className="mt-1"
              />
              <div>
                <span className="block text-sm font-semibold text-gray-400 dark:text-gray-500">
                  New teacher
                </span>
                <span className="block text-xs text-gray-400 mt-1">
                  Teacher appointed for the first time.
                </span>
              </div>
            </div>
          </label>

          <label
            className={`relative flex p-4 cursor-pointer rounded-2xl border transition-all ${formData.currentAppointmentRegType === "existing"
                ? "border-blue-600 bg-blue-50/10"
                : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 hover:border-blue-500"
              }`}
          >
            <div className="flex items-start gap-3">
              <Radio
                name="reg_type"
                value="existing"
                checked={formData.currentAppointmentRegType === "existing"}
                onChange={(e) =>
                  update("currentAppointmentRegType", e.target.value)
                }
                className="mt-1"
              />
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Existing teacher
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Teacher with prior service history.
                </span>
              </div>
            </div>
          </label>
        </div>
        {errors.currentAppointmentRegType && (
          <p className="text-sm text-red-600 mt-1">
            {errors.currentAppointmentRegType}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HiInformationCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2 text-blue-800 text-sm">
          <p className="font-medium leading-relaxed">
            Only for the registration of a teacher with a period of service, if
            not appointed as a new teacher.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentDate">
            Current Appointment Date <span className="text-red-600">*</span>
          </Label>
          <TextInput
            id="currentAppointmentDate"
            type="date"
            value={formData.currentAppointmentDate || ""}
            min={minCurrentAppointmentDate}
            color={errors.currentAppointmentDate ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentDate", e.target.value)}
            shadow
          />
          {errors.currentAppointmentDate && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentDate}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currentAppointmentLetter">
            Appointment / Transfer Letter No <span className="text-red-600">*</span>
          </Label>
          <TextInput
            id="currentAppointmentLetter"
            placeholder="Enter letter number"
            value={formData.currentAppointmentLetter || ""}
            color={errors.currentAppointmentLetter ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentLetter", e.target.value)}
            shadow
          />
          {errors.currentAppointmentLetter && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentLetter}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentService">
            Current Service <span className="text-red-600">*</span>
          </Label>
          <Select
            id="currentAppointmentService"
            value={formData.currentAppointmentService || ""}
            disabled={loading}
            color={errors.currentAppointmentService ? "failure" : "gray"}
            onChange={(e) =>
              update("currentAppointmentService", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {slpsCurrentAppointmentServices.map((s) => (
              <option key={s.id} value={s.service_id}>
                {s.service_name}
              </option>
            ))}
          </Select>
          {errors.currentAppointmentService && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentService}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currentAppointmentRank">
            Current Service Rank <span className="text-red-600">*</span>
          </Label>
          <Select
            id="currentAppointmentRank"
            value={formData.currentAppointmentRank || ""}
            disabled={loading}
            color={errors.currentAppointmentRank ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentRank", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {currentAppointmentRanks.map((r) => (
              <option key={r.id} value={r.rank_id}>
                {r.name || r.rank_name}
              </option>
            ))}
          </Select>
          {errors.currentAppointmentRank && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentRank}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="currentAppointmentSubject">
          Current teaching subject <span className="text-red-600">*</span>
        </Label>
        <Select
          id="currentAppointmentSubject"
          value={formData.currentAppointmentSubject || ""}
          disabled={loading}
          color={errors.currentAppointmentSubject ? "failure" : "gray"}
          onChange={(e) => update("currentAppointmentSubject", e.target.value)}
        >
          <option value="">{selectPlaceholder}</option>
          {currentAppointmentSubjects.map((s) => (
            <option key={s.id} value={s.subject_id}>
              {s.name_en}
            </option>
          ))}
        </Select>
        {errors.currentAppointmentSubject && (
          <p className="text-sm text-red-600 mt-1">
            {errors.currentAppointmentSubject}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentZone">Zonal Education Office</Label>
          <Select
            id="currentAppointmentZone"
            value={formData.currentAppointmentZone || ""}
            disabled={loading}
            color={errors.currentAppointmentZone ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentZone", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {currentAppointmentZonalOffices.map((z) => (
              <option key={z.id} value={z.workplace_id}>
                {z.name}
              </option>
            ))}
          </Select>
          {errors.currentAppointmentZone && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentZone}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currentAppointmentInstCategory">
            Institution Category
          </Label>
          <Select
            id="currentAppointmentInstCategory"
            value={formData.currentAppointmentInstCategory || ""}
            disabled={loading}
            color={errors.currentAppointmentInstCategory ? "failure" : "gray"}
            onChange={(e) =>
              update("currentAppointmentInstCategory", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {currentAppointmentInstCategories.map((c) => (
              <option key={c.id} value={c.institution_category_id}>
                {c.institution_category_name || c.name}
              </option>
            ))}
          </Select>
          {errors.currentAppointmentInstCategory && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentInstCategory}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentInstitution">
            Current Appointment Institution
          </Label>
          <Select
            id="currentAppointmentInstitution"
            value={formData.currentAppointmentInstitution || ""}
            disabled={loading}
            color={errors.currentAppointmentInstitution ? "failure" : "gray"}
            onChange={(e) =>
              update("currentAppointmentInstitution", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {currentAppointmentInstitutions.map((i) => (
              <option key={i.id} value={i.workplace_id}>
                {i.census_no} - {i.name}
              </option>
            ))}
          </Select>
          {errors.currentAppointmentInstitution && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentInstitution}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="currentAppointmentPosition">
            Current Appointment Position
          </Label>
          <Select
            id="currentAppointmentPosition"
            value={formData.currentAppointmentPosition || ""}
            disabled={loading}
            color={errors.currentAppointmentPosition ? "failure" : "gray"}
            onChange={(e) =>
              update("currentAppointmentPosition", e.target.value)
            }
          >
            <option value="">{selectPlaceholder}</option>
            {currentAppointmentPositions.map((p) => (
              <option key={p.id} value={p.position_id}>
                {p.position_name}
              </option>
            ))}
          </Select>
          {errors.currentAppointmentPosition && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentAppointmentPosition}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}