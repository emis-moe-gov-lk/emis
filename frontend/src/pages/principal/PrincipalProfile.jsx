import { useCallback, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import {
  HiArrowLeft,
  HiDocumentText,
  HiPencilAlt,
  HiCheckCircle,
  HiExclamation,
  HiPlus,
  HiX,
} from "react-icons/hi";
import api from "@/api/axios";
import { downloadPrincipalProfileDocument } from "@/api/principalService";
import toast from "react-hot-toast";
import { Badge, Spinner } from "flowbite-react";
import TeacherUpdateModal from "@/components/teacher/TeacherUpdateModal";
import { useAuthUser } from "@/context/useAuthUser";
import ProfileDataTable from "@/components/common/ProfileDataTable";
import DarkSafeModal, {
  darkSafeButtonClasses,
  darkSafeTextareaClass,
} from "@/components/common/DarkSafeModal";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

/**
 * Principal Profile (Finalized Style)
 * - Professional, colorful, compact (less "cardy"), rounded corners everywhere
 * - Keeps ALL information sections (General / Qualification / Employment / W&OP / Family / Edit Request)
 * - No promotion button (principals are already principals)
 */
const formatDate = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

const PrincipalProfile = () => {
  const { id } = useParams();
  const { state: authState, getDecodedIDToken } = useAuthContext();
  const { roles: identityRoles, user: authUser } = useAuthUser();

  const findRejectCommentRecords = (payload, principalId, appointmentId) => {
    const collectRecords = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.flatMap((item) => collectRecords(item));
      }
      if (typeof value !== "object") return [];

      const directRecord =
        "reject_comment" in value ||
        "update_comments" in value ||
        "update_comments_date" in value ||
        "reject_reason" in value ||
        "review_comments" in value ||
        "reason" in value ||
        "comment" in value ||
        "note" in value;

      const nestedRecords = Object.values(value).flatMap((entry) =>
        Array.isArray(entry) || (entry && typeof entry === "object")
          ? collectRecords(entry)
          : [],
      );

      return directRecord ? [value, ...nestedRecords] : nestedRecords;
    };

    const records = collectRecords(payload);

    const matchesPrincipal = (item) =>
      [
        item?.people_id,
        item?.employee_id,
        item?.principal_id,
        item?.principal_people_id,
      ].some((value) => String(value ?? "") === String(principalId ?? ""));

    const matchesAppointment = (item) =>
      appointmentId &&
      [
        item?.appointment_id,
        item?.employer_appointment_id,
        item?.principal_appointment_id,
        item?.id,
      ].some((value) => String(value ?? "") === String(appointmentId));

    const matchedRecords = records.filter(
      (item) => matchesAppointment(item) || matchesPrincipal(item),
    );

    return matchedRecords.length ? matchedRecords : records.slice(0, 1);
  };

  const extractRejectReason = (record) => {
    if (!record) return "";
    return (
      record.reject_comment ||
      record.reject_reason ||
      record.reason ||
      record.review_comments ||
      record.comment ||
      record.note ||
      ""
    );
  };

  const resolveActorValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value !== "object") return String(value).trim();

    return String(
      value?.name ||
        value?.full_name ||
        value?.username ||
        value?.user_name ||
        value?.email ||
        value?.display_name ||
        value?.first_name ||
        value?.id ||
        "",
    ).trim();
  };

  const extractCommentActor = (record) =>
    resolveActorValue(
      record?.updated_by_name ||
        record?.rejected_by_name ||
        record?.user_name ||
        record?.username ||
        record?.updated_by ||
        record?.rejected_by ||
        record?.created_by_name ||
        record?.created_by,
    );

  const formatCommentEntry = (comment, actor) => {
    const trimmedComment = String(comment || "").trim();
    const trimmedActor = String(actor || "").trim();

    if (!trimmedComment) return "";
    if (!trimmedActor) return trimmedComment;
    if (/^\[[^\]]+\]/.test(trimmedComment)) return trimmedComment;

    return `[${trimmedActor}] ${trimmedComment}`;
  };

  const mergeCommentHistory = (...comments) =>
    [
      ...new Set(
        comments
          .flatMap((comment) => String(comment || "").split(/\n\s*\n/))
          .map((comment) => String(comment || "").trim())
          .filter(Boolean),
      ),
    ].join("\n\n");

  const getUniqueCommentEntries = (...comments) => [
    ...new Set(
      comments
        .flatMap((comment) => String(comment || "").split(/\n\s*\n/))
        .map((comment) => formatCommentDisplay(comment))
        .map((comment) => String(comment || "").trim())
        .filter(Boolean),
    ),
  ];

  const buildCommentHistory = (records = [], fallbackComments = []) => {
    const recordComments = records.flatMap((record) => {
      const actor = extractCommentActor(record);
      return [
        record?.reject_comment,
        record?.reject_reason,
        record?.reason,
        record?.review_comments,
        record?.comment,
        record?.note,
        record?.update_comments,
      ]
        .map((comment) => formatCommentEntry(comment, actor))
        .filter(Boolean);
    });

    return mergeCommentHistory(...recordComments, ...fallbackComments);
  };

  const formatCommentDisplay = (comment) =>
    String(comment || "").replace(/\[([^\[\]\s@]+)@[^\[\]]+\]/g, "[$1]");

  const normalizePrincipalProfileErrorMessage = (message, fallback) => {
    const normalizedMessage = String(message || "").trim();

    if (
      normalizedMessage ===
      "You can only update principals within your divisional zone"
    ) {
      return "Development officers can update principal details only within their relevant zonal area.";
    }

    return normalizedMessage || fallback;
  };

  const resolveProfileStatus = (payload) => {
    const profileStatus = String(
      payload?.profile_status ?? payload?.appointment?.profile_status ?? "",
    )
      .trim()
      .toLowerCase();

    if (
      profileStatus === "revised" ||
      payload?.appointment?.is_verified === 3
    ) {
      return {
        status: "Revised",
        revised: true,
      };
    }

    if (payload?.appointment?.is_confirmed === 1) {
      return {
        status: "Confirmed",
        revised: false,
      };
    }

    if (payload?.appointment?.is_verified === 2) {
      return {
        status: "Rejected",
        revised: false,
      };
    }

    if (payload?.appointment?.is_verified === 1) {
      return {
        status: "Verified",
        revised: false,
      };
    }

    return {
      status: "Pending",
      revised: false,
    };
  };

  const loadRejectComment = useCallback(async (principalId, appointmentId) => {
    if (!principalId) return [];

    try {
      const res = await api.get(
        `/employer-appointment-reject-comments/profile/${principalId}`,
      );

      const matchedRecords = findRejectCommentRecords(
        res.data,
        principalId,
        appointmentId,
      );

      return matchedRecords;
    } catch (error) {
      console.error("Failed to load reject reason.", error);
      return [];
    }
  }, []);

  // Tabs (left menu)
  const tabs = [
    { id: "general", label: "General" },
    { id: "qualification", label: "Qualification" },
    { id: "employment", label: "Employment" },
    { id: "wop", label: "W&OP and Payment" },
    { id: "family", label: "Family" },
    { id: "edit", label: "Edit Request" },
  ];

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);

  // State objects
  const [principal, setPrincipal] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [employment, setEmployment] = useState({});
  const [wopAndPayment, setWopAndPayment] = useState({});
  const [family, setFamily] = useState({ spouses: [] });
  const [editRequests, setEditRequests] = useState([]);
  const [modalSection, setModalSection] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateComment, setUpdateComment] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [showUpdateAction, setShowUpdateAction] = useState(false);
  const [isDownloadingDocument, setIsDownloadingDocument] = useState(false);

  /**
   * Load Principal Profile from API
   */
  const loadPrincipalProfile = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await api.get(`/principal/${id}`);
      if (res.data?.status !== "success") return;

      const d = res.data.data;
      const appointmentId =
        d.appointment?.appointment_id ||
        d.appointment?.employer_appointment_id ||
        d.appointment?.id ||
        null;
      const fallbackRejectReason =
        d.appointment?.reject_comment ||
        d.appointment?.reject_reason ||
        d.appointment?.reason ||
        d.appointment?.review_comments ||
        d.reject_reason ||
        d.reason ||
        d.review_comments ||
        "";
      const fallbackUpdatedComment = d.appointment?.update_comments || "";
      const rejectCommentRecords =
        d.appointment?.is_verified === 2 ||
        d.appointment?.is_verified === 3 ||
        String(d.profile_status ?? d.appointment?.profile_status ?? "")
          .trim()
          .toLowerCase() === "revised"
          ? await loadRejectComment(d.people_id, appointmentId)
          : [];
      const latestRejectCommentRecord = rejectCommentRecords.at(-1) || null;
      const resolvedRejectReason = buildCommentHistory(rejectCommentRecords, [
        fallbackRejectReason,
        fallbackUpdatedComment,
      ]);
      const resolvedStatus = resolveProfileStatus(d);

      /* GENERAL */
      setPrincipal({
        id: d.people_id,
        appointmentId,
        fullName: d.full_name,
        initialsName: d.name_with_initials,
        nic: d.nic,
        employeeId: d.people_id,
        wopNo: d.appointment?.w_op_no,
        paySheetNo: d.appointment?.pay_sheet_no,
        service:
          d.appointment?.service?.service_name ?? d.appointment?.service_id,
        status: resolvedStatus.status,
        profileStatus:
          d.profile_status ?? d.appointment?.profile_status ?? null,
        confirmed: d.appointment?.is_confirmed === 1,
        rejected: d.appointment?.is_verified === 2,
        verified: d.appointment?.is_verified === 1,
        revised: resolvedStatus.revised,
        rejectReason: mergeCommentHistory(
          ...getUniqueCommentEntries(resolvedRejectReason),
        ),
        rejectCommentId:
          latestRejectCommentRecord?.id ||
          latestRejectCommentRecord?.comment_id ||
          latestRejectCommentRecord?.reject_comment_id ||
          null,
        rejectCommentDate:
          latestRejectCommentRecord?.update_comments_date ||
          latestRejectCommentRecord?.date ||
          latestRejectCommentRecord?.reject_date ||
          latestRejectCommentRecord?.comment_date ||
          latestRejectCommentRecord?.updated_at ||
          latestRejectCommentRecord?.created_at ||
          null,

        dob: formatDate(d.date_of_birth),
        title_name: d.title?.title_name,
        gender: d.gender?.gender_name,
        religion: d.religion?.religion_name,
        ethnicity: d.ethnicity?.ethnicity_name,
        civilStatus: d.civil_status?.civil_status_name,

        bloodGroup: d.blood_group?.blood_group,
        overallCondition: d.health_condition ? "Good" : "Issue",
        knownProblems: d.health_problem,

        email: d.email,
        phone: d.phone,

        district: d.district?.district_name,
        gnDivision: d.gn_division?.gn_division_name,
        permanentAddress: [d.address_line1, d.address_line2, d.address_line3]
          .filter(Boolean)
          .join("\n"),

        latitude: d.latitude,
        longitude: d.longitude,
        tempAddress: [d.t_address_line1, d.t_address_line2, d.t_address_line3]
          .filter(Boolean)
          .join("\n"),
      });

      /* EMPLOYMENT */
      setEmployment({
        appointmentCurrentStatus: {
          service:
            d.current_appointment?.service?.service_name ??
            d.current_appointment?.service_id,
          currentServiceRank:
            d.current_appointment?.rank?.name ??
            d.current_appointment?.rank?.rank_name ??
            d.current_appointment?.rank_id,
          appointmentDate: formatDate(d.current_appointment?.appoint_date),
          positionDesignation:
            d.current_appointment?.position?.position_name ??
            d.current_appointment?.position_id,
          workplaceNameAddress: d.current_appointment?.workplace?.institution
            ? `[${d.current_appointment.workplace.institution.census_no}] ${d.current_appointment.workplace.institution.name}\n${d.current_appointment.workplace.institution.address}`
            : "",
          lastUpdated: formatDate(d.appointment?.updated_at),
          appointmentNumber: d.appointment?.appointment_letter_no,
        },
        myAppointment: {
          service:
            d.appointment?.service?.service_name ?? d.appointment?.service_id,
          serviceRank:
            d.appointment?.rank?.name ??
            d.appointment?.rank?.rank_name ??
            d.appointment?.rank_id,
          appointmentDate: formatDate(d.appointment?.first_appointment_date),
          appointmentNumber: d.appointment?.appointment_letter_no,
          positionDesignation:
            d.appointment?.position?.position_name ??
            d.appointment?.position_id,
          createdAt: formatDate(d.appointment?.created_at),
        },
        previousService: [],
        previousServiceRelatedInfo: [],
        previousWorkingPlace: [],
      });

      /* W&OP */
      setWopAndPayment({
        wopNo: d.appointment?.w_op_no,
        paySheetNo: d.appointment?.pay_sheet_no,
      });

      setQualifications([]);
      setFamily({ spouses: [] });
      setEditRequests([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load principal profile.");
    } finally {
      setLoading(false);
    }
  }, [id, loadRejectComment]);

  const handleDownloadDocument = useCallback(async () => {
    if (!principal?.id) return;

    setIsDownloadingDocument(true);
    try {
      const response = await downloadPrincipalProfileDocument(principal.id);
      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `principal-profile-${principal.nic || principal.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to download principal profile document:", error);
      toast.error("Unable to download the principal document.");
    } finally {
      setIsDownloadingDocument(false);
    }
  }, [principal?.id, principal?.nic]);

  useEffect(() => {
    loadPrincipalProfile();
  }, [loadPrincipalProfile]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setUserRoles([]);
      return;
    }

    let ignore = false;

    getDecodedIDToken()
      .then((token) => {
        if (ignore) return;
        const tokenRoles = token?.roles || token?.groups || token?.role || [];
        const resolvedUserName =
          token?.preferred_username ||
          token?.username ||
          token?.user_name ||
          authUser?.name ||
          token?.name ||
          token?.full_name ||
          authUser?.email ||
          "";
        const roles = [
          ...(Array.isArray(tokenRoles) ? tokenRoles : [tokenRoles]),
          ...identityRoles,
        ];
        const normalizedRoles = [...new Set(roles)]
          .filter(Boolean)
          .map((role) => String(role).trim().toLowerCase());
        setUserRoles(normalizedRoles);
        setCurrentUserName(String(resolvedUserName).trim());
      })
      .catch(() => {
        if (!ignore) {
          const normalizedStoredRoles = identityRoles
            .filter(Boolean)
            .map((role) => String(role).trim().toLowerCase());
          setUserRoles(normalizedStoredRoles);
          setCurrentUserName(
            String(authUser?.name || authUser?.email || "").trim(),
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [
    authState.isAuthenticated,
    authUser?.email,
    authUser?.name,
    getDecodedIDToken,
    identityRoles,
  ]);

  const isDevelopmentOfficer =
    userRoles.includes("development officer") ||
    userRoles.includes("zonal deo");
  const isDevelopmentOfficerHead =
    userRoles.includes("development officer head") ||
    userRoles.includes("zonal deo head");
  const isZonalDirector = userRoles.includes("zonal director");
  const isPendingStatus =
    !principal?.confirmed &&
    !principal?.verified &&
    !principal?.rejected &&
    !principal?.revised;
  const shouldShowUpdateOnly =
    isDevelopmentOfficer && !!principal?.rejected && !principal?.revised;
  const isVerifiedStatus =
    !!principal?.verified ||
    String(principal?.status ?? "")
      .trim()
      .toLowerCase() === "verified";
  const shouldShowZonalDirectorConfirmOnly =
    isZonalDirector &&
    isVerifiedStatus &&
    !principal?.confirmed &&
    !principal?.rejected &&
    !principal?.revised;
  const shouldShowVerificationStrip = isDevelopmentOfficer
    ? !!principal?.rejected || !!principal?.revised
    : isZonalDirector
      ? shouldShowZonalDirectorConfirmOnly
      : !principal?.confirmed;
  const isRevisedStatus = !!principal?.revised;

  const handleVerify = async () => {
    if (!principal?.id || isVerifying) return;

    const isUpdateStep = shouldShowUpdateOnly || showUpdateAction;
    const isConfirmStep =
      !isUpdateStep && isVerifiedStatus && !principal?.rejected;

    if (isUpdateStep) {
      setUpdateComment("");
      setIsUpdateModalOpen(true);
      return;
    }

    setIsVerifying(true);
    try {
      const endpoint = isConfirmStep
        ? `/principals/${principal.id}/confirm`
        : `/principals/${principal.id}/verify`;

      await api.patch(endpoint);
      await loadPrincipalProfile();
      setShowUpdateAction(false);

      toast.success(
        isConfirmStep
          ? "Principal appointment confirmed successfully."
          : "Principal verified successfully.",
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (isConfirmStep
          ? "Failed to confirm principal appointment."
          : "Failed to verify principal profile.");
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const closeUpdateModal = (force = false) => {
    if (isVerifying && !force) return;
    setIsUpdateModalOpen(false);
    setUpdateComment("");
  };

  const updateRejectedStatus = async (principalId, appointmentId, comment) => {
    const payload = {
      people_id: principalId,
      appointment_id: appointmentId,
      employer_appointment_id: appointmentId,
      profile_status: "revised",
      is_verified: 3,
      update_comments: comment,
    };
    return api.patch(`/principals/${principalId}/rejected-status`, payload);
  };

  const handleUpdateSubmit = async () => {
    if (!principal?.id || isVerifying) return;

    const trimmedComment = updateComment.trim();
    if (!trimmedComment) {
      toast.error("Please enter an update comment.");
      return;
    }

    if (!principal?.rejectCommentId) {
      toast.error("Reject comment record was not found.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const formattedComment = currentUserName
      ? `[${currentUserName}] ${trimmedComment}`
      : trimmedComment;

    setIsVerifying(true);
    try {
      await api.patch(
        `/employer-appointment-reject-comments/${principal.rejectCommentId}`,
        {
          date: today,
          reject_date: today,
          reject_comment: formattedComment,
          update_comments: formattedComment,
          update_comments_date: today,
          reason: formattedComment,
          reject_reason: formattedComment,
          people_id: principal?.id,
          comment_date: today,
        },
      );

      const statusResponse = await updateRejectedStatus(
        principal.id,
        principal.appointmentId,
        formattedComment,
      );

      const updatedProfileStatus = String(
        statusResponse?.data?.data?.profile_status ??
          statusResponse?.data?.profile_status ??
          statusResponse?.data?.data?.appointment?.profile_status ??
          "",
      )
        .trim()
        .toLowerCase();

      const updatedVerifiedFlag =
        statusResponse?.data?.data?.appointment?.is_verified ??
        statusResponse?.data?.appointment?.is_verified ??
        statusResponse?.data?.data?.is_verified ??
        statusResponse?.data?.is_verified;

      if (
        updatedProfileStatus === "revised" ||
        Number(updatedVerifiedFlag) === 3
      ) {
        setPrincipal((prev) =>
          prev
            ? {
                ...prev,
                status: "Revised",
                profileStatus: "revised",
                revised: true,
                rejected: false,
                verified: false,
                confirmed: false,
              }
            : prev,
        );
      }

      await loadPrincipalProfile();
      setShowUpdateAction(false);
      closeUpdateModal(true);
      toast.success("Reject details updated successfully.");
    } catch (error) {
      const message = normalizePrincipalProfileErrorMessage(
        error?.response?.data?.message,
        "Failed to update reject details.",
      );
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const openRejectModal = () => {
    if (isRejecting) return;
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = (force = false) => {
    if (isRejecting && !force) return;
    setIsRejectModalOpen(false);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!principal?.id || isRejecting) return;

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error("Please enter a rejection reason.");
      return;
    }

    setIsRejecting(true);
    try {
      await api.patch(`/principals/${principal.id}/reject`, {
        reason: trimmedReason,
        reject_reason: trimmedReason,
      });
      await loadPrincipalProfile();
      setShowUpdateAction(false);
      closeRejectModal(true);
      toast.success("Principal profile rejected successfully.");
    } catch (error) {
      const message = normalizePrincipalProfileErrorMessage(
        error?.response?.data?.message,
        "Failed to reject principal profile.",
      );
      toast.error(message);
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 m-6">
        <Spinner size="xl" color="info" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
          Loading principal profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back link (top) */}
      <div className="pt-1">
        <NavLink
          to="/employees/principal"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to Principal List
        </NavLink>
      </div>

      {/* Header strip (finalized style) */}
      <HeaderStrip
        principal={principal}
        onDownloadDocument={handleDownloadDocument}
        isDownloadingDocument={isDownloadingDocument}
      />

      {/* Verify alert strip */}
      {shouldShowVerificationStrip && (
        <VerifyStrip
          onVerify={handleVerify}
          onReject={openRejectModal}
          isVerifying={isVerifying}
          isRejecting={isRejecting}
          isVerified={principal.verified && !principal.rejected}
          isRejected={principal.rejected}
          isRevised={principal.revised}
          rejectReason={principal.rejectReason}
          showUpdateAction={showUpdateAction || shouldShowUpdateOnly}
          confirmOnly={isZonalDirector}
          hideRejectAction={
            isZonalDirector ||
            isDevelopmentOfficer ||
            (isDevelopmentOfficerHead && !isPendingStatus && !isRevisedStatus)
          }
          hideVerifyAction={
            isZonalDirector
              ? false
              : isDevelopmentOfficer
                ? isRevisedStatus
                : isDevelopmentOfficerHead &&
                  !isPendingStatus &&
                  !isRevisedStatus
          }
        />
      )}

      {/* Layout: Left menu + Right content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left menu */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl surface overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Principal Profile
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Manage principal profile and settings
              </div>
            </div>

            <div className="p-2">
              {tabs.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={[
                      "w-full text-left px-4 py-3 rounded-xl text-sm transition flex items-center justify-between group",
                      active
                        ? "bg-blue-600 dark:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    ].join(" ")}
                  >
                    <span className={active ? "font-semibold" : "font-medium"}>
                      {t.label}
                    </span>
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        active ? "bg-white/90" : "bg-transparent",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right content */}
        <section className="lg:col-span-9 space-y-5">
          {activeTab === "general" && (
            <GeneralTab principal={principal} onEdit={setModalSection} />
          )}
          {activeTab === "qualification" && (
            <QualificationTab qualifications={qualifications} />
          )}
          {activeTab === "employment" && (
            <EmploymentTab employment={employment} />
          )}
          {activeTab === "wop" && <WopTab wopAndPayment={wopAndPayment} />}
          {activeTab === "family" && <FamilyTab family={family} />}
          {activeTab === "edit" && (
            <EditRequestTab editRequests={editRequests} />
          )}
        </section>
      </div>

      <TeacherUpdateModal
        isOpen={modalSection !== null}
        section={modalSection}
        teacherId={principal?.id}
        onClose={() => setModalSection(null)}
        onSaved={async (responseData) => {
          const updatedProfileStatus = String(
            responseData?.data?.profile_status ??
              responseData?.profile_status ??
              responseData?.data?.appointment?.profile_status ??
              "",
          )
            .trim()
            .toLowerCase();

          if (updatedProfileStatus === "revised") {
            setPrincipal((prev) =>
              prev
                ? {
                    ...prev,
                    status: "Revised",
                    profileStatus: "revised",
                    revised: true,
                    rejected: false,
                    verified: false,
                    confirmed: false,
                  }
                : prev,
            );
          }

          await loadPrincipalProfile();
          setModalSection(null);
          setShowUpdateAction(false);
        }}
      />

      <RejectReasonModal
        isOpen={isRejectModalOpen}
        reason={rejectReason}
        isRejecting={isRejecting}
        onChangeReason={setRejectReason}
        onClose={closeRejectModal}
        onSubmit={handleReject}
      />

      <UpdateCommentModal
        isOpen={isUpdateModalOpen}
        existingComment={principal?.rejectReason}
        comment={updateComment}
        isSubmitting={isVerifying}
        onChangeComment={setUpdateComment}
        onClose={closeUpdateModal}
        onSubmit={handleUpdateSubmit}
      />
    </div>
  );
};

export default PrincipalProfile;

/* Header strip */
function HeaderStrip({ principal, onDownloadDocument, isDownloadingDocument }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 shadow-sm bg-white dark:bg-gray-800">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5">
        <div className="p-6 flex flex-col xl:flex-row xl:items-center gap-6">
          {/* LEFT: Name + meta */}
          <div className="flex items-start gap-4 min-w-0 max-w-2xl">
            <div className="w-1.5 rounded-full bg-blue-600 self-stretch shadow-[0_0_10px_rgba(37,99,235,0.3)]" />

            <div className="min-w-0">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {principal.fullName}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    color={
                      principal.status === "Confirmed"
                        ? "success"
                        : principal.status === "Rejected"
                          ? "failure"
                          : "warning"
                    }
                    className="px-4 py-1 font-bold rounded-full text-xs"
                  >
                    {principal.status}
                  </Badge>

                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                      {principal.service}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span>NIC</span>
                    <span className="font-mono font-black text-gray-900 dark:text-white">
                      {principal.nic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Key values (Grid) */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniKey label="Employee ID" value={principal.employeeId} />
            <MiniKey label="W&OP No" value={principal.wopNo} />
            <MiniKey label="Pay Sheet No" value={principal.paySheetNo} />
          </div>

          {/* RIGHT: Actions */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
            <Can permission={PermissionGroups.SCHOOLS.EDIT_REQUEST}>
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                <HiPencilAlt className="h-4 w-4 text-blue-600" />
                Send Edit Request
              </button>
            </Can>

            <button
              onClick={onDownloadDocument}
              disabled={isDownloadingDocument}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 dark:shadow-none"
            >
              <HiDocumentText className="h-4 w-4" />
              {isDownloadingDocument ? "Preparing PDF..." : "Get Document"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniKey({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-4 py-3 shadow-sm hover:border-blue-200 dark:hover:border-blue-900/40 transition-colors group/key">
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/key:text-blue-500 dark:text-gray-500 transition-colors">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">
        {value || "—"}
      </div>
    </div>
  );
}

/* Verify strip */
function VerifyStrip({
  onVerify,
  onReject,
  isVerifying = false,
  isRejecting = false,
  isVerified = false,
  isRejected = false,
  isRevised = false,
  rejectReason = "",
  showUpdateAction = false,
  confirmOnly = false,
  hideRejectAction = false,
  hideVerifyAction = false,
}) {
  const title = isRevised
    ? "Profile Revised"
    : isRejected
      ? "Profile Rejected"
      : isVerified
        ? "Profile Confirmation Required"
        : "Profile Verification Required";
  const description = isRevised
    ? "This profile has been revised after rejection. Review the full comment history and continue the approval flow."
    : isRejected
      ? "This profile was rejected. Review the details and verify again to restart the approval process."
      : isVerified
        ? "Profile verified successfully. Continue with confirmation to complete the appointment process."
        : "Ensure all details are accurate before proceeding with administration.";
  const buttonLabel = isVerifying
    ? showUpdateAction
      ? "Updating..."
      : confirmOnly || isVerified
        ? "Confirming..."
        : "Verifying..."
    : showUpdateAction
      ? "Update"
      : confirmOnly || isVerified
        ? "Confirm"
        : "Verify Now";
  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-600 px-6 py-2 text-sm font-black text-white hover:from-orange-600 hover:to-amber-700 transition-all shadow-md shadow-orange-100 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none";
  const commentEntries = [
    ...new Set(
      String(rejectReason || "")
        .split(/\n\s*\n/)
        .map((comment) => String(comment || "").trim())
        .filter(Boolean),
    ),
  ];

  return (
    <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 shadow-sm overflow-hidden">
      <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon + text */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 shrink-0 shadow-inner">
            <HiExclamation className="h-5 w-5 text-amber-600" />
          </div>

          <div className="min-w-0 italic">
            <div className="text-sm font-black text-amber-900 dark:text-amber-200">
              {title}
            </div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400/80">
              {description}
            </div>
            {(isRejected || isRevised) && commentEntries.length > 0 && (
              <div className="mt-2 space-y-2 not-italic">
                {commentEntries.map((comment, index) => (
                  <div
                    key={`${comment}-${index}`}
                    className="text-xs font-bold text-amber-900 dark:text-amber-200 whitespace-pre-wrap"
                  >
                    {comment}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Action */}
        <div className="flex flex-wrap items-center gap-2">
          {!hideRejectAction && !isVerified && !showUpdateAction && (
            <button
              onClick={onReject}
              type="button"
              disabled={isRejecting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2 text-sm font-black text-rose-700 hover:bg-rose-50 transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              <HiX className="h-4 w-4" />
              {isRejecting ? "Rejecting..." : "Reject"}
            </button>
          )}

          {!hideVerifyAction && (
            <button
              onClick={onVerify}
              disabled={isVerifying}
              className={buttonClass}
            >
              <HiCheckCircle className="h-4 w-4" />
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RejectReasonModal({
  isOpen,
  reason,
  isRejecting = false,
  onChangeReason,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  const footerContent = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isRejecting}
        className={darkSafeButtonClasses.cancel}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isRejecting}
        className={darkSafeButtonClasses.danger}
      >
        {isRejecting ? "Rejecting..." : "Submit Rejection"}
      </button>
    </>
  );

  return (
    <DarkSafeModal
      isOpen={isOpen}
      title="Enter Rejection Reason"
      subtitle="Provide feedback"
      onClose={onClose}
      maxWidth="md"
      footer={footerContent}
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This reason will be sent with the reject action.
        </p>
        <textarea
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
          rows={5}
          placeholder="Type the reason for rejecting this profile..."
          className={darkSafeTextareaClass}
        />
      </div>
    </DarkSafeModal>
  );
}

function UpdateCommentModal({
  isOpen,
  existingComment = "",
  comment,
  isSubmitting = false,
  onChangeComment,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  const footerContent = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className={darkSafeButtonClasses.cancel}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={darkSafeButtonClasses.warning}
      >
        {isSubmitting ? "Updating..." : "Update Details"}
      </button>
    </>
  );

  return (
    <DarkSafeModal
      isOpen={isOpen}
      title="Update Reject Details"
      subtitle="Add feedback"
      onClose={onClose}
      maxWidth="md"
      footer={footerContent}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Existing reject details are shown below as read-only. New comments
          will be appended to the reject comment history.
        </p>

        {existingComment && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Existing Reject Details
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {existingComment}
            </p>
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => onChangeComment(e.target.value)}
          rows={5}
          placeholder="Type the new update comment here..."
          className={darkSafeTextareaClass}
        />
      </div>
    </DarkSafeModal>
  );
}

/* Utility components */
function ColorSection({ title, color = "blue", right, children }) {
  const headerClass =
    {
      slate: "bg-slate-700",
      teal: "bg-teal-700",
      indigo: "bg-indigo-700",
      emerald: "bg-emerald-700",
      rose: "bg-rose-700",
      amber: "bg-amber-700",
      blue: "bg-blue-700",
    }[color] || "bg-blue-700";

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div
        className={`px-6 py-4 text-white ${headerClass} bg-linear-to-r from-[rgba(255,255,255,0.05)] to-transparent`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black tracking-tight">{title}</h3>
          {right}
        </div>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldCell({ label, value, span = 1 }) {
  return (
    <div className={span > 1 ? `md:col-span-${span}` : ""}>
      <div className="rounded-2xl border border-gray-50 dark:border-gray-700 px-4 py-3 bg-gray-50/30 dark:bg-gray-900/20 hover:border-blue-100 dark:hover:border-blue-900 transition-colors group/field">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/field:text-blue-500 transition-colors">
          {label}
        </div>
        <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function RoundedActionButton({ icon: Icon, children, onClick, variant = "outline" }) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-200 shadow-sm";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
      : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-800";

  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {Icon ? <Icon className="h-4 w-4 text-blue-500" /> : null}
      {children}
    </button>
  );
}

/* Tabs */
function GeneralTab({ principal, onEdit }) {
  return (
    <div className="space-y-5">
      <ColorSection
        title="Personal & Cultural"
        color="slate"
        right={
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton
              onClick={() => onEdit("personal")}
              variant="outline"
            >
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="NIC" value={principal.nic} />
          <FieldCell label="Title" value={principal.title_name} />
          <FieldCell label="Full Name" value={principal.fullName} />
          <FieldCell label="Initials" value={principal.initialsName} />
          <FieldCell label="Date of Birth" value={principal.dob} />
          <FieldCell label="Gender" value={principal.gender} />
          <FieldCell label="Religion" value={principal.religion} />
          <FieldCell label="Ethnicity" value={principal.ethnicity} />
          <FieldCell label="Civil Status" value={principal.civilStatus} />
        </div>
      </ColorSection>

      <ColorSection
        title="Health Information"
        color="teal"
        right={
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton
              onClick={() => onEdit("health")}
              variant="outline"
            >
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FieldCell label="Blood Group" value={principal.bloodGroup || "—"} />
          <FieldCell
            label="Overall Condition"
            value={principal.overallCondition}
          />
          <FieldCell label="Known Problems" value={principal.knownProblems} />
        </div>
      </ColorSection>

      <ColorSection
        title="Contact & Location"
        color="indigo"
        right={
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton
              onClick={() => onEdit("contact")}
              variant="outline"
            >
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Email" value={principal.email} />
          <FieldCell label="Phone" value={principal.phone} />

          <FieldCell label="District" value={principal.district} />
          <FieldCell label="GN Division" value={principal.gnDivision} />

          <div className="md:col-span-2">
            <FieldCell
              label="Permanent Address"
              value={principal.permanentAddress}
            />
          </div>

          <FieldCell label="Latitude" value={principal.latitude} />
          <FieldCell label="Longitude" value={principal.longitude} />
        </div>
      </ColorSection>

      <ColorSection
        title="Temporary Location"
        color="blue"
        right={
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton
              onClick={() => onEdit("temporary")}
              variant="outline"
            >
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <FieldCell
            label="Residential Address"
            value={principal.tempAddress || "—"}
          />
        </div>
      </ColorSection>
    </div>
  );
}

function QualificationTab({ qualifications }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Educational Qualification
        </h2>
        <RoundedActionButton variant="outline">
          Add qualification
        </RoundedActionButton>
      </div>

      <ProfileDataTable
        columns={[
          { key: "degree", label: "Degree / Certificate" },
          { key: "institution", label: "Institution" },
          { key: "completionDate", label: "Date of Completion" },
          { key: "grade", label: "Grade" },
        ]}
        rows={qualifications}
        emptyMessage="No data"
      />
    </div>
  );
}

function EmploymentTab({ employment }) {
  const ecs = employment?.appointmentCurrentStatus || {};
  const ma = employment?.myAppointment || {};

  return (
    <div className="space-y-5">
      <ColorSection
        title="Appointment Current Status"
        color="slate"
        right={
          <RoundedActionButton onClick={() => {}} variant="outline">
            Edit
          </RoundedActionButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Service" value={ecs.service} />
          <FieldCell
            label="Current Service Rank"
            value={ecs.currentServiceRank}
          />
          <FieldCell label="Appointment Date" value={ecs.appointmentDate} />
          <FieldCell
            label="Appointment/Transfer Letter No"
            value={ecs.appointmentNumber}
          />
          <FieldCell
            label="Position / Designation"
            value={ecs.positionDesignation}
          />
          <FieldCell label="Last Updated" value={ecs.lastUpdated} />

          <div className="md:col-span-2">
            <FieldCell
              label="Workplace Name and Address"
              value={ecs.workplaceNameAddress}
            />
          </div>
        </div>
      </ColorSection>

      <ColorSection
        title="First Appointment"
        color="indigo"
        right={
          <RoundedActionButton onClick={() => {}} variant="outline">
            Edit
          </RoundedActionButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Service" value={ma.service} />
          <FieldCell label="Service Rank" value={ma.serviceRank} />
          <FieldCell label="Appointment Date" value={ma.appointmentDate} />
          <FieldCell label="Appointment Number" value={ma.appointmentNumber} />
          <FieldCell
            label="Position / Designation"
            value={ma.positionDesignation}
          />
          <FieldCell label="Created" value={ma.createdAt} />
        </div>
      </ColorSection>
    </div>
  );
}

function WopTab({ wopAndPayment }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          W&OP & Payment Details
        </h2>
        <RoundedActionButton onClick={() => {}} variant="outline">
          Edit
        </RoundedActionButton>
      </div>

      <div className="rounded-2xl overflow-hidden border surface">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="W&OP No" value={wopAndPayment?.wopNo} />
          <FieldCell label="Pay Sheet No" value={wopAndPayment?.paySheetNo} />
        </div>
      </div>
    </div>
  );
}

function FamilyTab({ family }) {
  const spouses = family?.spouses || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Spouse List
        </h2>
        <RoundedActionButton variant="outline">
          Add Spouse
        </RoundedActionButton>
      </div>

      <ProfileDataTable
        columns={[
          { key: "spouseName", label: "Spouse Name" },
          { key: "dob", label: "Date of Birth" },
          { key: "marriedDate", label: "Married Date" },
          { key: "marriedCfNo", label: "Married CF No." },
        ]}
        rows={spouses}
        emptyMessage="No spouses have been added yet."
      />
    </div>
  );
}

function EditRequestTab({ editRequests }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Edit Request History
        </h2>
      </div>

      <ProfileDataTable
        columns={[
          { key: "requestedDate", label: "Requested Date" },
          { key: "status", label: "Status" },
          { key: "reason", label: "Reason" },
        ]}
        rows={editRequests}
        emptyMessage="No edit requests have been made."
      />
    </div>
  );
}
