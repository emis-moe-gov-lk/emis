import { Label, Select, TextInput, Radio } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useEffect, useState } from "react";
import api from "@/api/axios";

const isSLTSService = (service) =>
  [service?.service_name, service?.name, service?.service_code, service?.code]
    .filter(Boolean)
    .some((value) => String(value).trim().toUpperCase() === "SLTS");

export default function StepCurrentAppointment({ formData, setFormData, onValid }) {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [services, setServices] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [positions, setPositions] = useState([]);
  const [zonalOffices, setZonalOffices] = useState([]);

  const developmentOfficerPositions = positions.filter(
    (position) => String(position?.position_name || "").trim().toLowerCase() === "development officer",
  );

  const minCurrentAppointmentDate = formData.firstAppointmentDate || undefined;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/deo-officers/form-data?service=${formData.currentAppointmentService || ""}`);
        const data = res.data || {};

        setServices(data.services ?? []);
        setRanks(data.serviceRanks ?? []);
        setPositions(data.positions ?? []);
        setZonalOffices(data.zonalOffices ?? []);
      } catch (error) {
        console.error("Failed to load current appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData.currentAppointmentService]);

  useEffect(() => {
    if (!services.length || formData.currentAppointmentService) return;

    const selectedService = services.find(isSLTSService) || services[0];
    if (!selectedService?.service_id) return;

    update("currentAppointmentService", selectedService.service_id);
  }, [services, formData.currentAppointmentService]);

  useEffect(() => {
    if (!ranks.length || formData.currentAppointmentRank) return;

    const selectedRank = ranks[0];
    if (!selectedRank?.rank_id) return;

    update("currentAppointmentRank", selectedRank.rank_id);
  }, [ranks, formData.currentAppointmentRank]);

  useEffect(() => {
    if (!developmentOfficerPositions.length) return;

    const selectedPositionId = String(formData.currentAppointmentPosition || "");
    const validIds = developmentOfficerPositions.map((position) => String(position.position_id));

    if (!selectedPositionId || !validIds.includes(selectedPositionId)) {
      update("currentAppointmentPosition", developmentOfficerPositions[0].position_id);
    }
  }, [developmentOfficerPositions, formData.currentAppointmentPosition]);

  const validate = () => {
    const e = {};

    if (!formData.currentAppointmentRegType) e.currentAppointmentRegType = "Required";
    if (!formData.currentAppointmentDate) e.currentAppointmentDate = "Required";
    if (
      formData.currentAppointmentDate &&
      formData.firstAppointmentDate &&
      formData.currentAppointmentDate < formData.firstAppointmentDate
    ) {
      e.currentAppointmentDate = "Current appointment date must be same or after first appointment date";
    }
    if (!formData.currentAppointmentLetter) e.currentAppointmentLetter = "Required";
    if (!formData.currentAppointmentZone) e.currentAppointmentZone = "Required";
    if (!formData.currentAppointmentPosition) e.currentAppointmentPosition = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    onValid?.(validate());
  }, [formData, loading]);

  useEffect(() => {
    if (!formData.currentAppointmentRegType) {
      update("currentAppointmentRegType", "existing");
    }
  }, []);

  const update = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "currentAppointmentService") {
        next.currentAppointmentRank = "";
        next.currentAppointmentPosition = "";
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 py-0 [&_input]:bg-white dark:[&_input]:bg-gray-800 [&_select]:bg-white dark:[&_select]:bg-gray-800 [&_textarea]:bg-white dark:[&_textarea]:bg-gray-800 [&_label]:text-xs [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-gray-300">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">04</div>
        <h2 className="text-lg font-semibold">Current Appointment Details</h2>
      </div>

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

          <label className={`relative flex p-4 cursor-pointer rounded-2xl border transition-all ${
            formData.currentAppointmentRegType === "existing"
              ? "border-blue-600 bg-blue-50/10"
              : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 hover:border-blue-500"
          }`}>
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
        {errors.currentAppointmentRegType && <p className="text-sm text-red-600 mt-1">{errors.currentAppointmentRegType}</p>}
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentDate">Current Appointment Date <span className="text-red-600">*</span></Label>
          <TextInput
            id="currentAppointmentDate"
            type="date"
            value={formData.currentAppointmentDate || ""}
            min={minCurrentAppointmentDate}
            color={errors.currentAppointmentDate ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentDate", e.target.value)}
            shadow
          />
          {errors.currentAppointmentDate && <p className="text-sm text-red-600 mt-1">{errors.currentAppointmentDate}</p>}
        </div>

        <div>
          <Label htmlFor="currentAppointmentLetter">Appointment / Transfer Letter No <span className="text-red-600">*</span></Label>
          <TextInput
            id="currentAppointmentLetter"
            placeholder="Enter letter number"
            value={formData.currentAppointmentLetter || ""}
            color={errors.currentAppointmentLetter ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentLetter", e.target.value)}
            shadow
          />
          {errors.currentAppointmentLetter && <p className="text-sm text-red-600 mt-1">{errors.currentAppointmentLetter}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <Label htmlFor="currentAppointmentZone">Zonal Education Office <span className="text-red-600">*</span></Label>
          <Select
            id="currentAppointmentZone"
            value={formData.currentAppointmentZone || ""}
            disabled={loading}
            color={errors.currentAppointmentZone ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentZone", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {zonalOffices.map((o) => (
              <option key={o.id} value={o.workplace_id}>{o.name}</option>
            ))}
          </Select>
          {errors.currentAppointmentZone && <p className="text-sm text-red-600 mt-1">{errors.currentAppointmentZone}</p>}
        </div>

        <div>
          <Label htmlFor="currentAppointmentPosition">Current Appointment Position <span className="text-red-600">*</span></Label>
          <Select
            id="currentAppointmentPosition"
            value={formData.currentAppointmentPosition || ""}
            color={errors.currentAppointmentPosition ? "failure" : "gray"}
            onChange={(e) => update("currentAppointmentPosition", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {developmentOfficerPositions.map((p) => (
              <option key={p.id} value={p.position_id}>{p.position_name}</option>
            ))}
          </Select>
          {errors.currentAppointmentPosition && <p className="text-sm text-red-600 mt-1">{errors.currentAppointmentPosition}</p>}
        </div>
      </div>
    </div>
  );
}