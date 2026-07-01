import { HiCheckCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { downloadProvincialAdminProfileDocument } from "@/api/provincialAdminService";
import toast from "react-hot-toast";

export default function StepFinishing({ formData }) {
    const navigate = useNavigate();

    const handleNewRegistration = () => {
        navigate("/employees/provincial/admin/create", { replace: true });
        window.location.reload();
    };

    const handleDownloadProfile = async () => {
        const peopleId = formData?.people_id || formData?.peopleId;
        if (!peopleId) {
            toast.error("Missing people id for download.");
            return;
        }

        try {
            const data = await downloadProvincialAdminProfileDocument(peopleId);
            const blob = new Blob([data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `provincial-admin-profile-${peopleId}.pdf`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                a.remove();
            }, 3000);
        } catch (err) {
            console.error(err);
            toast.error("Unable to download profile PDF.");
        }
    };

    return (
        <div className="flex justify-center px-4 py-4 md:py-6 animate-in fade-in duration-500">
            <div className="w-full max-w-3xl space-y-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                        06
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Finishing
                    </h2>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                    <div className="shrink-0">
                        <HiCheckCircle className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-green-800">
                            Provincial Administrator Registered Successfully
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            Registration has been completed successfully.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl bg-white border shadow-sm p-6 space-y-3">
                    <p className="text-sm font-medium text-gray-900">
                        Name:{" "}
                        <span className="font-semibold">
                            {formData?.fullName || "-"}
                        </span>
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        NIC:{" "}
                        <span className="font-semibold">
                            {formData?.nic || "-"}
                        </span>
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        Email:{" "}
                        <span className="font-semibold">
                            {formData?.email || "-"}
                        </span>
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        Contact Number:{" "}
                        <span className="font-semibold">
                            {formData?.contact || "-"}
                        </span>
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        Current Appointed Position:{" "}
                        <span className="font-semibold">
                            {formData?.currentAppointmentPositionName || "-"}
                        </span>
                    </p>
                    <div className="border-t border-gray-200 pt-3 text-sm">
                        <p className="text-amber-600 flex items-center gap-1.5 font-semibold">
                            🔑 Temporary Password:{" "}
                            <span className="font-mono">{formData?.defaultPassword || "-"}</span>
                        </p>
                    </div>
                </div>

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
                        onClick={handleDownloadProfile}
                        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                        Download Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
