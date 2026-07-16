import { HiCheckCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { downloadDivisionAdminProfileDocument } from "@/api/divisionAdminService";
import toast from "react-hot-toast";
import Button from "@/components/UiComponents/Button";

export default function StepFinishing({ formData }) {
    const navigate = useNavigate();

    const handleNewRegistration = () => {
        // 🔴 Force full reset of RegAdmin state
        navigate("/employees/division/admin/create", { replace: true });
        window.location.reload();
    };

    const handleDownloadProfile = async () => {
        const peopleId = formData?.people_id || formData?.peopleId;
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Success Alert */}
            <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-2xl p-6">
                <HiCheckCircle className="text-green-600 dark:text-green-500 w-8 h-8 mt-1 shrink-0" />
                <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300">
                        Admin Registration Successfully
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Registration has been completed successfully.
                    </p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="surface rounded-2xl p-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-gray-100">
                    <strong>Name:</strong> {formData.fullName || "-"}
                </p>

                <p className="text-gray-900 dark:text-gray-100">
                    <strong>NIC:</strong> {formData.nic || "-"}
                </p>

                <p className="text-gray-900 dark:text-gray-100">
                    <strong>Email:</strong> {formData.email || "-"}
                </p>

                <p className="text-gray-900 dark:text-gray-100">
                    <strong>Contact Number:</strong> {formData.contact || "-"}
                </p>

                <p className="text-gray-900 dark:text-gray-100">
                    <strong>Current Appointed Position:</strong> {formData.currentAppointmentPositionName ||
                        formData.currentAppointmentPosition ||
                        "-"}
                </p>

                <p className="text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <strong>Temporary Password:</strong>{" "}
                    <span className="font-mono font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400">
                        {formData.defaultPassword || "-"}
                    </span>
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
                <Button
                    variant="secondary"
                    onClick={handleNewRegistration}
                >
                    New Registration
                </Button>

                <Button
                    variant="primary"
                    onClick={handleDownloadProfile}
                >
                    Download Profile
                </Button>
            </div>
        </div>
    );
}
