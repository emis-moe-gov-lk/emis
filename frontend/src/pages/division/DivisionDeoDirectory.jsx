import { useMemo, useState } from "react";
import DosHeader from "@/components/dos/DosHeader";
import DosList from "@/components/dos/DosList";

const MOCK_DIVISION_DEO_OFFICERS = [
  // {
  //   id: 1,
  //   people_id: "DIV-DEO-001",
  //   name_with_initials: "A. Perera",
  //   nic: "901234567V",
  //   email: "a.perera@example.com",
  //   phone: "0771234567",
  //   office: "Kandy Division Office",
  //   address_line1: "Kandy",
  //   confirmed: true,
  //   gender_id: 1,
  //   current_appointment: {
  //     position: { position_name: "Divisional DEO" },
  //     service: { service_name: "Education Administrative Service" },
  //     workplace: { name: "Kandy Division Office" },
  //   },
  // },
  // {
  //   id: 2,
  //   people_id: "DIV-DEO-002",
  //   name_with_initials: "N. Silva",
  //   nic: "933456789V",
  //   email: "n.silva@example.com",
  //   phone: "0772345678",
  //   office: "Gampaha Division Office",
  //   address_line1: "Gampaha",
  //   confirmed: true,
  //   gender_id: 2,
  //   current_appointment: {
  //     position: { position_name: "Divisional DEO" },
  //     service: { service_name: "Education Administrative Service" },
  //     workplace: { name: "Gampaha Division Office" },
  //   },
  // },
  // {
  //   id: 3,
  //   people_id: "DIV-DEO-003",
  //   name_with_initials: "S. Jayasinghe",
  //   nic: "875678912V",
  //   email: "s.jayasinghe@example.com",
  //   phone: "0773456789",
  //   office: "Matara Division Office",
  //   address_line1: "Matara",
  //   confirmed: false,
  //   gender_id: 1,
  //   current_appointment: {
  //     position: { position_name: "Assistant DEO" },
  //     service: { service_name: "Education Administrative Service" },
  //     workplace: { name: "Matara Division Office" },
  //   },
  // },
  // {
  //   id: 4,
  //   people_id: "DIV-DEO-004",
  //   name_with_initials: "P. Fernando",
  //   nic: "920987654V",
  //   email: "p.fernando@example.com",
  //   phone: "0774567890",
  //   office: "Kurunegala Division Office",
  //   address_line1: "Kurunegala",
  //   confirmed: true,
  //   gender_id: 2,
  //   current_appointment: {
  //     position: { position_name: "Divisional DEO" },
  //     service: { service_name: "Education Administrative Service" },
  //     workplace: { name: "Kurunegala Division Office" },
  //   },
  // },
];

export default function DivisionDeoDirectory() {
  const [search, setSearch] = useState("");

  const employees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_DIVISION_DEO_OFFICERS;

    return MOCK_DIVISION_DEO_OFFICERS.filter((employee) => {
      const haystack = [
        employee.name_with_initials,
        employee.nic,
        employee.email,
        employee.phone,
        employee.office,
        employee.address_line1,
        employee.current_appointment?.position?.position_name,
        employee.current_appointment?.service?.service_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search]);

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 mx-auto space-y-6 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <DosHeader
        count={employees.length}
        search={search}
        setSearch={setSearch}
        isZonalAdmins={false}
        title="Division DEO Directory"
        description="Manage divisional DEO profiles and records."
        searchPlaceholder="Search Division DEOs"
        createLabel="Add Division DEO"
      />

      <DosList employees={employees} />
    </div>
  );
}
