import { Label, Select, TextInput, Radio, Checkbox } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useState, useEffect } from "react";
import api from "@/api/axios";

const SLEAS_SERVICE_ID = "SER005";
const SLEAS_SERVICE_NAME = "Sri Lanka Education Administrative Service (SLEAS)";
const ZONAL_LEVEL_NAME = "Zonal Education Office";

export default function StepCurrentAppointment({
  formData,
  setFormData,
  onValid,
}) {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [sameAsFirst, setSameAsFirst] = useState(false);

  const firstIsSleas = formData.firstAppointmentService === SLEAS_SERVICE_ID;

  const [serviceRanks, setServiceRanks] = useState([]);
  const [zonalOffices, setZonalOffices] = useState([]);
  const [zonalPositions, setZonalPositions] = useState([]);


  /* -------------------- AUTO-SET FIXED VALUES -------------------- */
  useEffect(() => {
    update("currentAppointmentService", SLEAS_SERVICE_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/register/appointment-form-data?service=${SLEAS_SERVICE_ID}`
        );
        const data = res.data;

        setServiceRanks(data.serviceRanks ?? []);
        setZonalOffices(data.zonalEducationOffices ?? []);
        setZonalPositions(data.zonalPositions ?? []);
      } catch (error) {
        console.error("Failed to load current appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* -------------------- DEFAULT REG TYPE -------------------- */
  useEffect(() => {
    if (!formData.currentAppointmentRegType) {
      update("currentAppointmentRegType", "existing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    const e = {};
    if (!formData.currentAppointmentRegType) e.currentAppointmentRegType = "Required";
    if (!formData.currentAppointmentDate) e.currentAppointmentDate = "Required";
    if (!formData.currentAppointmentLetter) e.currentAppointmentLetter = "Required";
    if (!formData.currentAppointmentRank) e.currentAppointmentRank = "Required";
    if (!formData.currentAppointmentWorkingPlace) e.currentAppointmentWorkingPlace = "Required";
    if (!formData.currentAppointmentPosition) e.currentAppointmentPosition = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSameAsFirst = (checked) => {
    setSameAsFirst(checked);
    if (checked) {
      const position = zonalPositions.find(
        (p) => p.position_id === formData.appointedPosition
      );
      setFormData((prev) => ({
        ...prev,
        currentAppointmentDate: formData.firstAppointmentDate || "",
        currentAppointmentLetter: formData.firstAppointmentLetter || "",
        currentAppointmentRank: formData.firstAppointmentRank || "",
        currentAppointmentWorkingPlace: formData.workingPlace || "",
        currentAppointmentPosition: formData.appointedPosition || "",
        currentAppointmentPositionLabel: position?.position_name ?? formData.appointedPosition ?? "",
      }));
      setErrors({});
    }
  };

  const handlePositionChange = (positionId) => {
    const position = zonalPositions.find((p) => p.position_id === positionId);
    setFormData((prev) => ({
      ...prev,
      currentAppointmentPosition: positionId,
      currentAppointmentPositionLabel: position?.position_name ?? positionId,
    }));
    setErrors((prev) => ({ ...prev, currentAppointmentPosition: undefined }));
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
          {/* New — disabled */}
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
                  New Education Administrator Officer users can perform any action.
                </span>
              </div>
            </div>
          </label>

          {/* Existing */}
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

      {/* Same as first appointment */}
      {firstIsSleas && (
        <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
          <Checkbox
            checked={sameAsFirst}
            onChange={(e) => handleSameAsFirst(e.target.checked)}
            className="text-gray-700"
          />
          <div>
            <span className="block text-sm font-semibold text-gray-700">
              Current appointment is the same as the first appointment
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Pre-fills the fields below from your first appointment details. You can still edit them.
            </span>
          </div>
        </label>
      )}

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

      {/* Service (fixed) & Rank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentService" className="text-gray-700">
            Current Service
          </Label>
          <TextInput
            id="currentAppointmentService"
            value={SLEAS_SERVICE_NAME}
            disabled
            shadow
            className="bg-gray-50 cursor-not-allowed [&_input]:text-gray-600 [&_input]:border-gray-300 [&_input]:bg-gray-50 [&_input]:ring-0 [&_input]:focus:ring-0"
          />
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
            {serviceRanks.map((r) => (
              <option key={r.id} value={r.rank_id} className="text-gray-700">
                {r.rank_name ?? r.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Working Place Level (fixed) & Working Place */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentWorkingPlaceLevel" className="text-gray-700">
            Current Working Place Level
          </Label>
          <TextInput
            id="currentAppointmentWorkingPlaceLevel"
            value={ZONAL_LEVEL_NAME}
            disabled
            shadow
            className="bg-gray-50 cursor-not-allowed [&_input]:text-gray-600 [&_input]:border-gray-300 [&_input]:bg-gray-50 [&_input]:ring-0 [&_input]:focus:ring-0"
          />
        </div>

        <div>
          <Label htmlFor="currentAppointmentWorkingPlace" className="text-gray-700">
            Working Place (Zonal Education Office)
          </Label>
          <Select
            id="currentAppointmentWorkingPlace"
            value={formData.currentAppointmentWorkingPlace || ""}
            disabled={loading}
            onChange={(e) => update("currentAppointmentWorkingPlace", e.target.value)}
            className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
          >
            <option value="" className="text-gray-500">{selectPlaceholder}</option>
            {zonalOffices.map((z) => (
              <option key={z.id} value={z.workplace_id} className="text-gray-700">
                {z.census_no ? `${z.census_no} - ${z.name}` : z.name}
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
          onChange={(e) => handlePositionChange(e.target.value)}
          className="[&_select]:text-gray-700 [&_select]:border-gray-300 [&_select]:focus:border-gray-300 [&_select]:ring-0 [&_select]:focus:ring-0 [&_select]:bg-white"
        >
          <option value="" className="text-gray-500">{selectPlaceholder}</option>
          {zonalPositions.map((p) => (
            <option key={p.id} value={p.position_id} className="text-gray-700">
              {p.position_name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
