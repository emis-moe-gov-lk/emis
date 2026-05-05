import React from "react";
import AlertTeacherList from "./AlertTeacherList";

const PendingConfirmationList = () => (
  <AlertTeacherList
    endpoint="/alerts/pending-confirmation"
    title="Pending Confirmation"
    subtitle="Teacher profiles awaiting confirmation"
    color="green"
    headerBadge={{ color: "green", label: "New" }}
    rowBadge={{ color: "info", label: "Verified" }}
    emptyText="No teachers pending confirmation."
  />
);

export default PendingConfirmationList;
