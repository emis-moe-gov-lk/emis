import { Building2, UserCheck, GraduationCap, Settings } from "lucide-react";
import UseCaseCard from "./UseCaseCard";

const UseCasesSection = () => {
  const useCases = [
    {
      icon: Building2,
      title: "School Management",
      description:
        "Handle student admissions, daily attendance, and school records all in one place.",
      bgGradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      icon: UserCheck,
      title: "Teacher Portal",
      description:
        "Manage your classes, assign homework, enter grades, and stay connected with students and parents.",
      bgGradient: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      icon: GraduationCap,
      title: "Student Records",
      description:
        "Track every student's journey from admission to graduation with complete academic history and achievements.",
      bgGradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      icon: Settings,
      title: "Resource Management",
      description:
        "Monitor multiple schools, manage resources, and create reports for education departments and zones.",
      bgGradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for{" "}
            <span className="text-blue-600">Modern Education</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            NEMIS connects students, teachers, parents, and administrators with
            easy-to-use tools built for Sri Lankan schools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {useCases.map((useCase, index) => (
            <UseCaseCard
              key={index}
              icon={useCase.icon}
              title={useCase.title}
              description={useCase.description}
              bgGradient={useCase.bgGradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
