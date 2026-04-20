import { NavLink } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";

const InstitutionCreate = () => {
  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <NavLink
          to="/institution"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to List
        </NavLink>
      </div>

      {/* Page title */}
      <h2 className="text-xl font-bold mb-2">Create Institution</h2>
      <p className="text-gray-500 mb-6">
        Institution creation form will be added here.
      </p>

      {/* Form placeholder */}
      <div className="rounded-lg border p-6 bg-white">
        <p className="text-sm text-gray-500">
          Institution creation form will be added here.
        </p>
      </div>
    </div>
  );
};

export default InstitutionCreate;
