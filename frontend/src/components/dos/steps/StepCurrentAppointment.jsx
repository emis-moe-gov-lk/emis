import { Label, Select, TextInput, Radio } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useState, useEffect } from "react";
import api from "@/api/axios";

export default function StepCurrentAppointment({
  formData,
  setFormData,
  onValid,
}) {
  const isSLTSService = (service) =>
    [service?.service_name, service?.name, service?.service_code, service?.code]
      .filter(Boolean)
      .some((value) => String(value).trim().toUpperCase() === "SLTS");

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [currentAppointmentServices, setCurrentAppointmentServices] = useState([]);
  const [currentAppointmentRanks, setCurrentAppointmentRanks] = useState([]);
  const [currentAppointmentWorkingPlaces, setCurrentAppointmentWorkingPlaces] = useState([]);
  const [currentAppointmentPositions, setCurrentAppointmentPositions] = useState([]);

  const sltsCurrentAppointmentServices = currentAppointmentServices.filter(isSLTSService);
  const isAllowedCurrentAppointmentService = (serviceId) =>
    sltsCurrentAppointmentServices.some(
      (service) => String(service.service_id) === String(serviceId),
    );

  // Cadre Medium options
  const cadreMediumOptions = [
    { value: "sinhala", label: "Sinhala" },
    { value: "tamil", label: "Tamil" },
    { value: "english", label: "English" },
    { value: "not_applicable", label: "Not Applicable" },
  ];

  // Working Place Level options
  const workingPlaceLevelOptions = [
    { value: "ministry", label: "Ministry" },
    { value: "provincial_ministry", label: "Provincial Ministry" },
    { value: "provincial_education_office", label: "Provincial Education Office" },
    { value: "zonal_education_office", label: "Zonal Education Office" },
    { value: "divisional_education_office", label: "Divisional Education Office" },
    { value: "institution", label: "Institution" },
  ];

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/teachers/appointment-form-data?service=${formData.currentAppointmentService || ""}&working_place=${formData.currentAppointmentWorkingPlace || ""}`,
        );

        const data = res.data;

        setCurrentAppointmentServices(data.service ?? []);
        setCurrentAppointmentRanks(data.serviceRanks ?? []);
        setCurrentAppointmentWorkingPlaces(data.workingPlaces ?? data.zonalEducationOffices ?? []);
        setCurrentAppointmentPositions(data.positions ?? []);
      } catch (error) {
        console.error("Failed to load current appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData.currentAppointmentService, formData.currentAppointmentWorkingPlace]);

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    const e = {};
    if (!formData.currentAppointmentRegType) e.currentAppointmentRegType = "Required";
    if (!formData.currentAppointmentDate) e.currentAppointmentDate = "Required";
    if (!formData.currentAppointmentLetter) e.currentAppointmentLetter = "Required";
    if (!formData.currentAppointmentService) e.currentAppointmentService = "Required";
    else if (!isAllowedCurrentAppointmentService(formData.currentAppointmentService))
      e.currentAppointmentService = "Only SLTS service can be selected";
    if (!formData.currentAppointmentRank) e.currentAppointmentRank = "Required";
    if (!formData.currentAppointmentWorkingPlaceLevel) e.currentAppointmentWorkingPlaceLevel = "Required";
    if (!formData.currentAppointmentWorkingPlace) e.currentAppointmentWorkingPlace = "Required";
    if (!formData.currentAppointmentPosition) e.currentAppointmentPosition = "Required";
    if (!formData.currentAppointmentCadreMedium) e.currentAppointmentCadreMedium = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Set default registration type
  useEffect(() => {
    if (!formData.currentAppointmentRegType) {
      update("currentAppointmentRegType", "existing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-set Cadre Subject to "Not Applicable" when Cadre Medium changes or on init
  useEffect(() => {
    if (formData.currentAppointmentCadreMedium) {
      update("currentAppointmentCadreSubject", "Not Applicable");
    } else if (!formData.currentAppointmentCadreSubject) {
      update("currentAppointmentCadreSubject", "Not Applicable");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.currentAppointmentCadreMedium]);

  // Initialize Cadre Subject on mount
  useEffect(() => {
    if (!formData.currentAppointmentCadreSubject) {
      update("currentAppointmentCadreSubject", "Not Applicable");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      // RESET LOGIC
      if (key === "currentAppointmentService") {
        next.currentAppointmentRank = "";
      }
      if (key === "currentAppointmentWorkingPlaceLevel") {
        next.currentAppointmentWorkingPlace = "";
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="space-y-2 px-6 py-0">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-600 text-xs font-bold text-white">
          05
        </div>
        <h2 className="text-lg font-semibold text-gray-700">
          Current Appointment Details
        </h2>
      </div>

      {/* Registration Type */}
      <div className="space-y-2">
        <Label className="text-gray-700">Select registration type for the Education Administrator Officer</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {/* New Teacher */}
          <label className="relative flex p-4 cursor-not-allowed rounded-2xl border border-gray-300 bg-gray-50 opacity-50 transition-all">
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
                <span className="block text-sm font-semibold text-gray-600">
                  New Education Administrator Officer
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  New Education Administrator Officer
                 New Education Administrator Officer users can perform any action.
                </span>
              </div>
            </div>
          </label>

          {/* Existing Teacher */}
          <label
            className={`relative flex p-4 cursor-pointer rounded-2xl border border-gray-300 transition-all ${
              formData.currentAppointmentRegType === "existing"
                ? "bg-gray-100"
                : "bg-gray-50 hover:bg-gray-100"
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
                <span className="block text-sm font-semibold text-gray-700">
                 Existing Education Administrator Officer

                </span>
                <span className="block text-xs text-gray-600 mt-1">
                  Existing Education Administrator Officer
                  Existing Education Administrator Officer users have the ability to read, create, and update.
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Information Alert */}
      <div className="border border-gray-300 rounded-2xl p-4 flex gap-3 bg-gray-50">
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <HiInformationCircle className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <div className="space-y-2 text-red-700 text-sm">
          <p className="font-medium leading-relaxed">
           නවක අධ්‍යාපන අධ්‍යක්ෂවරයකු ලෙස පත්වීමක් ලබා නොගන්නා අවස්තාවක, සේවා කාලයක් සහිත අධ්‍යාපන අධ්‍යක්ෂවරයකු ලියාපදිංචි කිරීම සඳහා පමණි

Only for the registration of a Education Administrator Officer with a period of service, in the event that an appointment is not obtained as a new Education Administrator Officer.
          </p>
        </div>
      </div>

      {/* Appointment Date & Letter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentDate" className="text-gray-700">
            Current Appointment Date
          </Label>
          <TextInput
            id="currentAppointmentDate"
            type="date"
            value={formData.currentAppointmentDate || ""}
            onChange={(e) => update("currentAppointmentDate", e.target.value)}
            shadow
            className="[&_input]:text-gray-700 [&_input]:border-gray-300 [&_input]:focus:border-gray-300 [&_input]:ring-0 [&_input]:focus:ring-0 [&_input]:bg-white"
          />
        </div>

        <div>
          <Label htmlFor="currentAppointmentLetter" className="text-gray-700">
            Appointment / Transfer Letter No
          </Label>
          <TextInput
            id="currentAppointmentLetter"
            placeholder="Enter letter number"
            value={formData.currentAppointmentLetter || ""}
            onChange={(e) => update("currentAppointmentLetter", e.target.value)}
            shadow
            className="[&_input]:text-gray-700 [&_input]:border-gray-300 [&_input]:focus:border-gray-300 [&_input]:ring-0 [&_input]:focus:ring-0 [&_input]:bg-white [&_input]:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Service & Rank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentService" className="text-gray-700">
            Current Service
          </Label>
          <Select
            id="currentAppointmentService"
            value={formData.currentAppointmentService || ""}
            disabled={loading}
            onChange={(e) => update("currentAppointmentService", e.target.value)}
            className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
          >
            <option value="" className="text-gray-500">{selectPlaceholder}</option>
            {sltsCurrentAppointmentServices.map((s) => (
              <option key={s.id} value={s.service_id} className="text-gray-700">
                {s.service_name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="currentAppointmentRank" className="text-gray-700">
            Current Service Rank
          </Label>
          <Select
            id="currentAppointmentRank"
            value={formData.currentAppointmentRank || ""}
            disabled={loading}
            onChange={(e) => update("currentAppointmentRank", e.target.value)}
            className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
          >
            <option value="" className="text-gray-500">{selectPlaceholder}</option>
            {currentAppointmentRanks.map((r) => (
              <option key={r.id} value={r.rank_id} className="text-gray-700">
                {r.name || r.rank_name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Cadre Medium & Cadre Subject */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentCadreMedium" className="text-gray-700">
            Cadre Medium
          </Label>
          <Select
            id="currentAppointmentCadreMedium"
            value={formData.currentAppointmentCadreMedium || ""}
            onChange={(e) => update("currentAppointmentCadreMedium", e.target.value)}
            className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
          >
            <option value="" className="text-gray-500">{selectPlaceholder}</option>
            {cadreMediumOptions.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-700">
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="currentAppointmentCadreSubject" className="text-gray-700">
            Cadre Subject
          </Label>
          <TextInput
            id="currentAppointmentCadreSubject"
            type="text"
            value={formData.currentAppointmentCadreSubject || "Not Applicable"}
            onChange={(e) => update("currentAppointmentCadreSubject", e.target.value)}
            shadow
            readOnly
            className="bg-gray-50 cursor-not-allowed [&_input]:text-gray-600 [&_input]:border-gray-300 [&_input]:bg-gray-50 [&_input]:ring-0 [&_input]:focus:ring-0"
          />
        </div>
      </div>

      {/* Current Working Place Level & Working Place */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentWorkingPlaceLevel" className="text-gray-700">
            Current Working Place Level
          </Label>
          <Select
            id="currentAppointmentWorkingPlaceLevel"
            value={formData.currentAppointmentWorkingPlaceLevel || ""}
            onChange={(e) => update("currentAppointmentWorkingPlaceLevel", e.target.value)}
            className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
          >
            <option value="" className="text-gray-500">{selectPlaceholder}</option>
            {workingPlaceLevelOptions.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-700">
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="currentAppointmentWorkingPlace" className="text-gray-700">
            Working Place
          </Label>
          <Select
            id="currentAppointmentWorkingPlace"
            value={formData.currentAppointmentWorkingPlace || ""}
            disabled={loading}
            onChange={(e) => update("currentAppointmentWorkingPlace", e.target.value)}
            className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
          >
            <option value="" className="text-gray-500">{selectPlaceholder}</option>
            {currentAppointmentWorkingPlaces.map((wp) => (
              <option key={wp.id} value={wp.workplace_id || wp.id} className="text-gray-700">
                {wp.census_no ? `${wp.census_no} - ${wp.name}` : wp.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Position */}
      <div>
        <Label htmlFor="currentAppointmentPosition" className="text-gray-700">
          Current Appointed Position
        </Label>
        <Select
          id="currentAppointmentPosition"
          value={formData.currentAppointmentPosition || ""}
          disabled={loading}
          onChange={(e) => update("currentAppointmentPosition", e.target.value)}
          className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
        >
          <option value="" className="text-gray-500">{selectPlaceholder}</option>
          {currentAppointmentPositions.map((p) => (
            <option key={p.id} value={p.position_id} className="text-gray-700">
              {p.position_name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}