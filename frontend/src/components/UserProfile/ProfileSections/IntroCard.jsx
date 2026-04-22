import React from "react";

const IntroCard = ({ myprofile, permissions, children }) => {
  const isConfirmed = myprofile?.appointment?.is_confirmed;
  const isVerified = myprofile?.appointment?.is_verified;
  return (
    <div>
      {/* MAIN GRID */}
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        {/* Intro Card */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4">Intro</h2>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Info label="National ID" value={myprofile?.nic} />
              <Info label="Employee ID" value={myprofile?.people_id} />
              <Info
                label="W&OP No"
                value={myprofile?.appointment?.w_op_no || "N/A"}
              />
              <Info
                label="Pay Sheet No"
                value={myprofile?.appointment?.pay_sheet_no || "N/A"}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {!isConfirmed && !isVerified && permissions?.canVerify && (
            <Alert type="warning" text="Profile Not Verified" />
          )}

          {!isConfirmed && isVerified && permissions?.canConfirm && (
            <Alert type="warning" text="Profile Not Confirmed" />
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

/* Reusable Info Component */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase font-bold text-gray-400">{label}</p>
      <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-200">
        {value}
      </p>
    </div>
  );
}

/* Alert Component */
function Alert({ type, text }) {
  const color =
    type === "warning"
      ? "bg-amber-100 text-amber-700"
      : "bg-blue-100 text-blue-700";

  return <div className={`p-4 rounded-lg mb-4 ${color}`}>{text}</div>;
}

export default IntroCard;
