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
  downloadTeacherProfileDocument,
  promoteTeacher,
  saveEducationQualification,
  getEducationQualifications,
  getEducationQualificationGrades,
  addServiceHistoryEntry,
} from "@/api/teacherService";
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
 * Teacher Profile (Finalized Style)
 * - Professional, colorful, compact (less “cardy”), rounded corners everywhere
 * - Keeps ALL information sections (General / Qualification / Employment / W&OP / Family / Edit Request)
 * - Ready for API integration later (just replace the dummy state + uncomment fetch section)
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

const TeacherProfile = () => {
  const { id } = useParams();
  const { state: authState, getDecodedIDToken } = useAuthContext();
  const { roles: identityRoles, user: authUser } = useAuthUser();

  const apiEndpoint = `/teacher/${id}`;

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
        status: "Verified",
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

  /**
   * Dummy data (replace with API later)
   * Keep the shape (objects/arrays) so API mapping is easy.
   */
  // const dummy = useMemo(() => {
  //   return {};
  // }, [id]);

  // State objects (easy to replace with API response later)
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

  /**
   * API Integration Hook (later)
   * - When you get API for teacher profile, replace state with response.
   * - Keep this structure for easy mapping.
   */
  const loadTeacherProfile = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await api.get(apiEndpoint);
      console.log("DEBUG: Full API response:", res.data);
      
      if (res.data?.status !== "success") return;

      const d = res.data.data;
      console.log("DEBUG: Teacher data object:", d);
      console.log("DEBUG: educationQualifications from API:", d.educationQualifications);
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

      /* ---------------------------
                 GENERAL
              --------------------------- */
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

      /* ---------------------------
                 EMPLOYMENT
              --------------------------- */
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

      /* ---------------------------
                 W&OP
              --------------------------- */
      setWopAndPayment({
        wopNo: d.appointment?.w_op_no,
        paySheetNo: d.appointment?.pay_sheet_no,
      });

      /* ---------------------------
                 QUALIFICATIONS
              --------------------------- */
      console.log("DEBUG: Raw educationQualifications data:", d.educationQualifications);
      if (Array.isArray(d.educationQualifications)) {
        setRawQualifications(d.educationQualifications);
        const mappedQualifications = d.educationQualifications.map((qual) => {
          const mapped = {
            id: qual.id,
            degree:
              qual.qualification?.qualification ||
              qual.qualifications_id ||
              "—",
            institution: qual.institution || "—",
            completionDate: formatDate(qual.effective_date) || "—",
            grade:
              qual.qualificationGrade?.grade ||
              qual.grade ||
              "—",
            additionalDetails: qual.description || "",
          };
          console.log("DEBUG: Mapped qualification:", qual, "=>", mapped);
          return mapped;
        });
        console.log("DEBUG: Final mapped qualifications:", mappedQualifications);
        setQualifications(mappedQualifications);
      } else {
        console.log("DEBUG: educationQualifications is not an array:", typeof d.educationQualifications);
        setRawQualifications([]);
        setQualifications([]);
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
      toast.error("Failed to load teacher profile.");
    } finally {
      setLoading(false);
    }
  }, [id, loadRejectComment]);

  const openQualificationModal = useCallback(() => {
    setQualificationForm(DEFAULT_QUALIFICATION_FORM);
    setIsQualificationModalOpen(true);
  }, []);

  const closeQualificationModal = useCallback(() => {
    setIsQualificationModalOpen(false);
    setQualificationForm(DEFAULT_QUALIFICATION_FORM);
  }, []);

  const handleEditQualification = useCallback((qualificationDisplay) => {
    // Find the raw qualification data by ID
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
      toast.error("Teacher ID not found.");
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
      const errors = error?.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(error?.response?.data?.message ?? "Failed to save entry.");
      }
    } finally {
      setIsSavingServiceHistory(false);
    }
  }, [serviceHistoryForm, teacher?.id, closeServiceHistoryModal, loadTeacherProfile]);

  const handleQualificationSave = useCallback(async () => {
    const qualification = String(qualificationForm.qualification || "").trim();
    const institution = String(qualificationForm.institution || "").trim();
    const effectiveDate = String(qualificationForm.effectiveDate || "").trim();
    const grade = String(qualificationForm.grade || "").trim();
    const additionalDetails = String(
      qualificationForm.additionalDetails || "",
    ).trim();

    if (!qualification || !institution || !effectiveDate || !grade) {
      toast.error("Please complete all required qualification fields.");
      return;
    }

    if (!teacher?.id) {
      toast.error("Teacher ID not found.");
      return;
    }

    // Find the qualification ID from the selected value
    const selectedQualification = qualificationOptions.find(
      (q) => q.qualification === qualification
    );
    const qualificationId = selectedQualification?.qualifications_id;

    // Find the grade ID from the selected value
    const selectedGrade = gradeOptions.find((g) => g.grade === grade);
    const gradeId = selectedGrade?.grade_id;

    if (!qualificationId) {
      toast.error("Invalid qualification selected.");
      return;
    }

    if (!gradeId) {
      toast.error("Invalid grade selected.");
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
        const isUpdate = qualificationForm.id;
        toast.success(
          response?.message || (isUpdate ? "Qualification updated successfully." : "Qualification added successfully.")
        );
        closeQualificationModal();
        // Reload teacher profile to refresh qualifications list
        await loadTeacherProfile();
      } else {
        toast.error(response?.message || "Failed to save qualification.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Failed to save qualification.";
      console.error("Save qualification error:", error);
      toast.error(errorMessage);
    } finally {
      setIsSavingQualification(false);
    }
  }, [
    qualificationForm,
    teacher?.id,
    qualificationOptions,
    gradeOptions,
    closeQualificationModal,
    loadTeacherProfile,
  ]);

  const handleDownloadDocument = useCallback(async () => {
    if (!teacher?.id) return;

    setIsDownloadingDocument(true);
    try {
      const response = await downloadTeacherProfileDocument(teacher.id);
      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `teacher-profile-${teacher.nic || teacher.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to download teacher profile document:", error);
      toast.error("Unable to download the teacher document.");
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

        if (qualResponse?.status === "success" && qualResponse?.data) {
          setQualificationOptions(qualResponse.data);
        }

        if (gradeResponse?.status === "success" && gradeResponse?.data) {
          setGradeOptions(gradeResponse.data);
        }
      } catch (error) {
        console.error("Failed to load qualification options:", error);
        toast.error("Failed to load qualification options.");
      } finally {
        setIsLoadingQualificationOptions(false);
      }
    };

    loadQualificationOptions();
  }, []);

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
  const isSuperAdmin = userRoles.includes("super admin");
  const isZonalDirector = userRoles.includes("zonal director");
  const isPendingStatus =
    !teacher?.confirmed &&
    !teacher?.verified &&
    !teacher?.rejected &&
    !teacher?.revised;
  const shouldShowUpdateOnly =
    (isDevelopmentOfficer || isSuperAdmin) && !!teacher?.rejected && !teacher?.revised;
  const isVerifiedStatus =
    !!teacher?.verified ||
    String(teacher?.status ?? "")
      .trim()
      .toLowerCase() === "verified";
  const shouldShowZonalDirectorConfirmOnly =
    isZonalDirector &&
    isVerifiedStatus &&
    !teacher?.confirmed &&
    !teacher?.rejected &&
    !teacher?.revised;
  const shouldShowVerificationStrip = isDevelopmentOfficer
    ? !!teacher?.rejected || !!teacher?.revised
    : isZonalDirector
      ? shouldShowZonalDirectorConfirmOnly
      : !teacher?.confirmed;
  const isRevisedStatus = !!teacher?.revised;
  const canPromoteToPrincipal =
    (isSuperAdmin || isZonalDirector) &&
    !!teacher?.verified &&
    !!teacher?.confirmed &&
    !teacher?.rejected &&
    !teacher?.revised &&
    String(teacher?.service ?? "").trim() !== "SER004";

  const handleVerify = async () => {
    if (!teacher?.id || isVerifying) return;

    const isUpdateStep = shouldShowUpdateOnly || showUpdateAction;
    const isConfirmStep =
      !isUpdateStep && isVerifiedStatus && !teacher?.rejected;

    if (isUpdateStep) {
      setUpdateComment("");
      setIsUpdateModalOpen(true);
      return;
    }

    setIsVerifying(true);
    try {
      const endpoint = isConfirmStep
        ? `/teachers/${teacher.id}/confirm`
        : `/teachers/${teacher.id}/verify`;

      await api.patch(endpoint);
      await loadTeacherProfile();
      setShowUpdateAction(false);

      toast.success(
        isConfirmStep
          ? "Teacher appointment confirmed successfully."
          : "Teacher verified successfully.",
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (isConfirmStep
          ? "Failed to confirm teacher appointment."
          : "Failed to verify teacher profile.");
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

  const updateRejectedStatus = async (teacherId, appointmentId, comment) => {
    const payload = {
      people_id: teacherId,
      appointment_id: appointmentId,
      employer_appointment_id: appointmentId,
      profile_status: "revised",
      is_verified: 3,
      update_comments: comment,
    };
    return api.patch(`/teachers/${teacherId}/rejected-status`, payload);
  };

  const handleUpdateSubmit = async () => {
    if (!teacher?.id || isVerifying) return;

    const trimmedComment = updateComment.trim();
    if (!trimmedComment) {
      toast.error("Please enter an update comment.");
      return;
    }

    if (!teacher?.rejectCommentId) {
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
        `/employer-appointment-reject-comments/${teacher.rejectCommentId}`,
        {
          date: today,
          reject_date: today,
          reject_comment: formattedComment,
          update_comments: formattedComment,
          update_comments_date: today,
          reason: formattedComment,
          reject_reason: formattedComment,
          people_id: teacher?.id,
          comment_date: today,
        },
      );

      const statusResponse = await updateRejectedStatus(
        teacher.id,
        teacher.appointmentId,
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
        setTeacher((prev) =>
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

      await loadTeacherProfile();
      setShowUpdateAction(false);
      closeUpdateModal(true);
      toast.success("Reject details updated successfully.");
    } catch (error) {
      const message = normalizeTeacherProfileErrorMessage(
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
    if (!teacher?.id || isRejecting) return;

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error("Please enter a rejection reason.");
      return;
    }

    setIsRejecting(true);
    try {
      await api.patch(`/teachers/${teacher.id}/reject`, {
        reason: trimmedReason,
        reject_reason: trimmedReason,
      });
      await loadTeacherProfile();
      setShowUpdateAction(false);
      closeRejectModal(true);
      toast.success("Teacher profile rejected successfully.");
    } catch (error) {
      const message = normalizeTeacherProfileErrorMessage(
        error?.response?.data?.message,
        "Failed to reject teacher profile.",
      );
      toast.error(message);
    } finally {
      setIsRejecting(false);
    }
  };

  const navigate = useNavigate();

  const openPromoteDialog = () => {
    if (!canPromoteToPrincipal) return;
    setOpenPromoteModal(true);
  };

  const confirmPromote = async () => {
    if (!teacher?.id || isPromoting) return;

    setIsPromoting(true);
    try {
      const res = await promoteTeacher(teacher.id);
      await loadTeacherProfile();
      setOpenPromoteModal(false);
      toast.success("Teacher promoted to principal successfully.");
      navigate(`/employees/principal/${teacher.id}`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to promote teacher to principal.";
      toast.error(message);
    } finally {
      setIsPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 m-6">
        <Spinner size="xl" color="info" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
          Loading teacher profile...
        </p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 m-6">
        <HiOutlineExclamationCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Teacher profile not found or failed to load.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back link (top) */}
      <div className="pt-1">
        <BackToListButton to="/employees/teacher" label="Back to Teacher List" />
      </div>

      {/* Small pending banner for newly created profiles (read-only) - shown only to Zonal DEO */}
      {isPendingStatus && userRoles.includes("zonal deo") && (
        <div className="rounded-md border border-amber-100 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 flex items-center gap-3">
          <HiOutlineExclamationCircle className="h-5 w-5 text-amber-600" />
          <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Profile Verification Required
          </div>
        </div>
      )}
      {/* Header strip (finalized style) */}
      <HeaderStrip
        teacher={teacher}
        onDownloadDocument={handleDownloadDocument}
        isDownloadingDocument={isDownloadingDocument}
      />

      {/* promote button moved into left menu as a tab-style button */}

      {/* Verify alert strip */}
      {teacher && shouldShowVerificationStrip && (
        <VerifyStrip
          onVerify={handleVerify}
          onReject={openRejectModal}
          isVerifying={isVerifying}
          isRejecting={isRejecting}
          isVerified={teacher?.verified && !teacher?.rejected}
          isRejected={teacher?.rejected}
          isRevised={teacher?.revised}
          rejectReason={teacher?.rejectReason}
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

      <Modal
        show={openPromoteModal}
        size="md"
        popup
        onClose={() => setOpenPromoteModal(false)}
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-emerald-500" />

            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
              Promote to Principal
            </h3>

            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to promote this teacher to principal?
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={confirmPromote}
                className="rounded-full px-5 py-2 bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
              >
                Yes, promote
              </Button>

              <Button
                color="alternative"
                onClick={() => setOpenPromoteModal(false)}
                className="rounded-full px-5 py-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Layout: Left menu + Right content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left menu */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl surface overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Teacher Profile
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Manage teacher profile and settings
              </div>
            </div>

            <div className="px-4 py-3">
              <Can permission={PermissionGroups.SCHOOLS.PROMOTE}>
                <button
                  onClick={openPromoteDialog}
                  disabled={isPromoting}
                  className={[
                    "w-full text-left px-4 py-3 rounded-xl text-sm transition flex items-center justify-between group",
                    isPromoting
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-200 shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-md",
                  ].join(" ")}
                >
                  <span className="font-semibold">+ Promote to Principal</span>
                  {/* <span className="h-2 w-2 rounded-full bg-white/90" /> */}
                </button>
              </Can>
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
            <GeneralTab teacher={teacher} onEdit={setModalSection} />
          )}
          {activeTab === "qualification" && (
            <QualificationTab
              qualifications={qualifications}
              onAddQualification={openQualificationModal}
              onEditQualification={handleEditQualification}
            />
          )}
          {activeTab === "employment" && (
            <EmploymentTab employment={employment} onEdit={setModalSection} />
          )}
          {activeTab === "service_history" && (
            <ServiceHistoryTab
              serviceHistory={serviceHistory}
              onAddPosting={openServiceHistoryModal}
            />
          )}
          
          {activeTab === "wop" && <WopTab wopAndPayment={wopAndPayment} onEdit={setModalSection} />}
          {activeTab === "family" && <FamilyTab family={family} />}
          {activeTab === "edit" && (
            <EditRequestTab
              editRequests={editRequests}
              onReviewed={loadTeacherProfile}
            />
          )}
        </section>
      </div>

      <TeacherUpdateModal
        isOpen={modalSection !== null}
        section={modalSection}
        teacherId={teacher?.id}
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
            setTeacher((prev) =>
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

          await loadTeacherProfile();
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
        existingComment={teacher?.rejectReason}
        comment={updateComment}
        isSubmitting={isVerifying}
        onChangeComment={setUpdateComment}
        onClose={closeUpdateModal}
        onSubmit={handleUpdateSubmit}
      />

      <QualificationAchievementModal
        isOpen={isQualificationModalOpen}
        form={qualificationForm}
        qualificationOptions={qualificationOptions}
        gradeOptions={gradeOptions}
        onChange={handleQualificationFieldChange}
        onClose={closeQualificationModal}
        onSubmit={handleQualificationSave}
        isSubmitting={isSavingQualification}
        isLoadingOptions={isLoadingQualificationOptions}
      />

      <ServiceHistoryModal
        isOpen={isServiceHistoryModalOpen}
        form={serviceHistoryForm}
        appointments={serviceHistory.appointments}
        onChange={handleServiceHistoryFieldChange}
        onClose={closeServiceHistoryModal}
        onSubmit={handleServiceHistorySave}
        isSubmitting={isSavingServiceHistory}
      />

    </div>
  );
};

export default TeacherProfile;

/* =========================================================
   Header strip (premium blue style)
========================================================= */

function HeaderStrip({ teacher, onDownloadDocument, isDownloadingDocument }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 shadow-sm bg-white dark:bg-gray-800">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5">
        <div className="p-6 flex flex-col xl:flex-row xl:items-center gap-6">
          {/* LEFT: Avatar + Name + meta */}
          <div className="flex items-start gap-4 min-w-0 max-w-2xl">
            <div className="w-1.5 rounded-full bg-blue-600 self-stretch shadow-[0_0_10px_rgba(37,99,235,0.3)]" />

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 dark:bg-gray-700">
                <img
                  src={resolveProfileImage(
                    teacher?.profileImage,
                    teacher?.genderId,
                  )}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {teacher.fullName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge className="px-4 py-1 font-bold rounded-full text-xs">
                      {teacher.status}
                    </StatusBadge>

                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span className="font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                        {teacher.service}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <span>NIC</span>
                      <span className="font-mono font-black text-gray-900 dark:text-white">
                        {teacher.nic}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Key values (Grid) */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniKey label="Employee ID" value={teacher.employeeId} />
            <MiniKey label="W&OP No" value={teacher.wopNo} />
            <MiniKey label="Pay Sheet No" value={teacher.paySheetNo} />
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

/* =========================================================
   Verify strip (premium styling)
========================================================= */

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

/* =========================================================
   Reusable blocks: Color Section + Field grid
   (Blue Theme defaults)
========================================================= */

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

function RoundedActionButton({ icon, children, onClick, variant = "outline" }) {
  const Icon = icon;
  return (
    <UIButton
      onClick={onClick}
      variant={variant === "primary" ? "primary" : "secondary"}
      className="rounded-xl text-sm font-black"
      icon={Icon ? <Icon className="h-4 w-4" /> : null}
    >
      {children}
    </UIButton>
  );
}

const tablePrimaryCellClass =
  "px-5 py-4 font-semibold text-gray-900 dark:text-gray-100";
const tableCellClass = "px-5 py-4 text-gray-700 dark:text-gray-300";
const tableActionButtonClass =
  "rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-extrabold hover:bg-gray-50 dark:hover:bg-gray-800";

/* =========================================================
   TAB: General (ALL details kept)
========================================================= */

function GeneralTab({ teacher, onEdit }) {
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
          <FieldCell label="NIC" value={teacher.nic} />
          <FieldCell label="title" value={teacher.title_name} />
          <FieldCell label="Full Name" value={teacher.fullName} />
          <FieldCell label="Initials" value={teacher.initialsName} />
          <FieldCell label="Date of Birth" value={teacher.dob} />
          <FieldCell label="Gender" value={teacher.gender} />
          <FieldCell label="Religion" value={teacher.religion} />
          <FieldCell label="Ethnicity" value={teacher.ethnicity} />
          <FieldCell label="Civil Status" value={teacher.civilStatus} />
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
          {/* <div className="rounded-2xl border px-4 py-3 ">
            <div className="text-[11px] font-semibold uppercase tracking-wide ">
              Blood Group
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-rose-700">
              {teacher.bloodGroup || "—"}
          </RoundedActionButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* <div className="rounded-2xl border px-4 py-3 ">
            <div className="text-[11px] font-semibold uppercase tracking-wide ">
              Blood Group
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-rose-700">
              {teacher.bloodGroup || "—"}
            </div>
          </div> */}
          <FieldCell label="Blood Group" value={teacher.bloodGroup || "—"} />
          <FieldCell
            label="Overall Condition"
            value={teacher.overallCondition}
          />
          <FieldCell label="Known Problems" value={teacher.knownProblems} />
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
          <FieldCell label="Email" value={teacher.email} />
          <FieldCell label="Phone" value={teacher.phone} />

          <FieldCell label="District" value={teacher.district} />
          <FieldCell label="DS Office" value={teacher.dsOffice} />
          <FieldCell label="GN Division" value={teacher.gnDivision} />
          <FieldCell label="Postal Code" value={teacher.postalCode} />

          <div className="md:col-span-2">
            <FieldCell
              label="Permanent Address"
              value={teacher.permanentAddress}
            />
          </div>

          <FieldCell label="Latitude" value={teacher.latitude} />
          <FieldCell label="Longitude" value={teacher.longitude} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <FieldCell
              label="Residential Address"
              value={teacher.tempAddress || "—"}
            />
          </div>
          <FieldCell
            label="Postal Code"
            value={teacher.tempPostalCode || "—"}
          />
        </div>
      </ColorSection>
    </div>
  );
}

/* =========================================================
   TAB: Qualification (table kept, ready for API)
========================================================= */

function QualificationTab({ qualifications, onAddQualification, onEditQualification }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Educational qualification
        </h2>
        <RoundedActionButton
          icon={HiPlus}
          onClick={onAddQualification}
          variant="outline"
        >
          Add qualification
        </RoundedActionButton>
      </div>

      <ProfileDataTable
        columns={[
          { key: "degree", label: "Degree / Certificate" },
          { key: "institution", label: "Institution" },
          { key: "completionDate", label: "Date of Completion" },
          { key: "grade", label: "Grade" },
          { key: "action", label: "Action" },
        ]}
        rows={qualifications}
        emptyMessage="No data"
        renderRow={(q) => (
          <tr key={q.id}>
            <td className={tablePrimaryCellClass}>{q.degree}</td>
            <td className={tableCellClass}>{q.institution}</td>
            <td className={tableCellClass}>{q.completionDate}</td>
            <td className={tableCellClass}>{q.grade}</td>
            <td className="px-5 py-4">
              <UIButton onClick={() => onEditQualification(q)} variant="secondary" size="sm">Edit</UIButton>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function QualificationAchievementModal({
  isOpen,
  form,
  qualificationOptions,
  gradeOptions,
  onChange,
  onClose,
  onSubmit,
  isSubmitting = false,
  isLoadingOptions = false,
}) {
  const isEditing = form?.id ? true : false;
  
  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting || isLoadingOptions}
        className={darkSafeButtonClasses.cancel}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || isLoadingOptions}
        className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gray-900/20 transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Qualification" : "Save Achievement")}
      </button>
    </>
  );

  return (
    <DarkSafeModal
      isOpen={isOpen}
      title={isEditing ? "Edit Qualification" : "Add Qualification"}
      subtitle="Ensure dates match your certificates for verification."
      onClose={onClose}
      maxWidth="lg"
      footer={footer}
    >
      <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Qualification
            <span className="ml-0.5 text-rose-500 dark:text-rose-400">*</span>
          </label>
          <select
            className={darkSafeInputClass}
            value={form.qualification}
            onChange={(e) => onChange("qualification", e.target.value)}
            disabled={isLoadingOptions || isSubmitting}
          >
            <option value="">
              {isLoadingOptions ? "Loading..." : "Select Qualification"}
            </option>
            {qualificationOptions.map((option) => (
              <option
                key={option.qualifications_id}
                value={option.qualification}
              >
                {option.qualification}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Institution / University
            <span className="ml-0.5 text-rose-500 dark:text-rose-400">*</span>
          </label>
          <div className="relative">
            <HiOfficeBuilding className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              className={`${darkSafeInputClass} pl-10`}
              value={form.institution}
              onChange={(e) => onChange("institution", e.target.value)}
              placeholder="e.g. University of Colombo"
              disabled={isLoadingOptions || isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Effective Date
              <span className="ml-0.5 text-rose-500 dark:text-rose-400">*</span>
            </label>
            <div className="relative">
              <HiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="date"
                className={`${darkSafeInputClass} pl-10`}
                value={form.effectiveDate}
                onChange={(e) => onChange("effectiveDate", e.target.value)}
                placeholder="mm/dd/yyyy"
                disabled={isLoadingOptions || isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Grade / Result
              <span className="ml-0.5 text-rose-500 dark:text-rose-400">*</span>
            </label>
            <select
              className={darkSafeInputClass}
              value={form.grade}
              onChange={(e) => onChange("grade", e.target.value)}
              disabled={isLoadingOptions || isSubmitting}
            >
              <option value="">
                {isLoadingOptions ? "Loading..." : "Select Grade"}
              </option>
              {gradeOptions.map((option) => (
                <option key={option.grade_id} value={option.grade}>
                  {option.grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Additional Details
          </label>
          <textarea
            rows={4}
            className={darkSafeTextareaClass}
            value={form.additionalDetails}
            onChange={(e) => onChange("additionalDetails", e.target.value)}
            placeholder="Major subjects, thesis title, or special awards..."
            disabled={isLoadingOptions || isSubmitting}
          />
        </div>
      </div>
    </DarkSafeModal>
  );
}

/* =========================================================
   TAB: Employment (ALL sections kept)
========================================================= */

function EmploymentTab({ employment, onEdit }) {
  const ecs = employment?.appointmentCurrentStatus || {};
  const ma = employment?.myAppointment || {};
  const ti = employment?.teachingInfo || {};
  const prevService = employment?.previousService || [];
  const prevServiceInfo = employment?.previousServiceRelatedInfo || [];
  const prevWork = employment?.previousWorkingPlace || [];

  return (
    <div className="space-y-5">
      <ColorSection
        title="Appointment current status"
        color="slate"
        right={
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton onClick={() => onEdit("current_appointment")} variant="outline">
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-gray-600" />
            {ecs.ageTag || "—"}
          </span>
        </div>

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
              label="Workplace name and address"
              value={ecs.workplaceNameAddress}
            />
          </div>
        </div>
      </ColorSection>

      <ColorSection
        title="My Appointment"
        color="indigo"
        right={
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton onClick={() => onEdit("my_appointment")} variant="outline">
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-gray-600" />
            {ma.ageTag || "—"}
          </span>
        </div>

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
          <div className="md:col-span-2">
            <FieldCell
              label="Workplace name and address"
              value={ma.workplaceNameAddress}
            />
          </div>
        </div>
      </ColorSection>

      <ColorSection
        title="Teaching Info"
        color="teal"
        right={
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton onClick={() => onEdit("teaching_info")} variant="outline">
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-teal-700" />
            {ti.serviceTag || "—"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Teacher Catogary" value={ti.teacherCategory} />
          <FieldCell
            label="Teacher Appointment Type"
            value={ti.teacherAppointmentType}
          />
          <FieldCell label="Medium" value={ti.medium} />
          <FieldCell
            label="Appointment Subject"
            value={ti.appointmentSubject}
          />
          <FieldCell
            label="Main Teaching Subject"
            value={ti.mainTeachingSubject}
          />
          <FieldCell
            label="Secondary Subject (Optional)"
            value={ti.secondarySubjectOptional}
          />
          <div className="md:col-span-2">
            <FieldCell
              label="Current Teaching Subject (Assigned by school)"
              value={ti.currentTeachingSubjectAssignedBySchool}
            />
          </div>
        </div>
      </ColorSection>

      {/* Previous Service */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Previous Service
        </h2>
        <RoundedActionButton icon={HiPlus} onClick={() => { }} variant="outline">
          Previous services
        </RoundedActionButton>
      </div>

      <ProfileDataTable
        columns={[
          { key: "service", label: "Service" },
          { key: "gradeRank", label: "Grade/Rank" },
          { key: "appointmentDate", label: "Appointment Date" },
          { key: "retainmentDate", label: "Retainment Date" },
          { key: "status", label: "Status" },
          { key: "action", label: "Action" },
        ]}
        rows={prevService}
        emptyMessage="No previous service records found."
        renderRow={(row) => (
          <tr key={row.id}>
            <td className={tablePrimaryCellClass}>{row.service}</td>
            <td className={tableCellClass}>{row.gradeRank}</td>
            <td className={tableCellClass}>{row.appointmentDate}</td>
            <td className={tableCellClass}>{row.retainmentDate}</td>
            <td className="px-5 py-4">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                ✓ {row.status}
              </span>
            </td>
            <td className="px-5 py-4">
              <UIButton className={tableActionButtonClass} variant="danger" size="sm">Delete</UIButton>
            </td>
          </tr>
        )}
      />

      {/* Previous Service-related information */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Previous Service-related information
        </h2>
        <RoundedActionButton icon={HiPlus} onClick={() => { }} variant="outline">
          Previous Record
        </RoundedActionButton>
      </div>

      <ProfileDataTable
        columns={[
          { key: "position", label: "Position" },
          { key: "service", label: "Service" },
          { key: "gradeRank", label: "Grade/Rank" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "action", label: "Action" },
        ]}
        rows={prevServiceInfo}
        emptyMessage="No previous service records found."
        renderRow={(row) => (
          <tr key={row.id}>
            <td className={tablePrimaryCellClass}>{row.position}</td>
            <td className={tableCellClass}>{row.service}</td>
            <td className={tableCellClass}>{row.gradeRank}</td>
            <td className={tableCellClass}>{row.startDate}</td>
            <td className={tableCellClass}>{row.endDate}</td>
            <td className="px-5 py-4">
              <UIButton className={tableActionButtonClass} variant="danger" size="sm">Delete</UIButton>
            </td>
          </tr>
        )}
      />

      {/* Previous working place */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Previous working place
        </h2>
      </div>

      <ProfileDataTable
        columns={[
          { key: "workingPlaceAddress", label: "Working Place & Address" },
          { key: "appointedDate", label: "Appointed Date" },
          { key: "releaseDate", label: "Release Date" },
          { key: "servicePeriod", label: "Service Period" },
          { key: "action", label: "Action" },
        ]}
        rows={prevWork}
        emptyMessage="No previous working place records found."
        renderRow={(row) => (
          <tr key={row.id}>
            <td className={`${tablePrimaryCellClass} whitespace-pre-line`}>
              {row.workingPlaceAddress}
            </td>
            <td className={tableCellClass}>{row.appointedDate}</td>
            <td className={tableCellClass}>{row.releaseDate}</td>
            <td className={tableCellClass}>{row.servicePeriod}</td>
            <td className="px-5 py-4">
              <UIButton className={tableActionButtonClass} variant="danger" size="sm">Delete</UIButton>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* =========================================================
   TAB: W&OP & Payment
========================================================= */

function WopTab({ wopAndPayment, onEdit }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          W&OP & Payment Details
        </h2>
        <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
          <RoundedActionButton onClick={() => onEdit("wop")} variant="outline">
            Edit
          </RoundedActionButton>
        </Can>
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

/* =========================================================
   TAB: Family (Spouse list table)
========================================================= */

function FamilyTab({ family }) {
  const spouses = family?.spouses || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Spouse List
        </h2>
        <RoundedActionButton onClick={() => { }} variant="outline">
          Add spouse
        </RoundedActionButton>
      </div>

      <ProfileDataTable
        columns={[
          { key: "spouseName", label: "Spouse Names" },
          { key: "dob", label: "Date of Birth" },
          { key: "marriedDate", label: "Married Date" },
          { key: "marriedCfNo", label: "Married CF No." },
          { key: "status", label: "Status" },
          { key: "action", label: "Action" },
        ]}
        rows={spouses}
        emptyMessage="No spouses have been added yet."
        emptyCellClassName="px-5 py-10 text-center text-gray-600 dark:text-gray-400"
        renderRow={(s) => (
          <tr key={s.id}>
            <td className={tablePrimaryCellClass}>{s.spouseName}</td>
            <td className={tableCellClass}>{s.dob}</td>
            <td className={tableCellClass}>{s.marriedDate}</td>
            <td className={tableCellClass}>{s.marriedCfNo}</td>
            <td className="px-5 py-4">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                {s.status || "—"}
              </span>
            </td>
            <td className="px-5 py-4">
              <UIButton className={tableActionButtonClass} variant="danger" size="sm">Delete</UIButton>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* =========================================================
   TAB: Edit Request
========================================================= */

function EditRequestTab({ editRequests, onReviewed }) {
  const [reviewing, setReviewing] = useState(null); // { id, action: 'approve'|'reject' }
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openReview = (id, action) => {
    setReviewing({ id, action });
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error("Please add a review comment.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewEditRequest(reviewing.id, {
        status: reviewing.action === "approve" ? "2" : "3",
        review_comments: comment,
      });
      toast.success(
        reviewing.action === "approve" ? "Request approved." : "Request rejected.",
      );
      setReviewing(null);
      onReviewed?.();
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!editRequests?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-center">
        <p className="text-sm font-bold dark:text-white">No edit requests found.</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          No requests have been submitted for this profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
        Edit Requests
      </h2>

      <div className="space-y-4">
        {editRequests.map((r) => {
          const isPending = r.status_text?.toLowerCase() === "pending";
          return (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider">
                  {r.complaint_request_ref}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded text-white ${
                    isPending
                      ? "bg-amber-500"
                      : r.status_text?.toLowerCase() === "approved"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                  }`}
                >
                  {r.status_text}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-1">
                {r.requested_changes?.subject && (
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {r.requested_changes.subject}
                  </p>
                )}
                {r.requested_changes?.complaint && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {r.requested_changes.complaint}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 italic">{r.created_ago}</p>
              </div>

              {/* Review comment if exists */}
              {r.review_comments && (
                <div className="px-4 pb-4">
                  <p className="text-xs italic text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                    "{r.review_comments}"
                  </p>
                  {r.reviewer && (
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                      — {r.reviewer.title?.title_name} {r.reviewer.name_with_initials}
                    </p>
                  )}
                </div>
              )}

              {/* Approve / Reject for pending */}
              {isPending && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
                  {reviewing?.id === r.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={
                          reviewing.action === "approve"
                            ? "Add an approval comment…"
                            : "Reason for rejection…"
                        }
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitReview}
                          disabled={submitting}
                          className={`flex-1 py-1.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                            reviewing.action === "approve"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {submitting
                            ? "Submitting…"
                            : reviewing.action === "approve"
                              ? "Confirm Approve"
                              : "Confirm Reject"}
                        </button>
                        <button
                          onClick={() => setReviewing(null)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openReview(r.id, "approve")}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openReview(r.id, "reject")}
                        className="flex-1 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        Reject
                      </button>
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

/* =========================================================
   TAB: Service History — components imported from @/components/common/ServiceHistory
========================================================= */

function _placeholder_UNUSED({ serviceHistory, onAdd }) {
  const { appointments = [], historyEntries = [], currentAppointment } = serviceHistory;

  const changeTypeLabel = (type) => {
    const found = SERVICE_HISTORY_CHANGE_TYPES.find((t) => t.value === String(type));
    return found?.label ?? "—";
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const da = new Date(a.first_appointment_date ?? 0);
    const db = new Date(b.first_appointment_date ?? 0);
    return da - db;
  });

  const entriesForAppointment = (appointmentId) =>
    historyEntries
      .filter((e) => e.appointment_id === appointmentId)
      .sort((a, b) => new Date(b.appoint_date ?? 0) - new Date(a.appoint_date ?? 0));

  const institutionName = (entry) =>
    entry?.workplace?.institution?.name ?? entry?.workplace_id ?? "—";

  const formatPeriod = (start, end) => {
    const s = start ? String(start).slice(0, 10) : null;
    const e = end ? String(end).slice(0, 10) : null;
    if (!s) return "—";
    return e ? `${s} — ${e}` : `${s} — Present`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Service History
        </h2>
        <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
          <RoundedActionButton icon={HiPlus} onClick={onAdd} variant="outline">
            Add Posting
          </RoundedActionButton>
        </Can>
      </div>

      {sortedAppointments.length === 0 && (
        <div className="rounded-2xl border surface p-6 text-sm text-gray-500 dark:text-gray-400">
          No service records found.
        </div>
      )}

      {sortedAppointments.map((appt) => {
        const isActive = appt.active_status === 1;
        const serviceName = appt.service?.service_name ?? appt.service_id ?? "—";
        const historyRows = entriesForAppointment(appt.appointment_id);

        return (
          <div
            key={appt.appointment_id}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Service block header */}
            <div className={[
              "flex items-center justify-between px-5 py-3",
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/40"
                : "bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700",
            ].join(" ")}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                  {serviceName}
                </span>
                <span className={[
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
                ].join(" ")}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Since {String(appt.first_appointment_date ?? "—").slice(0, 10)}
              </span>
            </div>

            {/* Postings within this service */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {/* Current posting — only for active appointment */}
              {isActive && currentAppointment && (
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {institutionName(currentAppointment)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-400">
                        Current
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{currentAppointment.rank?.name ?? currentAppointment.rank?.rank_name ?? currentAppointment.rank_id ?? "—"}</span>
                      <span>{currentAppointment.position?.position_name ?? currentAppointment.position_id ?? "—"}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatPeriod(currentAppointment.appoint_date, null)}
                  </div>
                </div>
              )}

              {/* Historical postings */}
              {historyRows.map((entry) => (
                <div key={entry.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {institutionName(entry)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{entry.rank?.name ?? entry.rank?.rank_name ?? entry.rank_id ?? "—"}</span>
                      <span>{entry.position?.position_name ?? entry.position_id ?? "—"}</span>
                      <span className="text-gray-400 dark:text-gray-500">{changeTypeLabel(entry.updated_type)}</span>
                      {entry.appointment_letter_no && (
                        <span className="font-mono text-gray-400 dark:text-gray-500">
                          {entry.appointment_letter_no}
                        </span>
                      )}
                    </div>
                    {entry.remarks && (
                      <div className="mt-1 text-xs italic text-gray-400 dark:text-gray-500">
                        {entry.remarks}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatPeriod(entry.appoint_date, entry.end_date)}
                  </div>
                </div>
              ))}

              {/* First appointment row (always show as anchor) */}
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-2 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {appt.workplace?.institution?.name ?? appt.workplace_id ?? "—"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      First Appointment
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>{appt.rank?.name ?? appt.rank?.rank_name ?? appt.rank_id ?? "—"}</span>
                    <span>{appt.position?.position_name ?? appt.position_id ?? "—"}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {String(appt.first_appointment_date ?? "—").slice(0, 10)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   MODAL: Add Service History Entry — imported from @/components/common/ServiceHistory
========================================================= */

function _ServiceHistoryModal_REMOVED({
  isOpen,
  form,
  appointments = [],
  onChange,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({ services: [], ranks: [], positions: [], zones: [], instCategories: [], institutions: [] });
  const [loadingFormData, setLoadingFormData] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingFormData(true);
    api.get("/register/appointment-form-data", {
      params: { service: form.service_id || "", ins_cat: form.inst_category || "", zone: form.zone || "", office_level: "OLID006" },
    })
      .then((res) => {
        const d = res.data;
        setFormData({
          services: d.service ?? [],
          ranks: d.serviceRanks ?? [],
          positions: d.positions ?? [],
          zones: d.zonalEducationOffices ?? [],
          instCategories: d.institutionCategory ?? [],
          institutions: d.institutions ?? [],
        });
      })
      .catch(() => {})
      .finally(() => setLoadingFormData(false));
  }, [isOpen, form.service_id, form.zone, form.inst_category]);

  if (!isOpen) return null;

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className={darkSafeButtonClasses.secondary}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || loadingFormData}
        className={darkSafeButtonClasses.primary}
      >
        {isSubmitting ? "Saving..." : "Save Entry"}
      </button>
    </>
  );

  return (
    <DarkSafeModal
      isOpen={isOpen}
      title="Add Service History Entry"
      onClose={onClose}
      footer={footer}
      size="lg"
    >
      <div className="space-y-4 py-1">
        {appointments.length > 1 && (
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Service / Appointment <span className="text-red-500">*</span>
            </label>
            <select
              value={form.appointment_id}
              onChange={(e) => onChange("appointment_id", e.target.value)}
              className={darkSafeInputClass}
            >
              <option value="">Select service</option>
              {appointments.map((a) => (
                <option key={a.appointment_id} value={a.appointment_id}>
                  {a.service?.service_name ?? a.service_id} {a.active_status === 1 ? "(Active)" : "(Inactive)"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.appoint_date}
              onChange={(e) => onChange("appoint_date", e.target.value)}
              className={darkSafeInputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              To Date <span className="text-gray-400">(leave blank if current)</span>
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => onChange("end_date", e.target.value)}
              className={darkSafeInputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Zone <span className="text-red-500">*</span>
            </label>
            <select
              value={form.zone}
              onChange={(e) => onChange("zone", e.target.value)}
              className={darkSafeInputClass}
              disabled={loadingFormData}
            >
              <option value="">Select zone</option>
              {formData.zones.map((z) => (
                <option key={z.workplace_id} value={z.workplace_id}>
                  {z.name ?? z.office_name ?? z.workplace_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Institution Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.inst_category}
              onChange={(e) => onChange("inst_category", e.target.value)}
              className={darkSafeInputClass}
              disabled={!form.zone || loadingFormData}
            >
              <option value="">Select category</option>
              {formData.instCategories.map((c) => (
                <option key={c.institution_category_id ?? c.id} value={c.institution_category_id ?? c.id}>
                  {c.institution_category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            School / Workplace <span className="text-red-500">*</span>
          </label>
          <select
            value={form.workplace_id}
            onChange={(e) => onChange("workplace_id", e.target.value)}
            className={darkSafeInputClass}
            disabled={!form.zone || !form.inst_category || loadingFormData}
          >
            <option value="">Select school</option>
            {formData.institutions.map((inst) => (
              <option key={inst.workplace_id} value={inst.workplace_id}>
                [{inst.census_no}] {inst.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Rank <span className="text-red-500">*</span>
            </label>
            <select
              value={form.rank_id}
              onChange={(e) => onChange("rank_id", e.target.value)}
              className={darkSafeInputClass}
              disabled={loadingFormData}
            >
              <option value="">Select rank</option>
              {formData.ranks.map((r) => (
                <option key={r.rank_id} value={r.rank_id}>
                  {r.name ?? r.rank_name ?? r.rank_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <select
              value={form.position_id}
              onChange={(e) => onChange("position_id", e.target.value)}
              className={darkSafeInputClass}
              disabled={loadingFormData}
            >
              <option value="">Select position</option>
              {formData.positions.map((p) => (
                <option key={p.position_id} value={p.position_id}>
                  {p.position_name ?? p.position_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Change Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.updated_type}
              onChange={(e) => onChange("updated_type", e.target.value)}
              className={darkSafeInputClass}
            >
              {SERVICE_HISTORY_CHANGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Letter / Order No
            </label>
            <input
              type="text"
              value={form.appointment_letter_no}
              onChange={(e) => onChange("appointment_letter_no", e.target.value)}
              placeholder="e.g. MOE/123/2010"
              className={darkSafeInputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Remarks
          </label>
          <textarea
            value={form.remarks}
            onChange={(e) => onChange("remarks", e.target.value)}
            rows={2}
            placeholder="Optional notes"
            className={darkSafeTextareaClass}
          />
        </div>
      </div>
    </DarkSafeModal>
  );
}

