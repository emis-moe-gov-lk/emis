import React from "react";
import AlertTeacherList from "./AlertTeacherList";

const PendingVerificationList = () => (
  <AlertTeacherList
    endpoint="/alerts/pending-verification"
    title="Pending Verification"
    subtitle="Teacher profiles awaiting verification"
    color="yellow"
    headerBadge={{ color: "yellow", label: "Pending" }}
    rowBadge={{ color: "warning", label: "Pending" }}
    emptyText="No teachers pending verification."
  />
);

export default PendingVerificationList;
