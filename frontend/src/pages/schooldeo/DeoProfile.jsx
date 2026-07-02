import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import {
  HiCalendar,
  HiDocumentText,
  HiPencilAlt,
  HiCheckCircle,
  HiExclamation,
  HiOfficeBuilding,
  HiPlus,
  HiX,
} from "react-icons/hi";
import api from "@/api/axios";
import {
  promoteTeacher,
  saveEducationQualification,
  getEducationQualifications,
  getEducationQualificationGrades,
  addServiceHistoryEntry,
} from "@/api/teacherService";
import { downloadDeoOfficerProfileDocument } from "@/api/deoOfficerService";
import { getEditRequests, reviewEditRequest } from "@/api/userService";
import toast from "react-hot-toast";
import {
  Badge,
  Spinner,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
} from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import { resolveProfileImage } from "@/utils/profileImage";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import TeacherUpdateModal from "@/components/teacher/TeacherUpdateModal";
import { useAuthUser } from "@/context/useAuthUser";
import ProfileDataTable from "@/components/common/ProfileDataTable";
import DarkSafeModal, {
  darkSafeInputClass,
  darkSafeButtonClasses,
  darkSafeTextareaClass,
} from "@/components/common/DarkSafeModal";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import UIButton from "@/components/UiComponents/Button";
import {
  DEFAULT_SERVICE_HISTORY_FORM,
  SERVICE_HISTORY_CHANGE_TYPES,
  ServiceHistoryTab,
  ServiceHistoryModal,
} from "@/components/common/ServiceHistory";
/**
 * DEO Profile (Mirror of Teacher Profile)
 */
const formatDate = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

const QUALIFICATION_OPTIONS = [
  "Doctoral Degree, MD with Board Certification",
  "Master of Philosophy, Masters by Full-time Research, DM",
  "Masters with Coursework and a Research Component",
  "Postgraduate Certificate, Postgraduate Diploma, Masters with Coursework",
  "Honours Bachelors",
  "Bachelor's Degree, Bachelor's Double Major Degree",
  "Higher Diploma",
  "Diploma",
  "Advanced Certificate",
  "Certificate",
];

const GRADE_OPTIONS = [
  "First Class",
  "Second Class Upper",
  "Second Class Lower",
  "Pass",
  "Merit",
  "Distinction",
];

const DEFAULT_QUALIFICATION_FORM = {
  qualification: "Honours Bachelors",
  institution: "",
  effectiveDate: "",
  grade: "",
  additionalDetails: "",
};

const DeoProfile = () => {
  const { id } = useParams();
  const { state: authState, getDecodedIDToken } = useAuthContext();
  const { roles: identityRoles, user: authUser } = useAuthUser();

  const apiEndpoint = `/schooldeo/${id}`;
  const backToPath = "/employees/schooldeo";
  const backLabel = "Back to DEO List";
  const profileLabel = "DEO Profile";
  const loadingLabel = "Loading DEO profile...";

  const findRejectCommentRecords = (payload, teacherId, appointmentId) => {
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

    const matchesTeacher = (item) =>
      [
        item?.people_id,
        item?.employee_id,
        item?.teacher_id,
        item?.teacher_people_id,
      ].some((value) => String(value ?? "") === String(teacherId ?? ""));

    const matchesAppointment = (item) =>
      appointmentId &&
      [
        item?.appointment_id,
        item?.employer_appointment_id,
        item?.teacher_appointment_id,
        item?.id,
      ].some((value) => String(value ?? "") === String(appointmentId));

    const matchedRecords = records.filter(
      (item) => matchesAppointment(item) || matchesTeacher(item),
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

  const extractUpdatedRejectComment = (record) => {
    if (!record) return "";
    return record.update_comments || "";
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

  const normalizeTeacherProfileErrorMessage = (message, fallback) => {
    const normalizedMessage = String(message || "").trim();

    if (
      normalizedMessage ===
      "You can only update teachers within your divisional zone"
    ) {
      return "Development officers can update teacher details only within their relevant zonal area.";
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
        status: "Confirmed",
        revised: false,
      };
    }

    return {
      status: "Pending",
      revised: false,
    };
  };

  const loadRejectComment = useCallback(async (teacherId, appointmentId) => {
    if (!teacherId) return [];

    try {
      const res = await api.get(
        `/employer-appointment-reject-comments/profile/${teacherId}`,
      );

      const matchedRecords = findRejectCommentRecords(
        res.data,
        teacherId,
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
    { id: "service_history", label: "Service History" },
    { id: "wop", label: "W&OP and Payment" },
    { id: "family", label: "Family" },
    { id: "edit", label: "Edit Request" },
  ];

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);

  // State objects
  const [teacher, setTeacher] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [rawQualifications, setRawQualifications] = useState([]);
  const [employment, setEmployment] = useState({});
  const [wopAndPayment, setWopAndPayment] = useState({});
  const [family, setFamily] = useState({ spouses: [] });
  const [editRequests, setEditRequests] = useState([]);
  const [modalSection, setModalSection] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [openPromoteModal, setOpenPromoteModal] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateComment, setUpdateComment] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [showUpdateAction, setShowUpdateAction] = useState(false);
  const [isDownloadingDocument, setIsDownloadingDocument] = useState(false);
  const [isQualificationModalOpen, setIsQualificationModalOpen] =
    useState(false);
  const [qualificationForm, setQualificationForm] = useState(
    DEFAULT_QUALIFICATION_FORM,
  );
  const [qualificationOptions, setQualificationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [isLoadingQualificationOptions, setIsLoadingQualificationOptions] =
    useState(false);
  const [isSavingQualification, setIsSavingQualification] = useState(false);

  const [serviceHistory, setServiceHistory] = useState({ appointments: [], historyEntries: [], currentAppointment: null });
  const [isServiceHistoryModalOpen, setIsServiceHistoryModalOpen] = useState(false);
  const [serviceHistoryForm, setServiceHistoryForm] = useState(DEFAULT_SERVICE_HISTORY_FORM);
  const [isSavingServiceHistory, setIsSavingServiceHistory] = useState(false);

  const loadTeacherProfile = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await api.get(apiEndpoint);
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

      setTeacher({
        id: d.people_id,
        profileImage:
          resolveProfileImage(
            d.profile_image ?? d.profile_picture ?? d.avatar_url ?? d.avatar,
            d.gender_id ?? d.gender?.gender_id,
          ),
        genderId:
          d.gender_id ?? d.gender?.gender_id ??
          (d.gender?.gender_name && d.gender.gender_name.toLowerCase().startsWith("f") ? "G02" : null),
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
        dsOffice: d.ds_office?.dso_name,
        gnDivision: d.gn_division?.gn_division_name,
        postalCode: d.postal_code,
        permanentAddress: [d.address_line1, d.address_line2, d.address_line3]
          .filter(Boolean)
          .join("\n"),

        latitude: d.latitude,
        longitude: d.longitude,
        tempAddress: [d.t_address_line1, d.t_address_line2, d.t_address_line3]
          .filter(Boolean)
          .join("\n"),
        tempPostalCode: d.t_postal_code,
      });

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
          workplaceNameAddress: d.appointment?.workplace?.institution
            ? `[${d.appointment.workplace.institution.census_no}] ${d.appointment.workplace.institution.name}\n${d.appointment.workplace.institution.address}`
            : "",
          createdAt: formatDate(d.appointment?.created_at),
        },
        teachingInfo: {
          teacherCategory: d.teacher?.teacher_category?.name,
          teacherAppointmentType: d.teacher?.teacher_type?.type_name,
          medium: d.teacher?.medium?.name,
          appointmentSubject: d.teacher?.appointment_subject?.name_en,
          mainTeachingSubject: d.teacher?.main_subject?.name_en,
          secondarySubjectOptional: d.teacher?.secondary_subject?.name_en ?? d.teacher?.secondary_subject,
          currentTeachingSubjectAssignedBySchool:
            d.teacher?.current_teaching_subject?.name_en,
        },
        previousService: [],
        previousServiceRelatedInfo: [],
        previousWorkingPlace: [],
      });

      setServiceHistory({
        appointments: Array.isArray(d.my_appointments) ? d.my_appointments : [],
        historyEntries: Array.isArray(d.appointment_history) ? d.appointment_history : [],
        currentAppointment: d.current_appointment ?? null,
      });

      setWopAndPayment({
        wopNo: d.appointment?.w_op_no,
        paySheetNo: d.appointment?.pay_sheet_no,
      });

      if (Array.isArray(d.educationQualifications)) {
        setRawQualifications(d.educationQualifications);
        const mappedQualifications = d.educationQualifications.map((qual) => ({
          id: qual.id,
          degree: qual.qualification?.qualification || qual.qualifications_id || "—",
          institution: qual.institution || "—",
          completionDate: formatDate(qual.effective_date) || "—",
          grade: qual.qualificationGrade?.grade || qual.grade || "—",
          additionalDetails: qual.description || "",
        }));
        setQualifications(mappedQualifications);
      }

      setFamily({ spouses: [] });

      try {
        const erRes = await getEditRequests(d.people_id);
        setEditRequests(erRes.data?.data ?? []);
      } catch {
        setEditRequests([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load ${profileLabel}.`);
    } finally {
      setLoading(false);
    }
  }, [id, apiEndpoint, loadRejectComment, profileLabel]);

  const openQualificationModal = useCallback(() => {
    setQualificationForm(DEFAULT_QUALIFICATION_FORM);
    setIsQualificationModalOpen(true);
  }, []);

  const closeQualificationModal = useCallback(() => {
    setIsQualificationModalOpen(false);
    setQualificationForm(DEFAULT_QUALIFICATION_FORM);
  }, []);

  const handleEditQualification = useCallback((qualificationDisplay) => {
    const qualification = rawQualifications.find(q => q.id === qualificationDisplay.id);
    if (!qualification) {
      toast.error("Unable to load qualification data");
      return;
    }
    const qualName = qualificationOptions.find(
      (q) => q.qualifications_id === qualification.qualifications_id
    )?.qualification || qualification.degree;
    const gradeName = gradeOptions.find(
      (g) => g.grade_id === qualification.grade
    )?.grade || qualification.grade;
    setQualificationForm({
      id: qualification.id,
      qualification: qualName,
      institution: qualification.institution,
      effectiveDate: formatDate(qualification.effective_date) || "",
      grade: gradeName,
      additionalDetails: qualification.additionalDetails || "",
    });
    setIsQualificationModalOpen(true);
  }, [rawQualifications, qualificationOptions, gradeOptions]);

  const handleQualificationFieldChange = useCallback((key, value) => {
    setQualificationForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openServiceHistoryModal = useCallback((appointmentId) => {
    const apptId = appointmentId ?? serviceHistory.appointments.find((a) => a.active_status === 1)?.appointment_id ?? serviceHistory.appointments[0]?.appointment_id ?? "";
    const serviceId = serviceHistory.appointments.find((a) => a.appointment_id === apptId)?.service_id ?? "";
    setServiceHistoryForm({ ...DEFAULT_SERVICE_HISTORY_FORM, appointment_id: apptId, service_id: serviceId });
    setIsServiceHistoryModalOpen(true);
  }, [serviceHistory.appointments]);

  const closeServiceHistoryModal = useCallback(() => {
    setIsServiceHistoryModalOpen(false);
    setServiceHistoryForm(DEFAULT_SERVICE_HISTORY_FORM);
  }, []);

  const handleServiceHistoryFieldChange = useCallback((key, value) => {
    setServiceHistoryForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "appointment_id") {
        const appt = serviceHistory.appointments.find((a) => a.appointment_id === value);
        next.service_id = appt?.service_id ?? "";
        next.rank_id = "";
        next.position_id = "";
      }
      if (key === "zone") {
        next.workplace_id = "";
        next.inst_category = "";
      }
      if (key === "inst_category") {
        next.workplace_id = "";
      }
      return next;
    });
  }, [serviceHistory.appointments]);

  const handleServiceHistorySave = useCallback(async () => {
    const { appointment_id, appoint_date, service_id, rank_id, position_id, office_level_id, workplace_id, updated_type } = serviceHistoryForm;
    if (!appointment_id || !appoint_date || !service_id || !rank_id || !position_id || !workplace_id) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!teacher?.id) {
      toast.error("DEO ID not found.");
      return;
    }
    setIsSavingServiceHistory(true);
    try {
      const response = await addServiceHistoryEntry(teacher.id, {
        appointment_id,
        appoint_date,
        end_date: serviceHistoryForm.end_date || undefined,
        service_id,
        rank_id,
        position_id,
        office_level_id,
        workplace_id,
        updated_type,
        appointment_letter_no: serviceHistoryForm.appointment_letter_no || undefined,
        remarks: serviceHistoryForm.remarks || undefined,
      });
      if (response?.status === "success") {
        toast.success(response?.message || "Service history entry added.");
        closeServiceHistoryModal();
        await loadTeacherProfile();
      } else {
        toast.error(response?.message || "Failed to save entry.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Failed to save entry.");
    } finally {
      setIsSavingServiceHistory(false);
    }
  }, [serviceHistoryForm, teacher?.id, closeServiceHistoryModal, loadTeacherProfile]);

  const handleQualificationSave = useCallback(async () => {
    const qualification = String(qualificationForm.qualification || "").trim();
    const institution = String(qualificationForm.institution || "").trim();
    const effectiveDate = String(qualificationForm.effectiveDate || "").trim();
    const grade = String(qualificationForm.grade || "").trim();
    const additionalDetails = String(qualificationForm.additionalDetails || "").trim();

    if (!qualification || !institution || !effectiveDate || !grade) {
      toast.error("Please complete all required qualification fields.");
      return;
    }
    if (!teacher?.id) {
      toast.error("DEO ID not found.");
      return;
    }
    const selectedQualification = qualificationOptions.find((q) => q.qualification === qualification);
    const qualificationId = selectedQualification?.qualifications_id;
    const selectedGrade = gradeOptions.find((g) => g.grade === grade);
    const gradeId = selectedGrade?.grade_id;

    if (!qualificationId || !gradeId) {
      toast.error("Invalid qualification or grade selected.");
      return;
    }

    setIsSavingQualification(true);
    try {
      const response = await saveEducationQualification(teacher.id, {
        id: qualificationForm.id || undefined,
        qualification: qualificationId,
        institution_university: institution,
        effective_date: effectiveDate,
        grade_result: gradeId,
        additional_details: additionalDetails,
      });

      if (response?.status === "success") {
        toast.success(response?.message || "Qualification saved successfully.");
        closeQualificationModal();
        await loadTeacherProfile();
      } else {
        toast.error(response?.message || "Failed to save qualification.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save qualification.");
    } finally {
      setIsSavingQualification(false);
    }
  }, [qualificationForm, teacher?.id, qualificationOptions, gradeOptions, closeQualificationModal, loadTeacherProfile]);

  const handleDownloadDocument = useCallback(async () => {
    if (!teacher?.id) return;
    setIsDownloadingDocument(true);
    try {
      const response = await downloadDeoOfficerProfileDocument(teacher.id);
      const blob = new Blob([response.data], { type: response.headers?.["content-type"] || "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `deo-profile-${teacher.nic || teacher.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error("Unable to download the document.");
    } finally {
      setIsDownloadingDocument(false);
    }
  }, [teacher?.id, teacher?.nic]);

  useEffect(() => {
    loadTeacherProfile();
  }, [loadTeacherProfile]);

  useEffect(() => {
    const loadQualificationOptions = async () => {
      setIsLoadingQualificationOptions(true);
      try {
        const [qualResponse, gradeResponse] = await Promise.all([
          getEducationQualifications(),
          getEducationQualificationGrades(),
        ]);
        if (qualResponse?.status === "success") setQualificationOptions(qualResponse.data);
        if (gradeResponse?.status === "success") setGradeOptions(gradeResponse.data);
      } catch (error) {
        console.error("Failed to load qualification options:", error);
      } finally {
        setIsLoadingQualificationOptions(false);
      }
    };
    loadQualificationOptions();
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated) return;
    getDecodedIDToken().then((token) => {
      const tokenRoles = token?.roles || token?.groups || token?.role || [];
      const roles = [...(Array.isArray(tokenRoles) ? tokenRoles : [tokenRoles]), ...identityRoles];
      setUserRoles([...new Set(roles)].filter(Boolean).map((role) => String(role).trim().toLowerCase()));
      setCurrentUserName(String(token?.preferred_username || token?.username || authUser?.name || "").trim());
    });
  }, [authState.isAuthenticated, authUser, getDecodedIDToken, identityRoles]);

  const isDevelopmentOfficer = userRoles.includes("development officer") || userRoles.includes("zonal deo");
  const isZonalDirector = userRoles.includes("zonal director");
  const isPendingStatus = !teacher?.confirmed && !teacher?.verified && !teacher?.rejected && !teacher?.revised;
  const isVerifiedStatus = !!teacher?.verified || ["verified", "confirmed"].includes(String(teacher?.status ?? "").trim().toLowerCase());
  const shouldShowVerificationStrip = isDevelopmentOfficer ? !!teacher?.rejected || !!teacher?.revised : isZonalDirector ? (isVerifiedStatus && !teacher?.confirmed && !teacher?.rejected && !teacher?.revised) : !teacher?.confirmed;

  const handleVerify = async () => {
    if (!teacher?.id || isVerifying) return;
    const isUpdateStep = !!teacher?.rejected && !teacher?.revised && (isDevelopmentOfficer || userRoles.includes("super admin"));
    if (isUpdateStep) {
      setUpdateComment("");
      setIsUpdateModalOpen(true);
      return;
    }
    setIsVerifying(true);
    try {
      const endpoint = isVerifiedStatus && !teacher?.rejected ? `/teachers/${teacher.id}/confirm` : `/teachers/${teacher.id}/verify`;
      await api.patch(endpoint);
      await loadTeacherProfile();
      toast.success("Profile status updated successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!teacher?.id || isVerifying) return;
    const trimmedComment = updateComment.trim();
    if (!trimmedComment || !teacher?.rejectCommentId) {
      toast.error("Required information missing.");
      return;
    }
    const formattedComment = currentUserName ? `[${currentUserName}] ${trimmedComment}` : trimmedComment;
    setIsVerifying(true);
    try {
      await api.patch(`/employer-appointment-reject-comments/${teacher.rejectCommentId}`, {
        date: new Date().toISOString().slice(0, 10),
        reject_comment: formattedComment,
        update_comments: formattedComment,
        people_id: teacher?.id,
      });
      await api.patch(`/teachers/${teacher.id}/rejected-status`, {
        people_id: teacher.id,
        appointment_id: teacher.appointmentId,
        profile_status: "revised",
        is_verified: 3,
        update_comments: formattedComment,
      });
      await loadTeacherProfile();
      setIsUpdateModalOpen(false);
      toast.success("Reject details updated successfully.");
    } catch (error) {
      toast.error("Failed to update reject details.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!teacher?.id || isRejecting) return;
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setIsRejecting(true);
    try {
      await api.patch(`/teachers/${teacher.id}/reject`, { reason: trimmedReason, reject_reason: trimmedReason });
      await loadTeacherProfile();
      setIsRejectModalOpen(false);
      toast.success("Profile rejected successfully.");
    } catch (error) {
      toast.error("Failed to reject profile.");
    } finally {
      setIsRejecting(false);
    }
  };

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 m-6">
        <Spinner size="xl" color="info" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">{loadingLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="pt-1">
        <BackToListButton to={backToPath} label={backLabel} />
      </div>

      {isPendingStatus && userRoles.includes("zonal deo") && (
        <div className="rounded-md border border-amber-100 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 flex items-center gap-3">
          <HiOutlineExclamationCircle className="h-5 w-5 text-amber-600" />
          <div className="text-sm font-bold text-amber-900 dark:text-amber-200">Profile Verification Required</div>
        </div>
      )}

      <HeaderStrip teacher={teacher} onDownloadDocument={handleDownloadDocument} isDownloadingDocument={isDownloadingDocument} />

      {shouldShowVerificationStrip && (
      <VerifyStrip
        onVerify={handleVerify}
        onReject={() => setIsRejectModalOpen(true)}
        isVerifying={isVerifying}
        isRejecting={isRejecting}
        isVerified={(teacher.verified || String(teacher?.status ?? "").trim().toLowerCase() === "confirmed") && !teacher.rejected}
        isRejected={teacher.rejected}
        isRevised={teacher.revised}
        rejectReason={teacher.rejectReason}
        showUpdateAction={!!teacher?.rejected && !teacher?.revised}
        confirmOnly={isZonalDirector}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="rounded-2xl surface overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{profileLabel}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Manage DEO profile and settings</div>
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
                      active ? "bg-blue-600 dark:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    ].join(" ")}
                  >
                    <span className={active ? "font-semibold" : "font-medium"}>{t.label}</span>
                    <span className={["h-2 w-2 rounded-full", active ? "bg-white/90" : "bg-transparent"].join(" ")} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9 space-y-5">
          {activeTab === "general" && <GeneralTab teacher={teacher} onEdit={setModalSection} />}
          {activeTab === "qualification" && <QualificationTab qualifications={qualifications} onAddQualification={openQualificationModal} onEditQualification={handleEditQualification} />}
          {activeTab === "employment" && <EmploymentTab employment={employment} onEdit={setModalSection} isDeo={true} />}
          {activeTab === "service_history" && <ServiceHistoryTab serviceHistory={serviceHistory} onAddPosting={openServiceHistoryModal} />}
          {activeTab === "wop" && <WopTab wopAndPayment={wopAndPayment} onEdit={setModalSection} />}
          {activeTab === "family" && <FamilyTab family={family} />}
          {activeTab === "edit" && <EditRequestTab editRequests={editRequests} onReviewed={loadTeacherProfile} />}
        </section>
      </div>

      <TeacherUpdateModal isOpen={modalSection !== null} section={modalSection} teacherId={teacher?.id} onClose={() => setModalSection(null)} onSaved={loadTeacherProfile} />
      <RejectReasonModal isOpen={isRejectModalOpen} reason={rejectReason} isRejecting={isRejecting} onChangeReason={setRejectReason} onClose={() => setIsRejectModalOpen(false)} onSubmit={handleReject} />
      <UpdateCommentModal isOpen={isUpdateModalOpen} existingComment={teacher?.rejectReason} comment={updateComment} isSubmitting={isVerifying} onChangeComment={setUpdateComment} onClose={() => setIsUpdateModalOpen(false)} onSubmit={handleUpdateSubmit} />
      <QualificationAchievementModal isOpen={isQualificationModalOpen} form={qualificationForm} qualificationOptions={qualificationOptions} gradeOptions={gradeOptions} onChange={handleQualificationFieldChange} onClose={closeQualificationModal} onSubmit={handleQualificationSave} isSubmitting={isSavingQualification} isLoadingOptions={isLoadingQualificationOptions} />
      <ServiceHistoryModal isOpen={isServiceHistoryModalOpen} form={serviceHistoryForm} appointments={serviceHistory.appointments} onChange={handleServiceHistoryFieldChange} onClose={closeServiceHistoryModal} onSubmit={handleServiceHistorySave} isSubmitting={isSavingServiceHistory} />
    </div>
  );
};

/* =========================================================
   Reusable blocks
========================================================= */

function ColorSection({ title, color = "blue", right, children }) {
  const headerClass = { slate: "bg-slate-700", teal: "bg-teal-700", indigo: "bg-indigo-700", emerald: "bg-emerald-700", rose: "bg-rose-700", amber: "bg-amber-700", blue: "bg-blue-700" }[color] || "bg-blue-700";
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className={`px-6 py-4 text-white ${headerClass} bg-linear-to-r from-[rgba(255,255,255,0.05)] to-transparent`}>
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
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/field:text-blue-500 transition-colors">{label}</div>
        <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">{value || "—"}</div>
      </div>
    </div>
  );
}

function RoundedActionButton({ icon, children, onClick, variant = "outline" }) {
  const Icon = icon;
  return <UIButton onClick={onClick} variant={variant === "primary" ? "primary" : "secondary"} className="rounded-xl text-sm font-black" icon={Icon ? <Icon className="h-4 w-4" /> : null}>{children}</UIButton>;
}

const tablePrimaryCellClass = "px-5 py-4 font-semibold text-gray-900 dark:text-gray-100";
const tableCellClass = "px-5 py-4 text-gray-700 dark:text-gray-300";
const tableActionButtonClass = "rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-extrabold hover:bg-gray-50 dark:hover:bg-gray-800";

function HeaderStrip({ teacher, onDownloadDocument, isDownloadingDocument }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 shadow-sm bg-white dark:bg-gray-800">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5">
        <div className="p-6 flex flex-col xl:flex-row xl:items-center gap-6">
          <div className="flex items-start gap-4 min-w-0 max-w-2xl">
            <div className="w-1.5 rounded-full bg-blue-600 self-stretch shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 dark:bg-gray-700">
                <img src={resolveProfileImage(teacher?.profileImage, teacher?.genderId)} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{teacher.fullName}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge className="px-4 py-1 font-bold rounded-full text-xs">{teacher.status}</StatusBadge>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span className="font-bold text-blue-700 dark:text-blue-400 tracking-tight">{teacher.service}</span>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <span>NIC</span>
                      <span className="font-mono font-black text-gray-900 dark:text-white">{teacher.nic}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniKey label="Employee ID" value={teacher.employeeId} />
            <MiniKey label="W&OP No" value={teacher.wopNo} />
            <MiniKey label="Pay Sheet No" value={teacher.paySheetNo} />
          </div>
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
            <Can permission={PermissionGroups.SCHOOLS.EDIT_REQUEST}>
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                <HiPencilAlt className="h-4 w-4 text-blue-600" />
                Send Edit Request
              </button>
            </Can>
            <button onClick={onDownloadDocument} disabled={isDownloadingDocument} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 dark:shadow-none">
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
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/key:text-blue-500 dark:text-gray-500 transition-colors">{label}</div>
      <div className="mt-0.5 text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">{value || "—"}</div>
    </div>
  );
}

function VerifyStrip({ onVerify, onReject, isVerifying = false, isRejecting = false, isVerified = false, isRejected = false, isRevised = false, rejectReason = "", showUpdateAction = false, confirmOnly = false, hideRejectAction = false, hideVerifyAction = false }) {
  const title = isRevised ? "Profile Revised" : isRejected ? "Profile Rejected" : isVerified ? "Profile Confirmation Required" : "Profile Verification Required";
  const description = isRevised ? "This profile has been revised after rejection. Review the full comment history and continue the approval flow." : isRejected ? "This profile was rejected. Review the details and verify again to restart the approval process." : isVerified ? "Profile confirmed successfully. Continue with confirmation to complete the appointment process." : "Ensure all details are accurate before proceeding with administration.";
  const buttonLabel = isVerifying ? showUpdateAction ? "Updating..." : confirmOnly || isVerified ? "Confirming..." : "Verifying..." : showUpdateAction ? "Update" : confirmOnly || isVerified ? "Confirm" : "Verify Now";
  const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-600 px-6 py-2 text-sm font-black text-white hover:from-orange-600 hover:to-amber-700 transition-all shadow-md shadow-orange-100 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none";
  const commentEntries = [...new Set(String(rejectReason || "").split(/\n\s*\n/).map((comment) => String(comment || "").trim()).filter(Boolean))];
  return (
    <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 shadow-sm overflow-hidden">
      <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 shrink-0 shadow-inner"><HiExclamation className="h-5 w-5 text-amber-600" /></div>
          <div className="min-w-0 italic">
            <div className="text-sm font-black text-amber-900 dark:text-amber-200">{title}</div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400/80">{description}</div>
            {(isRejected || isRevised) && commentEntries.length > 0 && (
              <div className="mt-2 space-y-2 not-italic">
                {commentEntries.map((comment, index) => (<div key={`${comment}-${index}`} className="text-xs font-bold text-amber-900 dark:text-amber-200 whitespace-pre-wrap">{comment}</div>))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!hideRejectAction && !isVerified && !showUpdateAction && (<button onClick={onReject} type="button" disabled={isRejecting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2 text-sm font-black text-rose-700 hover:bg-rose-50 transition-all shadow-sm disabled:opacity-70"><HiX className="h-4 w-4" />{isRejecting ? "Rejecting..." : "Reject"}</button>)}
          {!hideVerifyAction && (<button onClick={onVerify} disabled={isVerifying} className={buttonClass}><HiCheckCircle className="h-4 w-4" />{buttonLabel}</button>)}
        </div>
      </div>
    </div>
  );
}

function RejectReasonModal({ isOpen, reason, isRejecting = false, onChangeReason, onClose, onSubmit }) {
  if (!isOpen) return null;
  return (<DarkSafeModal isOpen={isOpen} title="Enter Rejection Reason" subtitle="Provide feedback" onClose={onClose} maxWidth="md" footer={<><button type="button" onClick={onClose} disabled={isRejecting} className={darkSafeButtonClasses.cancel}>Cancel</button><button type="button" onClick={onSubmit} disabled={isRejecting} className={darkSafeButtonClasses.danger}>{isRejecting ? "Rejecting..." : "Submit Rejection"}</button></>}><div className="space-y-3"><p className="text-sm text-gray-600 dark:text-gray-400">This reason will be sent with the reject action.</p><textarea value={reason} onChange={(e) => onChangeReason(e.target.value)} rows={5} placeholder="Type the reason..." className={darkSafeTextareaClass} /></div></DarkSafeModal>);
}

function UpdateCommentModal({ isOpen, existingComment = "", comment, isSubmitting = false, onChangeComment, onClose, onSubmit }) {
  if (!isOpen) return null;
  return (<DarkSafeModal isOpen={isOpen} title="Update Reject Details" subtitle="Add feedback" onClose={onClose} maxWidth="md" footer={<><button type="button" onClick={onClose} disabled={isSubmitting} className={darkSafeButtonClasses.cancel}>Cancel</button><button type="button" onClick={onSubmit} disabled={isSubmitting} className={darkSafeButtonClasses.warning}>{isSubmitting ? "Updating..." : "Update Details"}</button></>}><div className="space-y-4"><p className="text-sm text-gray-600 dark:text-gray-400">Existing details are shown below. New comments will be appended.</p>{existingComment && (<div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-3"><div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Existing Reject Details</div><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{existingComment}</p></div>)}<textarea value={comment} onChange={(e) => onChangeComment(e.target.value)} rows={5} placeholder="Type the new comment..." className={darkSafeTextareaClass} /></div></DarkSafeModal>);
}

function GeneralTab({ teacher, onEdit }) {
  return (
    <div className="space-y-5">
      <ColorSection title="Personal & Cultural" color="slate" right={<Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}><RoundedActionButton onClick={() => onEdit("personal")} variant="outline">Edit</RoundedActionButton></Can>}><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><FieldCell label="NIC" value={teacher.nic} /><FieldCell label="title" value={teacher.title_name} /><FieldCell label="Full Name" value={teacher.fullName} /><FieldCell label="Initials" value={teacher.initialsName} /><FieldCell label="Date of Birth" value={teacher.dob} /><FieldCell label="Gender" value={teacher.gender} /><FieldCell label="Religion" value={teacher.religion} /><FieldCell label="Ethnicity" value={teacher.ethnicity} /><FieldCell label="Civil Status" value={teacher.civilStatus} /></div></ColorSection>
      <ColorSection title="Health Information" color="teal" right={<Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}><RoundedActionButton onClick={() => onEdit("health")} variant="outline">Edit</RoundedActionButton></Can>}><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><FieldCell label="Blood Group" value={teacher.bloodGroup || "—"} /><FieldCell label="Overall Condition" value={teacher.overallCondition} /><FieldCell label="Known Problems" value={teacher.knownProblems} /></div></ColorSection>
      <ColorSection title="Contact & Location" color="indigo" right={<Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}><RoundedActionButton onClick={() => onEdit("contact")} variant="outline">Edit</RoundedActionButton></Can>}><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><FieldCell label="Email" value={teacher.email} /><FieldCell label="Phone" value={teacher.phone} /><FieldCell label="District" value={teacher.district} /><FieldCell label="DS Office" value={teacher.dsOffice} /><FieldCell label="GN Division" value={teacher.gnDivision} /><FieldCell label="Postal Code" value={teacher.postalCode} /><div className="md:col-span-2"><FieldCell label="Permanent Address" value={teacher.permanentAddress} /></div><FieldCell label="Latitude" value={teacher.latitude} /><FieldCell label="Longitude" value={teacher.longitude} /></div></ColorSection>
      <ColorSection title="Temporary Location" color="blue" right={<Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}><RoundedActionButton onClick={() => onEdit("temporary")} variant="outline">Edit</RoundedActionButton></Can>}><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div className="md:col-span-2"><FieldCell label="Residential Address" value={teacher.tempAddress || "—"} /></div><FieldCell label="Postal Code" value={teacher.tempPostalCode || "—"} /></div></ColorSection>
    </div>
  );
}

function QualificationTab({ qualifications, onAddQualification, onEditQualification }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Educational qualification</h2><RoundedActionButton icon={HiPlus} onClick={onAddQualification} variant="outline">Add qualification</RoundedActionButton></div>
      <ProfileDataTable columns={[{ key: "degree", label: "Degree / Certificate" }, { key: "institution", label: "Institution" }, { key: "completionDate", label: "Date of Completion" }, { key: "grade", label: "Grade" }, { key: "action", label: "Action" }]} rows={qualifications} emptyMessage="No data" renderRow={(q) => (<tr key={q.id}><td className={tablePrimaryCellClass}>{q.degree}</td><td className={tableCellClass}>{q.institution}</td><td className={tableCellClass}>{q.completionDate}</td><td className={tableCellClass}>{q.grade}</td><td className="px-5 py-4"><UIButton onClick={() => onEditQualification(q)} variant="secondary" size="sm">Edit</UIButton></td></tr>)} />
    </div>
  );
}

function QualificationAchievementModal({ isOpen, form, qualificationOptions, gradeOptions, onChange, onClose, onSubmit, isSubmitting = false, isLoadingOptions = false }) {
  const isEditing = !!form?.id;
  return (
    <DarkSafeModal isOpen={isOpen} title={isEditing ? "Edit Qualification" : "Add Qualification"} subtitle="Ensure dates match certificates." onClose={onClose} maxWidth="lg" footer={<><button type="button" onClick={onClose} disabled={isSubmitting || isLoadingOptions} className={darkSafeButtonClasses.cancel}>Cancel</button><button type="button" onClick={onSubmit} disabled={isSubmitting || isLoadingOptions} className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Achievement"}</button></>}>
      <div className="space-y-5">
        <div><label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">Qualification*</label><select className={darkSafeInputClass} value={form.qualification} onChange={(e) => onChange("qualification", e.target.value)} disabled={isLoadingOptions || isSubmitting}><option value="">Select Qualification</option>{qualificationOptions.map((o) => (<option key={o.qualifications_id} value={o.qualification}>{o.qualification}</option>))}</select></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">Institution*</label><div className="relative"><HiOfficeBuilding className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input className={`${darkSafeInputClass} pl-10`} value={form.institution} onChange={(e) => onChange("institution", e.target.value)} placeholder="e.g. University of Colombo" disabled={isLoadingOptions || isSubmitting} /></div></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">Effective Date*</label><div className="relative"><HiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="date" className={`${darkSafeInputClass} pl-10`} value={form.effectiveDate} onChange={(e) => onChange("effectiveDate", e.target.value)} disabled={isLoadingOptions || isSubmitting} /></div></div>
          <div><label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">Grade*</label><select className={darkSafeInputClass} value={form.grade} onChange={(e) => onChange("grade", e.target.value)} disabled={isLoadingOptions || isSubmitting}><option value="">Select Grade</option>{gradeOptions.map((o) => (<option key={o.grade_id} value={o.grade}>{o.grade}</option>))}</select></div>
        </div>
        <div><label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">Additional Details</label><textarea rows={4} className={darkSafeTextareaClass} value={form.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} placeholder="Notes..." disabled={isLoadingOptions || isSubmitting} /></div>
      </div>
    </DarkSafeModal>
  );
}

function EmploymentTab({ employment, onEdit }) {
  const ecs = employment?.appointmentCurrentStatus || {};
  const ma = employment?.myAppointment || {};
  const prevService = employment?.previousService || [];
  return (
    <div className="space-y-5">
      <ColorSection title="Appointment current status" color="slate" right={<Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}><RoundedActionButton onClick={() => onEdit("current_appointment")} variant="outline">Edit</RoundedActionButton></Can>}><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><FieldCell label="Service" value={ecs.service} /><FieldCell label="Current Service Rank" value={ecs.currentServiceRank} /><FieldCell label="Appointment Date" value={ecs.appointmentDate} /><FieldCell label="Letter No" value={ecs.appointmentNumber} /><FieldCell label="Position" value={ecs.positionDesignation} /><div className="md:col-span-2"><FieldCell label="Workplace" value={ecs.workplaceNameAddress} /></div></div></ColorSection>
      <ColorSection title="My Appointment" color="indigo" right={<Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}><RoundedActionButton onClick={() => onEdit("my_appointment")} variant="outline">Edit</RoundedActionButton></Can>}><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><FieldCell label="Service" value={ma.service} /><FieldCell label="Service Rank" value={ma.serviceRank} /><FieldCell label="Appointment Date" value={ma.appointmentDate} /><FieldCell label="Position" value={ma.positionDesignation} /><div className="md:col-span-2"><FieldCell label="Workplace" value={ma.workplaceNameAddress} /></div></div></ColorSection>
    </div>
  );
}

function WopTab({ wopAndPayment, onEdit }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">W&OP & Payment Details</h2><Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}><RoundedActionButton onClick={() => onEdit("wop")} variant="outline">Edit</RoundedActionButton></Can></div>
      <div className="rounded-2xl border surface p-5 grid grid-cols-1 md:grid-cols-2 gap-3"><FieldCell label="W&OP No" value={wopAndPayment?.wopNo} /><FieldCell label="Pay Sheet No" value={wopAndPayment?.paySheetNo} /></div>
    </div>
  );
}

function FamilyTab({ family }) {
  const spouses = family?.spouses || [];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Spouse List</h2><RoundedActionButton onClick={() => { }} variant="outline">Add spouse</RoundedActionButton></div>
      <ProfileDataTable columns={[{ key: "spouseName", label: "Spouse Names" }, { key: "status", label: "Status" }, { key: "action", label: "Action" }]} rows={spouses} emptyMessage="No spouses added." renderRow={(s) => (<tr key={s.id}><td className={tablePrimaryCellClass}>{s.spouseName}</td><td className={tableCellClass}>{s.status || "—"}</td><td className="px-5 py-4"><UIButton className={tableActionButtonClass} variant="danger" size="sm">Delete</UIButton></td></tr>)} />
    </div>
     
  );
}

function EditRequestTab({ editRequests, onReviewed }) {
  const [reviewing, setReviewing] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openReview = (id, action) => { setReviewing({ id, action }); setComment(""); };

  const handleSubmitReview = async () => {
    if (!comment.trim()) { toast.error("Please add a review comment."); return; }
    setSubmitting(true);
    try {
      await reviewEditRequest(reviewing.id, { status: reviewing.action === "approve" ? "2" : "3", review_comments: comment });
      toast.success(reviewing.action === "approve" ? "Request approved." : "Request rejected.");
      setReviewing(null);
      onReviewed?.();
    } catch { toast.error("Failed to submit review."); }
    finally { setSubmitting(false); }
  };

  if (!editRequests?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-center">
        <p className="text-sm font-bold dark:text-white">No edit requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Edit Requests</h2>
      <div className="space-y-4">
        {editRequests.map((r) => {
          const isPending = r.status_text?.toLowerCase() === "pending";
          return (
            <div key={r.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider">{r.complaint_request_ref}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${isPending ? "bg-amber-500" : r.status_text?.toLowerCase() === "approved" ? "bg-emerald-500" : "bg-red-500"}`}>{r.status_text}</span>
              </div>
              <div className="p-4 space-y-1">
                {r.requested_changes?.subject && <p className="text-sm font-bold text-gray-900 dark:text-white">{r.requested_changes.subject}</p>}
                {r.requested_changes?.complaint && <p className="text-sm text-gray-600 dark:text-gray-400">{r.requested_changes.complaint}</p>}
                <p className="text-[10px] text-gray-400 italic">{r.created_ago}</p>
              </div>
              {r.review_comments && (
                <div className="px-4 pb-4">
                  <p className="text-xs italic text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-3">"{r.review_comments}"</p>
                  {r.reviewer && <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">— {r.reviewer.title?.title_name} {r.reviewer.name_with_initials}</p>}
                </div>
              )}
              {isPending && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
                  {reviewing?.id === r.id ? (
                    <div className="space-y-2">
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={reviewing.action === "approve" ? "Add an approval comment…" : "Reason for rejection…"} rows={3} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={handleSubmitReview} disabled={submitting} className={`flex-1 py-1.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 ${reviewing.action === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}>{submitting ? "Submitting…" : reviewing.action === "approve" ? "Confirm Approve" : "Confirm Reject"}</button>
                        <button onClick={() => setReviewing(null)} className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => openReview(r.id, "approve")} className="flex-1 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">Approve</button>
                      <button onClick={() => openReview(r.id, "reject")} className="flex-1 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">Reject</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeoProfile;
