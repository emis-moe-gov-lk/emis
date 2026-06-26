import { useState, useEffect, useCallback } from "react";
import { Label, Select, TextInput, Radio } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { getMoeAdminCurrentAppointmentFormData } from "@/api/moeAdminService";

const SLEAS_SERVICE_ID = "SER005";

const FormGroup = ({ label, error, required = false, children }) => (
  <div>
    <Label className="mb-2 text-xs font-semibold text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </Label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default function StepMoeAdminCurrentAppointment({ formData, setFormData, onValid }) {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const getFieldError = (key) => (touched[key] ? errors[key] : undefined);
  const getFieldColor = (key) => (touched[key] && errors[key] ? "failure" : "gray");

  // Mark existing fields as touched on mount so pre-loaded data behaves correctly
  useEffect(() => {
    const initialTouched = {};
    Object.keys(formData || {}).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== undefined && formData[key] !== null) {
        initialTouched[key] = true;
      }
    });
    setTouched(initialTouched);
  }, []);

  const [data, setData] = useState({
    ranks: [],
    positions: [],
    moeOffices: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await getMoeAdminCurrentAppointmentFormData({ service: SLEAS_SERVICE_ID });
        setData({
          ranks: d.ranks ?? [],
          positions: d.positions ?? [],
          moeOffices: d.moeOffices ?? [],
        });
      } catch (error) {
        console.error("Failed to load current appointment form data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!formData.currentAppointmentRegType) e.currentAppointmentRegType = "Required";
    if (!formData.currentAppointmentDate) e.currentAppointmentDate = "Required";
    if (!formData.currentAppointmentLetter) e.currentAppointmentLetter = "Required";
    if (!formData.currentAppointmentRank) e.currentAppointmentRank = "Required";
    if (!formData.currentAppointmentPosition) e.currentAppointmentPosition = "Required";
    if (!formData.currentAppointmentZone) e.currentAppointmentZone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  useEffect(() => {
    onValid?.(validate());
  }, [formData, validate, onValid]);

  useEffect(() => {
    if (!formData.currentAppointmentRegType) {
      update("currentAppointmentRegType", "existing");
    }
  }, []);

  const update = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, [setFormData]);

  const selectPlaceholder = loading ? "Loading..." : "Select";

  return (
    <div className="space-y-6 px-4 py-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          05
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Current Appointment Details</h2>
      </div>

      {/* Registration type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700">
          Select registration type for the Administrator
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="relative flex p-4 cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 opacity-50">
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
                <span className="block text-sm font-semibold text-gray-400">New Administrator</span>
                <span className="block text-xs text-gray-400 mt-1">Administrator appointed for the first time.</span>
              </div>
            </div>
          </label>

          <label className={`relative flex p-4 cursor-pointer rounded-2xl border transition-all ${
            formData.currentAppointmentRegType === "existing"
              ? "border-blue-600 bg-blue-50/10"
              : "border-gray-200 bg-gray-50 hover:border-blue-500"
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
                <span className="block text-sm font-semibold text-gray-900">Existing Administrator</span>
                <span className="block text-xs text-gray-500 mt-1">Administrator with prior service history.</span>
              </div>
            </div>
          </label>
        </div>
        {getFieldError("currentAppointmentRegType") && (
          <p className="text-xs text-red-600">{getFieldError("currentAppointmentRegType")}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <HiInformationCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-800 text-sm font-medium leading-relaxed">
          Current appointment is recorded under the Sri Lanka Educational Administrative Service (SLEAS) at the Ministry of Education (MOE) National Level.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormGroup label="Current Appointment Date" required error={getFieldError("currentAppointmentDate")}>
          <TextInput
            type="date"
            value={formData.currentAppointmentDate || ""}
            color={getFieldColor("currentAppointmentDate")}
            onChange={(e) => update("currentAppointmentDate", e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Appointment / Transfer Letter No" required error={getFieldError("currentAppointmentLetter")}>
          <TextInput
            placeholder="Enter letter number"
            value={formData.currentAppointmentLetter || ""}
            color={getFieldColor("currentAppointmentLetter")}
            onChange={(e) => update("currentAppointmentLetter", e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Service Rank" required error={getFieldError("currentAppointmentRank")}>
          <Select
            value={formData.currentAppointmentRank || ""}
            disabled={loading}
            color={getFieldColor("currentAppointmentRank")}
            onChange={(e) => update("currentAppointmentRank", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.ranks.map((r) => (
              <option key={r.rank_id} value={r.rank_id}>{r.name || r.rank_name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Position" required error={getFieldError("currentAppointmentPosition")}>
          <Select
            value={formData.currentAppointmentPosition || ""}
            disabled={loading}
            color={getFieldColor("currentAppointmentPosition")}
            onChange={(e) => update("currentAppointmentPosition", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.positions.map((p) => (
              <option key={p.position_id} value={p.position_id}>{p.position_name}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Ministry of Education Office" required error={getFieldError("currentAppointmentZone")} className="lg:col-span-2">
          <Select
            value={formData.currentAppointmentZone || ""}
            disabled={loading}
            color={getFieldColor("currentAppointmentZone")}
            onChange={(e) => update("currentAppointmentZone", e.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {data.moeOffices.map((z) => (
              <option key={z.workplace_id} value={z.workplace_id}>{z.name}</option>
            ))}
          </Select>
        </FormGroup>
      </div>
    </div>
  );
}
