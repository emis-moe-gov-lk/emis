import React from "react";
import AlertTeacherList from "./AlertTeacherList";
import { PermissionGroups } from "@/data/permissionGroups";

const PendingConfirmationList = () => (
  <AlertTeacherList
    endpoint="/alerts/pending-confirmation"
    title="Pending Confirmation"
    subtitle="Teacher profiles awaiting confirmation"
    color="green"
    headerBadge={{ color: "green", label: "New" }}
    rowBadge={{ color: "info", label: "Verified" }}
    emptyText="No teachers pending confirmation."
    viewPermission={PermissionGroups.ALERTS.PROFILE_CONFIRM}
  />
);

export default PendingConfirmationList;
