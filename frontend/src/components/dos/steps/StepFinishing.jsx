import { HiCheckCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function StepFinishing({ formData }) {
    const navigate = useNavigate();

    const handleNewRegistration = () => {
        // 🔴 Force full reset of RegTeacher state
        navigate("/teacher/create", { replace: true });
        window.location.reload();
    };

    return (
        <div className="flex justify-center px-4 py-4 md:py-6 animate-in fade-in duration-500">
            <div className="w-full max-w-3xl space-y-8">
                {/* Step Title */}
                <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                        06
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Finishing
                    </h2>
                </div>

                {/* Success Alert */}
                <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                    <div className="shrink-0">
                        <HiCheckCircle className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-green-800">
                            Teacher Registration Successfully
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            Registration has been completed successfully.
                        </p>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="rounded-2xl surface p-6 space-y-3">
                    <p className="text-sm font-medium">
                        Name:{" "}
                        <span className="font-semibold">
                            {formData.fullName || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium">
                        NIC:{" "}
                        <span className="font-semibold">
                            {formData.nic || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium">
                        Email:{" "}
                        <span className="font-semibold">
                            {formData.email || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium">
                        Contact Number:{" "}
                        <span className="font-semibold">
                            {formData.contact || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium">
                        Current Appointed Position:{" "}
                        <span className="font-semibold">
                            {formData.currentAppointmentPositionName ||
                                formData.currentAppointmentPosition ||
                                "-"}
                        </span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4">
                    <button
                        type="button"
                        onClick={handleNewRegistration}
                        className="rounded-full bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition"
                    >
                        New Registration
                    </button>

                    <button
                        type="button"
                        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                        Download Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
