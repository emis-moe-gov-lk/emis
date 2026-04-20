import {
  FaSchool,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaIdBadge,
} from "react-icons/fa";

const InstitutionCard = ({ institution }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border hover:shadow-lg transition">
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        {institution.name}
      </h2>

      {/* Workplace ID */}
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <FaIdBadge className="mr-2" />
        {institution.workplace_id}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <FaSchool className="mx-auto text-indigo-500 text-xl mb-1" />
          <p className="text-lg font-semibold">
            {institution.institution_count}
          </p>
          <p className="text-xs text-gray-500">Institutions</p>
        </div>

        <div>
          <FaChalkboardTeacher className="mx-auto text-emerald-500 text-xl mb-1" />
          <p className="text-lg font-semibold">{institution.teacher_count}</p>
          <p className="text-xs text-gray-500">Teachers</p>
        </div>

        <div>
          <FaUserGraduate className="mx-auto text-blue-500 text-xl mb-1" />
          <p className="text-lg font-semibold">
            {institution.student_count ?? 0}
          </p>
          <p className="text-xs text-gray-500">Students</p>
        </div>
      </div>
    </div>
  );
};

export default InstitutionCard;
