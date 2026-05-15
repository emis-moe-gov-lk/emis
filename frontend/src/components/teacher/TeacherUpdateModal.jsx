import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import DarkSafeModal, {
	darkSafeInputClass,
	darkSafeSelectClass,
	FormLabel,
	darkSafeButtonClasses,
} from "@/components/common/DarkSafeModal";

const TITLES = {
	personal: "Personal & Cultural",
	health: "Health Information",
	contact: "Contact & Location",
	temporary: "Temporary Location",
	current_appointment: "Appointment current status",
	my_appointment: "My Appointment",
	teaching_info: "Teaching Info",
};

const EMPTY_OPTS = {
	titles: [],
	genders: [],
	religions: [],
	ethnicities: [],
	civilStatuses: [],
	bloodGroups: [],
	districts: [],
	dsOffices: [],
	gnDivisions: [],
	services: [],
	serviceRanks: [],
	positions: [],
	teacherCategories: [],
	teacherTypes: [],
	mediums: [],
	subjects: [],
	appointedSubjects: [],
};

const formatDate = (value) => {
	if (!value) return "";
	return String(value).slice(0, 10);
};

const normalizeDsOfficeOption = (ds) => ({
	id: ds?.dso_id ?? ds?.ds_office_id ?? ds?.id ?? "",
	name: ds?.dso_name ?? ds?.ds_office_name ?? ds?.name ?? "",
});

const normalizeGnDivisionOption = (gn) => ({
	id: gn?.gn_division_id ?? gn?.id ?? "",
	name: gn?.gn_division_name ?? gn?.name ?? "",
});

const safeStr = (val) => (val != null ? String(val) : "");

export default function TeacherUpdateModal({
	isOpen,
	section,
	teacherId,
	onClose,
	onSaved,
}) {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [opts, setOpts] = useState(EMPTY_OPTS);
	const [form, setForm] = useState({});

	const getErrorMessage = (error) => {
		const payload = error?.response?.data;
		const fieldErrors = payload?.errors;

		if (fieldErrors && typeof fieldErrors === "object") {
			const firstFieldError = Object.values(fieldErrors)
				.flat()
				.find(Boolean);
			if (firstFieldError) return String(firstFieldError);
		}

		return (
			payload?.message ||
			error?.message ||
			"Failed to save changes"
		);
	};

	const setField = (key, value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	// Health condition effect - clear knownProblems when healthCondition is Good (1)
	useEffect(() => {
		if (section !== "health") return;
		if (form.healthCondition !== "1") return;

		setForm((prev) =>
			prev.knownProblems
				? { ...prev, knownProblems: "" }
				: prev,
		);
	}, [form.healthCondition, section]);

	// ESC key to close
	useEffect(() => {
		if (!isOpen || !teacherId) return;

		const onEsc = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onEsc);
		return () => document.removeEventListener("keydown", onEsc);
	}, [isOpen, teacherId, onClose]);

	// ============================================================
	// 1. LOAD TEACHER DATA
	// ============================================================
	useEffect(() => {
		if (!isOpen || !teacherId || !section) return;

		let ignore = false;
		setLoading(true);

		api
			.get(`/teacher/${teacherId}`)
			.then((res) => {
				if (ignore || res.data?.status !== "success") return;
				const d = res.data.data;

				if (section === "personal") {
					setForm({
						nic: d.nic ?? "",
						titleId: d.title?.title_id ?? "",
						fullName: d.full_name ?? "",
						initialsName: d.name_with_initials ?? "",
						genderId: d.gender?.gender_id ?? "",
						dateOfBirth: d.date_of_birth ?? "",
						ethnicityId: d.ethnicity?.ethnicity_id ?? "",
						religionId: d.religion?.religion_id ?? "",
						civilStatusId: d.civil_status?.civil_status_id ?? "",
					});
				}

				if (section === "health") {
					setForm({
						bloodGroupId: d.blood_group?.blood_group_id ?? "",
						healthCondition:
							d.health_condition === 0 || d.health_condition === 1
								? String(d.health_condition)
								: "",
						knownProblems: d.health_problem ?? "",
					});
				}

				if (section === "contact") {
					setForm({
						email: d.email ?? "",
						phone: d.phone ?? "",
						districtId: d.district?.district_id ?? "",
						dsOfficeId: d.ds_office?.dso_id ?? d.ds_office?.ds_office_id ?? "",
						gnDivisionId: d.gn_division?.gn_division_id ?? "",
						addressLine1: d.address_line1 ?? "",
						addressLine2: d.address_line2 ?? "",
						addressLine3: d.address_line3 ?? "",
						postalCode: d.postal_code ?? "",
						latitude: d.latitude ?? "",
						longitude: d.longitude ?? "",
					});

					setOpts((prev) => ({
						...prev,
						dsOffices: (res.data?.divisionalSecretariats ?? []).map(
							normalizeDsOfficeOption,
						),
						gnDivisions: (res.data?.gnDivisions ?? []).map(
							normalizeGnDivisionOption,
						),
					}));
				}

				if (section === "temporary") {
					setForm({
						tAddressLine1: d.t_address_line1 ?? "",
						tAddressLine2: d.t_address_line2 ?? "",
						tAddressLine3: d.t_address_line3 ?? "",
						tPostalCode: d.t_postal_code ?? "",
					});
				}

				if (section === "current_appointment") {
					setForm({
						currentAppointmentService: safeStr(d.current_appointment?.service_id),
						currentAppointmentRank: safeStr(d.current_appointment?.rank_id),
						currentAppointmentPosition: safeStr(d.current_appointment?.position_id),
						currentAppointmentDate: formatDate(d.current_appointment?.appoint_date) || "",
						currentAppointmentInstitution: safeStr(d.current_appointment?.workplace_id),
						workplace_name: safeStr(d.current_appointment?.workplace?.institution?.name),
					});
				}

				if (section === "my_appointment") {
					setForm({
						firstAppointmentService: safeStr(d.appointment?.service_id),
						firstAppointmentRank: safeStr(d.appointment?.rank_id),
						firstAppointmentPosition: safeStr(d.appointment?.position_id),
						firstAppointmentDate: formatDate(d.appointment?.first_appointment_date) || "",
						firstAppointmentLetter: safeStr(d.appointment?.appointment_letter_no),
						firstAppointmentInstitution: safeStr(d.appointment?.workplace_id),
						workplace_name: safeStr(d.appointment?.workplace?.institution?.name),
					});
				}

				if (section === "teaching_info") {
					const t = d.teacher || {};
					const getId = (val, ...keys) => {
						if (typeof val === 'object' && val !== null) {
							for (const k of keys) {
								if (val[k]) return safeStr(val[k]);
							}
							return safeStr(val.id);
						}
						return safeStr(val);
					};

					setForm({
						teacherCategory: getId(t.teacher_category, 'categories_id', 'teacher_category_id', 'category_id') || safeStr(t.teacher_category_id ?? t.categories_id),
						teacherType: getId(t.teacher_type, 'teacher_types_id', 'teacher_type_id', 'type_id') || safeStr(t.teacher_types_id ?? t.teacher_type_id),
						appointmentMedium: getId(t.medium || t.appointment_medium, 'medium_id') || safeStr(t.appointment_medium ?? t.medium),
						appointmentSubject: getId(t.appointment_subject, 'a_subject_id', 'subject_id', 'appointed_subject_id', 'apointed_subject_id', 'apointment_subject_id') || safeStr(t.appointment_subject),
						mainSubject: getId(t.main_subject, 'subject_id', 'main_subject_id') || safeStr(t.main_subject),
						currentTeachingSubject: getId(t.current_teaching_subject, 'subject_id') || safeStr(t.current_teaching_subject),
					});
				}
			})
			.catch(() => toast.error("Failed to load teacher data"))
			.finally(() => {
				if (!ignore) setLoading(false);
			});

		return () => {
			ignore = true;
		};
	}, [isOpen, teacherId, section]);

	// ============================================================
	// 2. LOAD FORM DROPDOWN OPTIONS (Personal/Contact)
	// ============================================================
	useEffect(() => {
		if (!isOpen) return;
		if (!["personal", "health", "contact"].includes(section)) return;

		let ignore = false;
		api
			.get("/teachers/personal-form-data")
			.then((res) => {
				if (ignore) return;
				setOpts((prev) => ({
					...prev,
					titles: res.data?.titles ?? [],
					genders: res.data?.genders ?? [],
					religions: res.data?.religions ?? [],
					ethnicities: res.data?.ethnicities ?? [],
					civilStatuses: res.data?.civilStatuses ?? [],
					bloodGroups: res.data?.bloodGroups ?? [],
					districts: res.data?.districts ?? [],
				}));
			})
			.catch(() => {});

		return () => {
			ignore = true;
		};
	}, [isOpen, section]);

	// ============================================================
	// 3. LOAD APPOINTMENT DROPDOWN OPTIONS (Services, Ranks, Positions)
	// ============================================================
	useEffect(() => {
		if (!isOpen || !["current_appointment", "my_appointment"].includes(section)) return;

		let ignore = false;
		
		api
			.get("/teachers/current-appointment-form-data")
			.then((res) => {
				if (ignore) return;
				
				// Handle different possible field names from API
				const servicesData = res.data?.service ?? res.data?.services ?? [];
				
				setOpts((prev) => ({
					...prev,
					services: servicesData,
				}));
			})
			.catch((err) => console.error("Failed to load appointment options:", err));

		return () => {
			ignore = true;
		};
	}, [isOpen, section]);

	// ============================================================
	// 4. LOAD RANKS WHEN SERVICE CHANGES (Appointment section)
	// ============================================================
	useEffect(() => {
		if (!isOpen || !["current_appointment", "my_appointment"].includes(section)) return;
		
		const serviceId = section === "current_appointment" ? form.currentAppointmentService : form.firstAppointmentService;
		
		if (!serviceId) {
			setOpts((prev) => ({ ...prev, serviceRanks: [], positions: [] }));
			return;
		}

		let ignore = false;
		
		api
			.get(`/teachers/current-appointment-form-data?service=${serviceId}`)
			.then((res) => {
				if (ignore) return;
				
				// Handle different possible field names from API
				const ranksData = res.data?.serviceRanks ?? res.data?.service_ranks ?? res.data?.ranks ?? [];
				const positionsData = res.data?.positions ?? res.data?.position ?? [];
				
				setOpts((prev) => ({
					...prev,
					serviceRanks: ranksData,
					positions: positionsData,
				}));
			})
			.catch(() => {});

		return () => {
			ignore = true;
		};
	}, [isOpen, section, form.currentAppointmentService, form.firstAppointmentService]);

	// ============================================================
	// 5. LOAD TEACHING INFO DROPDOWNS
	// ============================================================
	useEffect(() => {
		if (!isOpen || section !== "teaching_info") return;

		let ignore = false;
		
		const fetchTeachingInfo = async () => {
			try {
				let res;
				
				const response = await api.get("/teachers/current-appointment-form-data");
				if (response?.data) {
					res = response;
				}

				if (ignore) return;
				
				if (!res) {
					console.error("All endpoints failed to provide teaching info options.");
					toast.error("Failed to load teaching dropdowns.");
					return;
				}
				
				setOpts((prev) => ({
					...prev,
					teacherCategories: res.data?.teacherCategorys ?? res.data?.teacher_categories ?? [],
					teacherTypes: res.data?.teacherTypes ?? res.data?.teacher_types ?? [],
					mediums: res.data?.appointmentMedium ?? res.data?.mediums ?? [],
					subjects: res.data?.mainTeachingSubjects ?? res.data?.subjects ?? [],
					appointedSubjects: res.data?.aapointedSubjects ?? res.data?.apointmentSubjects ?? res.data?.appointed_subjects ?? [],
				}));
			} catch (err) {
				console.error("Failed to load teaching info options:", err);
			}
		};

		fetchTeachingInfo();

		return () => {
			ignore = true;
		};
	}, [isOpen, section]);

	// ============================================================
	// 6. LOAD DS OFFICES WHEN DISTRICT CHANGES (Contact section)
	// ============================================================
	useEffect(() => {
		if (!isOpen || section !== "contact") return;
		if (!form.districtId) {
			setOpts((prev) => ({ ...prev, dsOffices: [], gnDivisions: [] }));
			return;
		}

		let ignore = false;
		api
			.get(`/teachers/personal-form-data?district=${form.districtId}`)
			.then((res) => {
				if (ignore) return;
				setOpts((prev) => ({
					...prev,
					dsOffices: (res.data?.divisionalSecretariats ?? []).map(
						normalizeDsOfficeOption,
					),
				}));
			})
			.catch(() => {});

		return () => {
			ignore = true;
		};
	}, [isOpen, section, form.districtId]);

	// ============================================================
	// 7. LOAD GN DIVISIONS WHEN DS OFFICE CHANGES (Contact section)
	// ============================================================
	useEffect(() => {
		if (!isOpen || section !== "contact") return;
		if (!form.dsOfficeId) {
			setOpts((prev) => ({ ...prev, gnDivisions: [] }));
			return;
		}

		let ignore = false;
		api
			.get(`/teachers/personal-form-data?ds_office=${form.dsOfficeId}`)
			.then((res) => {
				if (ignore) return;
				setOpts((prev) => ({
					...prev,
					gnDivisions: (res.data?.gnDivisions ?? []).map(
						normalizeGnDivisionOption,
					),
				}));
			})
			.catch(() => {});

		return () => {
			ignore = true;
		};
	}, [isOpen, section, form.dsOfficeId]);

	// ============================================================
	// 8. HANDLE SAVE
	// ============================================================
	const handleSave = async () => {
		if (!section || !teacherId) return;
		setSaving(true);
		try {
			let payload;
			
			if (section === "health") {
				payload = {
					section,
					...form,
					knownProblems: form.healthCondition === "1" ? null : form.knownProblems,
				};
			} else {
				payload = { section, ...form };
			}

			const res = await api.patch(`/teachers/${teacherId}`, payload);
			const profileStatus =
				res.data?.data?.profile_status ??
				res.data?.profile_status ??
				res.data?.data?.appointment?.profile_status;

			if (profileStatus === "revised") {
				toast.success("Updated successfully. Profile status: revised");
			} else {
				toast.success(
					profileStatus
						? `Updated successfully. Profile status: ${profileStatus}`
						: "Updated successfully",
				);
			}
			onClose();
			onSaved?.(res.data);
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setSaving(false);
		}
	};

	if (!isOpen) return null;

	const footerContent = (
		<>
			<button
				type="button"
				onClick={onClose}
				disabled={saving}
				className={darkSafeButtonClasses.cancel}
			>
				Cancel
			</button>
			<button
				type="button"
				onClick={handleSave}
				disabled={saving || loading}
				className={darkSafeButtonClasses.primary}
			>
				{saving ? "Saving..." : "Save Changes"}
			</button>
		</>
	);

	return (
		<DarkSafeModal
			isOpen={isOpen}
			title={TITLES[section]}
			subtitle="Update Info"
			onClose={onClose}
			maxWidth="md"
			footer={footerContent}
		>
			{loading ? (
				<p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
			) : (
				<div className="space-y-4">
					
					{/* ============================================================ */}
					{/* PERSONAL SECTION */}
					{/* ============================================================ */}
					{section === "personal" && (
						// ... personal section content (same as your code) ...
						<>
							<div>
								<FormLabel text="NIC Number" />
								<input
									className={`${darkSafeInputClass} bg-gray-800 text-gray-400 placeholder-gray-500`}
									value={form.nic ?? ""}
									disabled
								/>
							</div>
							<div className="grid grid-cols-[120px_1fr] gap-3">
								<div>
									<FormLabel text="Title" required />
									<select
										className={darkSafeSelectClass}
										value={form.titleId ?? ""}
										onChange={(e) => setField("titleId", e.target.value)}
									>
										<option value="">Select</option>
										{opts.titles.map((t) => (
											<option key={t.title_id} value={t.title_id}>
												{t.title_name}
											</option>
										))}
									</select>
								</div>
								<div>
									<FormLabel text="Full Name" required />
									<input
										className={darkSafeInputClass}
										value={form.fullName ?? ""}
										onChange={(e) => setField("fullName", e.target.value)}
									/>
								</div>
							</div>
							<div>
								<FormLabel text="Initials" required />
								<input
									className={`${darkSafeInputClass} bg-gray-800 text-gray-400`}
									value={form.initialsName ?? ""}
									onChange={(e) => setField("initialsName", e.target.value)}
									disabled
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Gender" required />
									<select
										className={darkSafeSelectClass}
										value={form.genderId ?? ""}
										onChange={(e) => setField("genderId", e.target.value)}
									>
										<option value="">Select</option>
										{opts.genders.map((g) => (
											<option key={g.gender_id} value={g.gender_id}>
												{g.gender_name}
											</option>
										))}
									</select>
								</div>
								<div>
									<FormLabel text="Birthday" required />
									<input
										type="date"
										className={darkSafeInputClass}
										value={form.dateOfBirth ?? ""}
										onChange={(e) => setField("dateOfBirth", e.target.value)}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Ethnicity" required />
									<select
										className={darkSafeSelectClass}
										value={form.ethnicityId ?? ""}
										onChange={(e) => setField("ethnicityId", e.target.value)}
									>
										<option value="">Select</option>
										{opts.ethnicities.map((et) => (
											<option key={et.ethnicity_id} value={et.ethnicity_id}>
												{et.ethnicity_name}
											</option>
										))}
									</select>
								</div>
								<div>
									<FormLabel text="Religion" required />
									<select
										className={darkSafeSelectClass}
										value={form.religionId ?? ""}
										onChange={(e) => setField("religionId", e.target.value)}
									>
										<option value="">Select</option>
										{opts.religions.map((r) => (
											<option key={r.religion_id} value={r.religion_id}>
												{r.religion_name}
											</option>
										))}
									</select>
								</div>
							</div>
							<div>
								<FormLabel text="Civil Status" required />
								<select
									className={darkSafeSelectClass}
									value={form.civilStatusId ?? ""}
									onChange={(e) => setField("civilStatusId", e.target.value)}
								>
									<option value="">Select</option>
									{opts.civilStatuses.map((c) => (
										<option key={c.civil_status_id} value={c.civil_status_id}>
											{c.civil_status_name}
										</option>
									))}
								</select>
							</div>
						</>
					)}

					{/* ============================================================ */}
					{/* HEALTH SECTION */}
					{/* ============================================================ */}
					{section === "health" && (
						<>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Blood Group" required />
									<select
										className={darkSafeSelectClass}
										value={form.bloodGroupId ?? ""}
										onChange={(e) => setField("bloodGroupId", e.target.value)}
									>
										<option value="">Select</option>
										{opts.bloodGroups.map((b) => (
											<option key={b.blood_group_id} value={b.blood_group_id}>
												{b.blood_group}
											</option>
										))}
									</select>
								</div>
								<div>
									<FormLabel text="Overall Condition" required />
									<select
										className={darkSafeSelectClass}
										value={form.healthCondition ?? ""}
										onChange={(e) => setField("healthCondition", e.target.value)}
									>
										<option value="">Select</option>
										<option value="1">Good</option>
										<option value="0">Issue</option>
									</select>
								</div>
							</div>
							{form.healthCondition === "0" && (
								<div>
									<FormLabel text="Describe Health Issues" required />
									<textarea
										rows={3}
										className={darkSafeInputClass}
										value={form.knownProblems ?? ""}
										onChange={(e) => setField("knownProblems", e.target.value)}
										placeholder="Describe any health issues, conditions, or disabilities..."
									/>
								</div>
							)}
						</>
					)}

					{/* ============================================================ */}
					{/* CONTACT SECTION */}
					{/* ============================================================ */}
					{section === "contact" && (
						<>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Email" required />
									<input
										type="email"
										className={`${darkSafeInputClass} bg-gray-800 text-gray-400 placeholder-gray-500`}
										value={form.email ?? ""}
										disabled
									/>
								</div>
								<div>
									<FormLabel text="Phone" required />
									<input
										className={darkSafeInputClass}
										value={form.phone ?? ""}
										onChange={(e) =>
											setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
										}
										placeholder="0712345678"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="District" required />
									<select
										className={darkSafeSelectClass}
										value={form.districtId ?? ""}
										onChange={(e) => {
											setField("districtId", e.target.value);
											setField("dsOfficeId", "");
											setField("gnDivisionId", "");
										}}
									>
										<option value="">Select District</option>
										{opts.districts.map((d) => (
											<option key={d.district_id} value={d.district_id}>
												{d.district_name}
											</option>
										))}
									</select>
								</div>
								<div>
									<FormLabel text="DS Office" required />
									<select
										className={darkSafeSelectClass}
										value={form.dsOfficeId ?? ""}
										disabled={!form.districtId}
										onChange={(e) => {
											setField("dsOfficeId", e.target.value);
											setField("gnDivisionId", "");
										}}
									>
										<option value="">Select DS Office</option>
										{opts.dsOffices.map((d) => (
											<option key={d.id} value={d.id}>
												{d.name}
											</option>
										))}
									</select>
								</div>
							</div>
							<div>
								<FormLabel text="GN Division" required />
								<select
									className={darkSafeSelectClass}
									value={form.gnDivisionId ?? ""}
									disabled={!form.dsOfficeId}
									onChange={(e) => setField("gnDivisionId", e.target.value)}
								>
									<option value="">Select GN Division</option>
									{opts.gnDivisions.map((g) => (
										<option key={g.id} value={g.id}>
											{g.name}
										</option>
									))}
								</select>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Address Line 1" required />
									<input
										className={darkSafeInputClass}
										value={form.addressLine1 ?? ""}
										onChange={(e) => setField("addressLine1", e.target.value)}
										placeholder="House No, Street"
									/>
								</div>
								<div>
									<FormLabel text="Address Line 2" required />
									<input
										className={darkSafeInputClass}
										value={form.addressLine2 ?? ""}
										onChange={(e) => setField("addressLine2", e.target.value)}
										placeholder="Village, City"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Address Line 3" />
									<input
										className={darkSafeInputClass}
										value={form.addressLine3 ?? ""}
										onChange={(e) => setField("addressLine3", e.target.value)}
										placeholder="Additional info"
									/>
								</div>
								<div>
									<FormLabel text="Postal Code" required />
									<input
										className={darkSafeInputClass}
										value={form.postalCode ?? ""}
										onChange={(e) =>
											setField("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
										}
										placeholder="12345"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Latitude" />
									<input
										className={darkSafeInputClass}
										value={form.latitude ?? ""}
										onChange={(e) => setField("latitude", e.target.value)}
										placeholder="6.9271"
									/>
								</div>
								<div>
									<FormLabel text="Longitude" />
									<input
										className={darkSafeInputClass}
										value={form.longitude ?? ""}
										onChange={(e) => setField("longitude", e.target.value)}
										placeholder="79.8612"
									/>
								</div>
							</div>
						</>
					)}

					{/* ============================================================ */}
					{/* TEMPORARY SECTION */}
					{/* ============================================================ */}
					{section === "temporary" && (
						<>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Address Line 1" />
									<input
										className={darkSafeInputClass}
										value={form.tAddressLine1 ?? ""}
										onChange={(e) => setField("tAddressLine1", e.target.value)}
										placeholder="House No, Street"
									/>
								</div>
								<div>
									<FormLabel text="Address Line 2" />
									<input
										className={darkSafeInputClass}
										value={form.tAddressLine2 ?? ""}
										onChange={(e) => setField("tAddressLine2", e.target.value)}
										placeholder="Village, City"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Address Line 3" />
									<input
										className={darkSafeInputClass}
										value={form.tAddressLine3 ?? ""}
										onChange={(e) => setField("tAddressLine3", e.target.value)}
										placeholder="Additional info"
									/>
								</div>
								<div>
									<FormLabel text="Postal Code" />
									<input
										className={darkSafeInputClass}
										value={form.tPostalCode ?? ""}
										onChange={(e) =>
											setField("tPostalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
										}
										placeholder="12345"
									/>
								</div>
							</div>
						</>
					)}

					{/* ============================================================ */}
					{/* CURRENT APPOINTMENT SECTION */}
					{/* ============================================================ */}
					{section === "current_appointment" && (
						<>
							<div>
								<FormLabel text="Current Workplace" />
								<input
									className={`${darkSafeInputClass} bg-gray-800 text-gray-400`}
									value={form.workplace_name ?? ""}
									disabled
								/>
								<p className="text-xs text-gray-500 mt-1">Workplace updates are handled through the transfer module.</p>
							</div>

							<div>
								<FormLabel text="Service" required />
								<select
									className={darkSafeSelectClass}
									value={form.currentAppointmentService ?? ""}
									onChange={(e) => {
										setField("currentAppointmentService", e.target.value);
										setField("currentAppointmentRank", "");
										setField("currentAppointmentPosition", "");
									}}
								>
									<option value="">Select Service</option>
									{opts.services.map((s) => (
										<option key={s.service_id} value={s.service_id}>
											{s.service_name}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Current Service Rank" required />
								<select
									className={darkSafeSelectClass}
									value={form.currentAppointmentRank ?? ""}
									disabled={!form.currentAppointmentService}
									onChange={(e) => setField("currentAppointmentRank", e.target.value)}
								>
									<option value="">Select Rank</option>
									{opts.serviceRanks.map((r) => (
										<option key={r.rank_id} value={r.rank_id}>
											{r.rank_name || r.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Position / Designation" required />
								<select
									className={darkSafeSelectClass}
									value={form.currentAppointmentPosition ?? ""}
									disabled={!form.currentAppointmentService}
									onChange={(e) => setField("currentAppointmentPosition", e.target.value)}
								>
									<option value="">Select Position</option>
									{opts.positions.map((p) => (
										<option key={p.position_id} value={p.position_id}>
											{p.position_name || p.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Appointment Date" required />
								<input
									type="date"
									className={darkSafeInputClass}
									value={form.currentAppointmentDate ?? ""}
									onChange={(e) => setField("currentAppointmentDate", e.target.value)}
								/>
							</div>
						</>
					)}

					{/* ============================================================ */}
					{/* MY APPOINTMENT SECTION */}
					{/* ============================================================ */}
					{section === "my_appointment" && (
						<>
							<div>
								<FormLabel text="First Workplace" />
								<input
									className={`${darkSafeInputClass} bg-gray-800 text-gray-400`}
									value={form.workplace_name ?? ""}
									disabled
								/>
							</div>

							<div>
								<FormLabel text="Service" required />
								<select
									className={darkSafeSelectClass}
									value={form.firstAppointmentService ?? ""}
									onChange={(e) => {
										setField("firstAppointmentService", e.target.value);
										setField("firstAppointmentRank", "");
										setField("firstAppointmentPosition", "");
									}}
								>
									<option value="">Select Service</option>
									{opts.services.map((s) => (
										<option key={s.service_id} value={s.service_id}>
											{s.service_name}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Service Rank" required />
								<select
									className={darkSafeSelectClass}
									value={form.firstAppointmentRank ?? ""}
									disabled={!form.firstAppointmentService}
									onChange={(e) => setField("firstAppointmentRank", e.target.value)}
								>
									<option value="">Select Rank</option>
									{opts.serviceRanks.map((r) => (
										<option key={r.rank_id} value={r.rank_id}>
											{r.rank_name || r.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Position / Designation" required />
								<select
									className={darkSafeSelectClass}
									value={form.firstAppointmentPosition ?? ""}
									disabled={!form.firstAppointmentService}
									onChange={(e) => setField("firstAppointmentPosition", e.target.value)}
								>
									<option value="">Select Position</option>
									{opts.positions.map((p) => (
										<option key={p.position_id} value={p.position_id}>
											{p.position_name || p.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="First Appointment Date" required />
								<input
									type="date"
									className={darkSafeInputClass}
									value={form.firstAppointmentDate ?? ""}
									onChange={(e) => setField("firstAppointmentDate", e.target.value)}
								/>
							</div>

							<div>
								<FormLabel text="Appointment Letter No" required />
								<input
									className={darkSafeInputClass}
									value={form.firstAppointmentLetter ?? ""}
									onChange={(e) => setField("firstAppointmentLetter", e.target.value)}
									placeholder="e.g. AD/E/2020/001"
								/>
							</div>
						</>
					)}

					{/* ============================================================ */}
					{/* TEACHING INFO SECTION */}
					{/* ============================================================ */}
					{section === "teaching_info" && (
						<>
							<div>
								<FormLabel text="Teacher Category" required />
								<select
									className={darkSafeSelectClass}
									value={form.teacherCategory ?? ""}
									onChange={(e) => setField("teacherCategory", e.target.value)}
								>
									<option value="">Select Category</option>
									{opts.teacherCategories?.map((c) => (
										<option key={c.categories_id || c.teacher_category_id || c.id} value={c.categories_id || c.teacher_category_id || c.id}>
											{c.name || c.teacher_category_name || c.category_name || c.teacher_category || c.title || "Unnamed Category"}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Teacher Type" required />
								<select
									className={darkSafeSelectClass}
									value={form.teacherType ?? ""}
									onChange={(e) => setField("teacherType", e.target.value)}
								>
									<option value="">Select Type</option>
									{opts.teacherTypes?.map((t) => (
										<option key={t.teacher_types_id || t.teacher_type_id || t.id} value={t.teacher_types_id || t.teacher_type_id || t.id}>
											{t.type_name || t.name || t.teacher_type || t.title || "Unnamed Type"}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Medium" required />
								<select
									className={darkSafeSelectClass}
									value={form.appointmentMedium ?? ""}
									onChange={(e) => setField("appointmentMedium", e.target.value)}
								>
									<option value="">Select Medium</option>
									{opts.mediums?.map((m) => (
										<option key={m.medium_id || m.id} value={m.medium_id || m.id}>
											{m.name || m.medium_name || m.medium || m.title || "Unnamed Medium"}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Appointment Subject" required />
								<select
									className={darkSafeSelectClass}
									value={form.appointmentSubject ?? ""}
									onChange={(e) => setField("appointmentSubject", e.target.value)}
								>
									<option value="">Select Subject</option>
									{opts.appointedSubjects?.map((s) => {
										const val = s.a_subject_id || s.subject_id || s.appointed_subject_id || s.apointed_subject_id || s.apointment_subject_id || s.id;
										return (
											<option key={val} value={val}>
												{s.name_en || s.name || s.subject_name || s.title || "Unnamed Subject"}
											</option>
										);
									})}
								</select>
							</div>

							<div>
								<FormLabel text="Main Subject" required />
								<select
									className={darkSafeSelectClass}
									value={form.mainSubject ?? ""}
									onChange={(e) => setField("mainSubject", e.target.value)}
								>
									<option value="">Select Subject</option>
									{opts.subjects?.map((s) => (
										<option key={s.subject_id || s.id} value={s.subject_id || s.id}>
											{s.name_en || s.name || s.subject_name || s.title || "Unnamed Subject"}
										</option>
									))}
								</select>
							</div>

							<div>
								<FormLabel text="Current Teaching Subject" required />
								<select
									className={darkSafeSelectClass}
									value={form.currentTeachingSubject ?? ""}
									onChange={(e) => setField("currentTeachingSubject", e.target.value)}
								>
									<option value="">Select Subject</option>
									{opts.subjects?.map((s) => (
										<option key={s.subject_id || s.id} value={s.subject_id || s.id}>
											{s.name_en || s.name || s.subject_name || s.title || "Unnamed Subject"}
										</option>
									))}
								</select>
							</div>
						</>
					)}

				</div>
			)}
		</DarkSafeModal>
	);
}