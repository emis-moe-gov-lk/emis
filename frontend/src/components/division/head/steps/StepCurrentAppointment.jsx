import { Label, Select, TextInput, Radio } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useState, useEffect, useMemo } from "react";
import api from "@/api/axios";

export default function StepCurrentAppointment({
  formData,
  setFormData,
  onValid,
  isDeo = false,
}) {
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [displayErrors, setDisplayErrors] = useState({});
  const [hasAttempted, setHasAttempted] = useState(false);

  const [currentAppointmentServices, setCurrentAppointmentServices] = useState([]);
  const [currentAppointmentRanks, setCurrentAppointmentRanks] = useState([]);
  const [currentAppointmentZonalOffices, setCurrentAppointmentZonalOffices] =
    useState([]);
  const [currentAppointmentPositions, setCurrentAppointmentPositions] =
    useState([]);
  const minCurrentAppointmentDate = formData.firstAppointmentDate || undefined;

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/teachers/current-appointment-form-data?service=${formData.currentAppointmentService || ""}&zone=${formData.currentAppointmentZone || ""}`,
        );

        const data = res.data;
        const services =
          Array.isArray(data.service)
            ? data.service
            : Array.isArray(data.services)
            ? data.services
            : [];

        setCurrentAppointmentServices(services);
        setCurrentAppointmentRanks(data.serviceRanks ?? data.service_ranks ?? []);
        setCurrentAppointmentZonalOffices(data.zonalEducationOffices ?? data.zonal_education_offices ?? []);
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
    formData.currentAppointmentZone,
  ]);

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    const e = {};
    if (!formData.currentAppointmentRegType)
      e.currentAppointmentRegType = "Required";
    if (!formData.currentAppointmentDate) e.currentAppointmentDate = "Required";
    if (
      formData.currentAppointmentDate &&
      formData.firstAppointmentDate &&
      formData.currentAppointmentDate < formData.firstAppointmentDate
    ) {
      e.currentAppointmentDate =
        "Current appointment date must be same or after first appointment date";
    }
    if (!formData.currentAppointmentLetter)
      e.currentAppointmentLetter = "Required";

    if (!isDeo) {
      if (!formData.currentAppointmentService)
        e.currentAppointmentService = "Required";
      if (!formData.currentAppointmentRank) e.currentAppointmentRank = "Required";
    }

    if (!formData.currentAppointmentZone) e.currentAppointmentZone = "Required";
    if (!formData.currentAppointmentPosition)
      e.currentAppointmentPosition = "Required";

    setValidationErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, loading]);

  // expose validation trigger to parent
  useEffect(() => {
    window.__triggerCurrentAppointmentValidation = () => setHasAttempted(true);
    return () => delete window.__triggerCurrentAppointmentValidation;
  }, []);

  useEffect(() => {
    if (hasAttempted) setDisplayErrors(validationErrors);
    else setDisplayErrors({});
  }, [hasAttempted, validationErrors]);

  const renderError = (key) =>
    displayErrors[key] ? (
      <p className="text-sm text-red-600 mt-1">{displayErrors[key]}</p>
    ) : null;

  const getFieldColor = (key) => (displayErrors[key] ? "failure" : "gray");

  // Set default registration type and position for DEO
  useEffect(() => {
    if (isDeo) {
      setFormData((prev) => ({
        ...prev,
        currentAppointmentRegType: prev.currentAppointmentRegType || "existing",
        currentAppointmentService: prev.currentAppointmentService || "SER007",
        currentAppointmentPosition: prev.currentAppointmentPosition || "POS021",
        currentAppointmentRank: prev.currentAppointmentRank || "RANK019",
      }));
    } else {
      if (!formData.currentAppointmentRegType) {
        update("currentAppointmentRegType", "existing");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeo]);

  // Restrict positions to specific roles
  const displayPositions = useMemo(() => {
    const allowedPositions = [
      "Divisional Director of Education",
      "Deputy Divisional Director of Education",
    ];
    return currentAppointmentPositions.filter((p) =>
      allowedPositions.includes(p.position_name)
    );
  }, [currentAppointmentPositions]);

  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      // RESET LOGIC
      if (key === "currentAppointmentService") {
        next.currentAppointmentRank = "";
      }

      return next;
    });

    setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 py-0 [&_input]:bg-white dark:[&_input]:bg-gray-800 [&_select]:bg-white dark:[&_select]:bg-gray-800 [&_textarea]:bg-white dark:[&_textarea]:bg-gray-800 [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-gray-300">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          05
        </div>
        <h2 className="text-lg font-semibold">
          Current Appointment Details
        </h2>
      </div>

      {/* Registration Type */}
      <div className="space-y-2">
        <Label>Select registration type for the Admin</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {/* New */}
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
                  New Admin
                </span>
                <span className="block text-xs text-gray-400 mt-1">
                  Admin appointed for the first time.
                </span>
              </div>
            </div>
          </label>

          {/* Existing */}
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
                  Existing Admin
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Admin with prior service history.
                </span>
              </div>
            </div>
          </label>
        </div>
        {renderError("currentAppointmentRegType")}
      </div>

      {/* Information Alert */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HiInformationCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2 text-blue-800 text-sm">
          <p className="font-medium leading-relaxed">
            Only for the registration of an Admin with a period of service, if
            not appointed as a new Admin.
          </p>
        </div>
      </div>

      {/* Appointment Date & Letter */}
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
            color={getFieldColor("currentAppointmentDate")}
            onChange={(e) => update("currentAppointmentDate", e.target.value)}
            shadow
          />
          {renderError("currentAppointmentDate")}
        </div>

        <div>
          <Label htmlFor="currentAppointmentLetter">
            Appointment / Transfer Letter No <span className="text-red-600">*</span>
          </Label>
          <TextInput
            id="currentAppointmentLetter"
            placeholder="Enter letter number"
            value={formData.currentAppointmentLetter || ""}
            color={getFieldColor("currentAppointmentLetter")}
            onChange={(e) => update("currentAppointmentLetter", e.target.value)}
            shadow
          />
          {renderError("currentAppointmentLetter")}
        </div>
      </div>

          {/* Service & Rank */}
      {!isDeo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Label htmlFor="currentAppointmentService">
              Current Service <span className="text-red-600">*</span>
            </Label>
            <Select
              id="currentAppointmentService"
              value={formData.currentAppointmentService || ""}
              disabled={loading}
              color={getFieldColor("currentAppointmentService")}
              onChange={(e) =>
                update("currentAppointmentService", e.target.value)
              }
            >
              <option value="">{selectPlaceholder}</option>
              {currentAppointmentServices
                .filter((s) => s.service_name === "SLEAS")
                .map((s) => (
                  <option key={s.id || s.service_id} value={s.service_id}>
                    {s.service_name}
                  </option>
                ))}
            </Select>
            {renderError("currentAppointmentService")}
          </div>

          <div>
            <Label htmlFor="currentAppointmentRank">
              Current Service Rank <span className="text-red-600">*</span>
            </Label>
            <Select
              id="currentAppointmentRank"
              value={formData.currentAppointmentRank || ""}
              disabled={loading}
              color={getFieldColor("currentAppointmentRank")}
              onChange={(e) => update("currentAppointmentRank", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {currentAppointmentRanks.map((r) => (
                <option key={r.id} value={r.rank_id}>
                  {r.name || r.rank_name}
                </option>
              ))}
            </Select>
            {renderError("currentAppointmentRank")}
          </div>
        </div>
      )}

      {/* Zone & Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentZone">
            Zonal Education Office <span className="text-red-600">*</span>
          </Label>
          <Select
            id="currentAppointmentZone"
            value={formData.currentAppointmentZone || ""}
            disabled={loading}
            color={getFieldColor("currentAppointmentZone")}
            onChange={(e) => update("currentAppointmentZone", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {currentAppointmentZonalOffices.map((z) => (
              <option key={z.id} value={z.workplace_id}>
                {z.name}
              </option>
            ))}
          </Select>
          {renderError("currentAppointmentZone")}
        </div>

        <div>
          <Label htmlFor="currentAppointmentPosition">
            Current Appointed Position <span className="text-red-600">*</span>
          </Label>
          {isDeo ? (
            <TextInput
              id="currentAppointmentPositionDisplay"
              value="Development Officer"
              readOnly
              shadow
              color={getFieldColor("currentAppointmentPosition")}
            />
          ) : (
            <Select
              id="currentAppointmentPosition"
              value={formData.currentAppointmentPosition || ""}
              disabled={loading}
              color={getFieldColor("currentAppointmentPosition")}
              onChange={(e) => update("currentAppointmentPosition", e.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {displayPositions.map((p) => (
                <option key={p.id} value={p.position_id}>
                  {p.position_name}
                </option>
              ))}
            </Select>
          )}
          {renderError("currentAppointmentPosition")}
        </div>
      </div>
    </div>
  );
}
