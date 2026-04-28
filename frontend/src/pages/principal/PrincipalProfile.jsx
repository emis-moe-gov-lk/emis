import TeacherProfile from "@/pages/teacher/TeacherProfile";

const PrincipalProfile = () => {
  return (
    <TeacherProfile
      profileTitle="Principal Profile"
      profileSubtitle="Manage principal profile and settings"
      listPath="/employees/principal"
      listLabel="Back to Principal List"
      profileEndpointPrefix="/principal"
      showApprovalActions={false}
      enablePromotion={false}
    />
  );
};

export default PrincipalProfile;
