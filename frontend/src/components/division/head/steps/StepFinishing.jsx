import { HiCheckCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { downloadDivisionAdminProfileDocument } from "@/api/divisionAdminService";
import toast from "react-hot-toast";

export default function StepFinishing({ formData }) {
    const navigate = useNavigate();

    const handleNewRegistration = () => {
        // 🔴 Force full reset of RegAdmin state
        navigate("/employees/division/admin/create", { replace: true });
        window.location.reload();
    };

    const handleDownloadProfile = async () => {
        const peopleId = formData?.people_id || formData?.peopleId || formData?.peopleId;
        if (!peopleId) {
            toast.error("Missing people id for download.");
            return;
        }

        try {
            const response = await downloadDivisionAdminProfileDocument(peopleId);
            const contentType = response.headers?.['content-type'] || 'application/pdf';
            const filenameHeader = response.headers?.['content-disposition'] || '';
            const match = filenameHeader.match(/filename="?([^";]+)"?/i);
            const filename = (match && match[1]) ? match[1] : `admin-profile-${peopleId}.pdf`;

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                a.remove();
            }, 3000);
        } catch (err) {
            console.error(err);
            toast.error('Unable to download profile PDF');
        }
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
                            Admin Registration Successfully
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            Registration has been completed successfully.
                        </p>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="rounded-2xl bg-white border shadow-sm p-6 space-y-3">
                    <p className="text-sm font-medium text-gray-900">
                        Name:{" "}
                        <span className="font-semibold">
                            {formData.fullName || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium text-gray-900">
                        NIC:{" "}
                        <span className="font-semibold">
                            {formData.nic || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium text-gray-900">
                        Email:{" "}
                        <span className="font-semibold">
                            {formData.email || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium text-gray-900">
                        Contact Number:{" "}
                        <span className="font-semibold">
                            {formData.contact || "-"}
                        </span>
                    </p>

                    <p className="text-sm font-medium text-gray-900">
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
