import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
    HiArrowLeft,
    HiCheckCircle,
    HiDocumentText,
    HiPencilAlt,
} from "react-icons/hi";

/* ------------------------------
  TAB CONFIG
-------------------------------- */
const TABS = [
    { id: "general", label: "General" },
    { id: "qualification", label: "Qualification" },
    { id: "employment", label: "Employment" },
    { id: "wop", label: "W&OP & Payment" },
    { id: "family", label: "Family" },
    { id: "edit", label: "Edit Requests" },
];

const TeacherProfileCompact = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("general");

    /* ------------------------------
       Dummy Teacher Data (API later)
    -------------------------------- */
    const teacher = {
        id,
        fullName: "Dr. M. Brady",
        initials: "M. Brady",
        service: "SLTS",
        nic: "8606811161V",
        employeeId: "PE2600000009",
        wopNo: "N/A",
        paySheetNo: "N/A",
        verified: false,
        email: "funymohabi@mailinator.com",
        phone: "0711100264",
    };

    return (
        <div className="space-y-4">
            {/* BACK */}
            <NavLink
                to="/teacher"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-ring"
            >
                <HiArrowLeft />
                Back to List
            </NavLink>

            {/* STICKY PROFILE HEADER */}
            <div className="sticky top-16 z-20 rounded-2xl surface shadow-sm">
                <div className="flex flex-wrap items-center gap-4 p-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                        👤
                    </div>

                    <div className="flex-1 min-w-[220px]">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold">{teacher.fullName}</h2>
                            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 dark:bg-red-900/40 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                                ● Not Confirmed
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.service}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ActionButton icon={<HiCheckCircle />} text="Verify" />
                        <ActionButton icon={<HiPencilAlt />} text="Edit" />
                        <ActionButton
                            icon={<HiDocumentText />}
                            text="Document"
                            primary
                        />
                    </div>
                </div>

                {/* ID STRIP */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-gray-200 dark:border-gray-800 px-4 py-3 text-xs">
                    <MiniField label="NIC" value={teacher.nic} />
                    <MiniField label="Employee ID" value={teacher.employeeId} />
                    <MiniField label="W&OP No" value={teacher.wopNo} />
                    <MiniField label="Pay Sheet" value={teacher.paySheetNo} />
                </div>
            </div>

            {/* TAB BAR */}
            <div className="sticky top-[230px] z-10 bg-transparent">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition ${activeTab === tab.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="rounded-2xl surface p-5">
                {activeTab === "general" && <GeneralTab teacher={teacher} />}
                {activeTab === "qualification" && <QualificationTab />}
                {activeTab === "employment" && <EmploymentTab />}
                {activeTab === "wop" && <WopTab />}
                {activeTab === "family" && <FamilyTab />}
                {activeTab === "edit" && <EditRequestTab />}
            </div>
        </div>
    );
};

export default TeacherProfileCompact;

/* ==============================
   SMALL UI COMPONENTS
================================ */
const MiniField = ({ label, value }) => (
    <div className="rounded-lg surface-muted px-3 py-2">
        <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400">{label}</div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">{value || "—"}</div>
    </div>
);

const CompactField = ({ label, value }) => (
    <div className="rounded-lg border surface-muted px-4 py-3">
        <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400">{label}</div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">{value || "—"}</div>
    </div>
);

const ActionButton = ({ icon, text, primary }) => (
    <button
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${primary
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
    >
        {icon}
        {text}
    </button>
);

/* ==============================
   TAB CONTENTS
================================ */
const GeneralTab = ({ teacher }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CompactField label="Full Name" value={teacher.fullName} />
        <CompactField label="Initials" value={teacher.initials} />
        <CompactField label="DOB" value="1988-03-11" />
        <CompactField label="Gender" value="Other" />
        <CompactField label="Religion" value="Other" />
        <CompactField label="Ethnicity" value="Sri Lankan Tamil" />
        <CompactField label="Email" value={teacher.email} />
        <CompactField label="Phone" value={teacher.phone} />
        <CompactField label="Civil Status" value="Divorced" />
    </div>
);

const QualificationTab = () => (
    <div className="text-sm text-gray-600 dark:text-gray-400">
        No qualifications added yet.
    </div>
);

const EmploymentTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompactField label="Service" value="SLTS" />
        <CompactField label="Rank" value="3-II" />
        <CompactField label="Appointment Date" value="1986-12-21" />
        <CompactField label="Designation" value="Teacher" />
        <CompactField
            label="Workplace"
            value="Bogamuwa Central College"
        />
    </div>
);

const WopTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CompactField label="W&OP No" value="N/A" />
        <CompactField label="Pay Sheet No" value="N/A" />
    </div>
);

const FamilyTab = () => (
    <div className="text-sm text-gray-600 dark:text-gray-400">
        No family records available.
    </div>
);

const EditRequestTab = () => (
    <div className="text-sm text-gray-600 dark:text-gray-400">
        No edit requests found.
    </div>
);
