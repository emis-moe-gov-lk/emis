import { Label, Select, TextInput, Radio } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useEffect, useState, useRef } from "react";
import { getDivisionDeoCurrentAppointmentFormData } from "@/api/divisionDeoService";

const isSLTSService = (service) =>
  [service?.service_name, service?.name, service?.service_code, service?.code]
    .filter(Boolean)
    .some((value) => String(value).trim().toUpperCase() === "SLTS");

export default function StepDivisionCurrentAppointment({ formData, setFormData, onValid }) {
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [displayErrors, setDisplayErrors] = useState({});
  const [hasAttempted, setHasAttempted] = useState(false);

  const [services, setServices] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [positions, setPositions] = useState([]);
  const [divisionalOffices, setDivisionalOffices] = useState([]);

  // Refs to prevent infinite loops when auto‑selecting DOS
  const hasAutoSelected = useRef(false);
  const [pendingDosService, setPendingDosService] = useState(null);

  // Show all positions instead of filtering
  const displayPositions = positions;

  const minCurrentAppointmentDate = formData.firstAppointmentDate || undefined;

  // ---------- FETCH DATA & FILTER SERVICES ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDivisionDeoCurrentAppointmentFormData({
          service: formData.currentAppointmentService || "",
        });

        const allServices = data.services ?? data.service ?? [];

        // Filter to ONLY DOS (Development Officers’ Service)
        const dosServices = allServices.filter(
          (s) =>
            s.service_code?.toUpperCase() === "DOS" ||
            s.service_name?.toUpperCase() === "DEVELOPMENT OFFICERS SERVICE" ||
            s.service_name?.toUpperCase() === "DOS"
        );
        setServices(dosServices);

        setRanks(data.serviceRanks ?? []);
        setPositions(data.positions ?? []);
        setDivisionalOffices(
          data.divisionalEducationOffices ??
          data.divisional_education_offices ??
          data.divisionalOffices ??
          data.offices ??
          []
        );

        // Auto‑select DOS if not already selected
        if (dosServices.length > 0 && !hasAutoSelected.current) {
          const dosService = dosServices[0];
          const currentServiceId = formData.currentAppointmentService;
          const isDosSelected = dosServices.some(
            (s) => (s.service_id || s.id) === currentServiceId
          );
          if (!isDosSelected) {
            setPendingDosService(dosService.service_id || dosService.id);
          }
          hasAutoSelected.current = true;
        }
      } catch (error) {
        console.error("Failed to load current appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData.currentAppointmentService]);

  // Apply the pending DOS selection
  useEffect(() => {
    if (pendingDosService) {
      setFormData((prev) => ({
        ...prev,
        currentAppointmentService: pendingDosService,
      }));
      setPendingDosService(null);
    }
  }, [pendingDosService, setFormData]);

  // ---------- VALIDATION ----------
  const validate = () => {
    const e = {};
    if (!formData.currentAppointmentRegType)
      e.currentAppointmentRegType = "Required";
    if (!formData.currentAppointmentDate)
      e.currentAppointmentDate = "Required";
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
    if (!formData.currentAppointmentService)
      e.currentAppointmentService = "Required";
    if (!formData.currentAppointmentRank)
      e.currentAppointmentRank = "Required";
    if (!formData.currentAppointmentZone)
      e.currentAppointmentZone = "Required";
    if (!formData.currentAppointmentPosition)
      e.currentAppointmentPosition = "Required";

    setValidationErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- DISPLAY ERRORS ONLY AFTER ATTEMPT ----------
  useEffect(() => {
    if (hasAttempted) {
      setDisplayErrors(validationErrors);
    } else {
      setDisplayErrors({});
    }
  }, [validationErrors, hasAttempted]);

  // ---------- EXPOSE VALIDATION TRIGGER TO PARENT ----------
  useEffect(() => {
    window.__triggerDivisionCurrentAppointmentValidation = () =>
      setHasAttempted(true);
    return () =>
      delete window.__triggerDivisionCurrentAppointmentValidation;
  }, []);

  // ---------- REPORT VALIDITY TO PARENT ----------
  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, loading]);

  // ---------- DEFAULT REGISTRATION TYPE ----------
  useEffect(() => {
    if (!formData.currentAppointmentRegType) {
      update("currentAppointmentRegType", "existing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- HELPERS ----------
  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "currentAppointmentService") {
        next.currentAppointmentRank = "";
        next.currentAppointmentPosition = "";
      }
      return next;
    });
    setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const renderError = (key) =>
    displayErrors[key] ? (
      <p className="text-sm text-red-600 mt-1">{displayErrors[key]}</p>
    ) : null;

  const getFieldColor = (key) =>
    displayErrors[key] ? "failure" : "gray";

  const selectPlaceholder = loading ? "Loading..." : "Select";

  // ---------- RENDER ----------
  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 py-0 [&_input]:bg-white dark:[&_input]:bg-gray-800 [&_select]:bg-white dark:[&_select]:bg-gray-800 [&_textarea]:bg-white dark:[&_textarea]:bg-gray-800 [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-gray-300">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">04</div>
        <h2 className="text-lg font-semibold">Current Appointment Details</h2>
      </div>

      {/* Registration Type */}
      <div className="space-y-2">
        <Label>Select registration type for the Development Officer</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <label className="relative flex p-4 cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-50 transition-all">
            <div className="flex items-start gap-3">
              <Radio
                name="reg_type"
                value="new"
                disabled
                checked={formData.currentAppointmentRegType === "new"}
                onChange={(e) => update("currentAppointmentRegType", e.target.value)}
                className="mt-1"
              />
              <div>
                <span className="block text-sm font-semibold text-gray-400 dark:text-gray-500">New Development Officer</span>
                <span className="block text-xs text-gray-400 mt-1">Development Officer appointed for the first time.</span>
              </div>
            </div>
          </label>

          <label
            className={`relative flex p-4 cursor-pointer rounded-2xl border transition-all ${
              formData.currentAppointmentRegType === "existing"
                ? "border-blue-600 bg-blue-50/10"
                : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 hover:border-blue-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <Radio
                name="reg_type"
                value="existing"
                checked={formData.currentAppointmentRegType === "existing"}
                onChange={(e) => update("currentAppointmentRegType", e.target.value)}
                className="mt-1"
              />
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">Existing Development Officer</span>
                <span className="block text-xs text-gray-500 mt-1">Development Officer with prior service history.</span>
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
            Only for the registration of a Development Officer with a period of service, if not appointed as a new Development Officer.
          </p>
        </div>
      </div>

      {/* Date & Letter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentDate">Current Appointment Date <span className="text-red-600">*</span></Label>
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
          <Label htmlFor="currentAppointmentLetter">Appointment / Transfer Letter No <span className="text-red-600">*</span></Label>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentService">Current Service <span className="text-red-600">*</span></Label>
          <Select
            id="currentAppointmentService"
            value={formData.currentAppointmentService || ""}
            disabled={loading}
            color={getFieldColor("currentAppointmentService")}
            onChange={(e) => update("currentAppointmentService", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {services.map((s) => (
              <option key={s.id || s.service_id} value={s.service_id}>
                {s.service_name}
              </option>
            ))}
          </Select>
          {renderError("currentAppointmentService")}
        </div>

        <div>
          <Label htmlFor="currentAppointmentRank">Current Service Rank <span className="text-red-600">*</span></Label>
          <Select
            id="currentAppointmentRank"
            value={formData.currentAppointmentRank || ""}
            disabled={loading}
            color={getFieldColor("currentAppointmentRank")}
            onChange={(e) => update("currentAppointmentRank", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {ranks.map((r) => (
              <option key={r.id || r.rank_id} value={r.rank_id}>
                {r.name || r.rank_name}
              </option>
            ))}
          </Select>
          {renderError("currentAppointmentRank")}
        </div>
      </div>

      {/* Zone & Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentZone">Divisional Education Office <span className="text-red-600">*</span></Label>
          <Select
            id="currentAppointmentZone"
            value={formData.currentAppointmentZone || ""}
            disabled={loading}
            color={getFieldColor("currentAppointmentZone")}
            onChange={(e) => update("currentAppointmentZone", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {divisionalOffices.map((o) => (
              <option key={o.id} value={o.workplace_id}>
                {o.name}
              </option>
            ))}
          </Select>
          {renderError("currentAppointmentZone")}
        </div>

        <div>
          <Label htmlFor="currentAppointmentPosition">Current Appointment Position <span className="text-red-600">*</span></Label>
          <Select
            id="currentAppointmentPosition"
            value={formData.currentAppointmentPosition || ""}
            color={getFieldColor("currentAppointmentPosition")}
            onChange={(e) => update("currentAppointmentPosition", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {displayPositions.map((p) => (
              <option key={p.id || p.position_id} value={p.position_id}>
                {p.position_name}
              </option>
            ))}
          </Select>
          {renderError("currentAppointmentPosition")}
        </div>
      </div>
    </div>
  );
}