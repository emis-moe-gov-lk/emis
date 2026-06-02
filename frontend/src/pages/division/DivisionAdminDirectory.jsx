import { useMemo, useState } from "react";
import DosHeader from "@/components/dos/DosHeader";
import DosList from "@/components/dos/DosList";

const MOCK_DIVISION_ADMINS = [
  // {
  //   id: 1,
  //   people_id: "DIV-ADM-001",
  //   name_with_initials: "K. A. D. C. Kuruppu",
  //   nic: "741234567V",
  //   email: "charitha.kuruppu@emis.gov.lk",
  //   phone: "0714567890",
  //   office: "Colombo Division Education Office",
  //   address_line1: "Colombo",
  //   confirmed: true,
  //   gender_id: 1,
  //   current_appointment: {
  //     position: { position_name: "Division Administrator" },
  //     service: { service_name: "Sri Lanka Education Administrative Service" },
  //     workplace: { name: "Colombo Division Education Office" },
  //   },
  // },
  // {
  //   id: 2,
  //   people_id: "DIV-ADM-002",
  //   name_with_initials: "M. I. F. Rahma",
  //   nic: "825456789V",
  //   email: "rahma.mif@emis.gov.lk",
  //   phone: "0777123456",
  //   office: "Kandy Division Education Office",
  //   address_line1: "Kandy",
  //   confirmed: true,
  //   gender_id: 2,
  //   current_appointment: {
  //     position: { position_name: "Division Administrator" },
  //     service: { service_name: "Sri Lanka Education Administrative Service" },
  //     workplace: { name: "Kandy Division Education Office" },
  //   },
  // },
  // {
  //   id: 3,
  //   people_id: "DIV-ADM-003",
  //   name_with_initials: "S. T. Sivasubramaniam",
  //   nic: "880987654V",
  //   email: "sivasubramaniam.st@emis.gov.lk",
  //   phone: "0751112223",
  //   office: "Jaffna Division Education Office",
  //   address_line1: "Jaffna",
  //   confirmed: false,
  //   gender_id: 1,
  //   current_appointment: {
  //     position: { position_name: "Assistant Division Director" },
  //     service: { service_name: "Sri Lanka Education Administrative Service" },
  //     workplace: { name: "Jaffna Division Education Office" },
  //   },
  // },
  // {
  //   id: 4,
  //   people_id: "DIV-ADM-004",
  //   name_with_initials: "W. M. N. Bandara",
  //   nic: "790112233V",
  //   email: "nilanthi.bandara@emis.gov.lk",
  //   phone: "0723334445",
  //   office: "Kurunegala Division Education Office",
  //   address_line1: "Kurunegala",
  //   confirmed: true,
  //   gender_id: 2,
  //   current_appointment: {
  //     position: { position_name: "Division Administrator" },
  //     service: { service_name: "Sri Lanka Education Administrative Service" },
  //     workplace: { name: "Kurunegala Division Education Office" },
  //   },
  // }
];

export default function DivisionAdminDirectory() {
  const [search, setSearch] = useState("");

  const employees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_DIVISION_ADMINS;

    return MOCK_DIVISION_ADMINS.filter((employee) => {
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
        isZonalAdmins={true}
        title="Division Administrator Directory"
        description="Manage divisional administrator profiles and records."
        searchPlaceholder="Search Division Administrators"
        createLabel="Add Division Administrator"
      />

      <DosList employees={employees} />
    </div>
  );
}
