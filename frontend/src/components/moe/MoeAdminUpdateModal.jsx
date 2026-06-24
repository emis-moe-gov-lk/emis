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
	wop: "W&OP & Payment Details",
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
};

const safeStr = (val) => (val != null ? String(val) : "");

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

export default function MoeAdminUpdateModal({
	isOpen,
	section,
	adminId,
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
		if (!isOpen || !adminId) return;

		const onEsc = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onEsc);
		return () => document.removeEventListener("keydown", onEsc);
	}, [isOpen, adminId, onClose]);

	// ============================================================
	// 1. LOAD MOE ADMINISTRATOR DATA
	// ============================================================
	useEffect(() => {
		if (!isOpen || !adminId || !section) return;

		let ignore = false;
		setLoading(true);
		setForm({}); // Reset form for new section

		console.log(`[MoeAdminUpdateModal] Loading data for section: ${section}, adminId: ${adminId}`);

		api
			.get(`/moe-admins/${adminId}`)
			.then(async (res) => {
				if (ignore || res.data?.status !== "success") return;
				const d = res.data.data;
				console.log("[MoeAdminUpdateModal] Data loaded:", d);

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
					const districtId = d.district?.district_id ?? "";
					const dsOfficeId = d.ds_office?.dso_id ?? d.ds_office?.ds_office_id ?? "";

					setForm({
						email: d.email ?? "",
						phone: d.phone ?? "",
						districtId: districtId,
						dsOfficeId: dsOfficeId,
						gnDivisionId: d.gn_division?.gn_division_id ?? "",
						addressLine1: d.address_line1 ?? "",
						addressLine2: d.address_line2 ?? "",
						addressLine3: d.address_line3 ?? "",
						postalCode: d.postal_code ?? "",
					});

					// Fetch dependent offices and divisions if already populated
					if (districtId) {
						try {
							const dsRes = await api.get(`/teachers/personal-form-data?district=${districtId}`);
							const dsList = (dsRes.data?.divisionalSecretariats ?? []).map(normalizeDsOfficeOption);
							setOpts((prev) => ({ ...prev, dsOffices: dsList }));
						} catch (e) {
							console.error("Failed to load DS offices for current district:", e);
						}
					}

					if (dsOfficeId) {
						try {
							const gnRes = await api.get(`/teachers/personal-form-data?ds_office=${dsOfficeId}`);
							const gnList = (gnRes.data?.gnDivisions ?? []).map(normalizeGnDivisionOption);
							setOpts((prev) => ({ ...prev, gnDivisions: gnList }));
						} catch (e) {
							console.error("Failed to load GN divisions for current DS Office:", e);
						}
					}
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
					const serviceId = safeStr(d.current_appointment?.service_id);
					setForm({
						currentAppointmentService: serviceId,
						currentAppointmentRank: safeStr(d.current_appointment?.rank_id),
						currentAppointmentPosition: safeStr(d.current_appointment?.position_id),
						currentAppointmentDate: formatDate(d.current_appointment?.appoint_date) || "",
						workplace_name: safeStr(d.current_appointment?.workplace?.name || d.current_appointment?.workplace?.institution?.name),
					});

					if (serviceId) {
						try {
							const ranksRes = await api.get(`/teachers/current-appointment-form-data?service=${serviceId}`);
							setOpts((prev) => ({
								...prev,
								serviceRanks: ranksRes.data?.serviceRanks ?? ranksRes.data?.service_ranks ?? ranksRes.data?.ranks ?? [],
								positions: ranksRes.data?.positions ?? ranksRes.data?.position ?? [],
							}));
						} catch (e) {
							console.error("Failed to load ranks for service:", e);
						}
					}
				}

				if (section === "my_appointment") {
					const serviceId = safeStr(d.appointment?.service_id);
					setForm({
						firstAppointmentService: serviceId,
						firstAppointmentRank: safeStr(d.appointment?.rank_id),
						firstAppointmentPosition: safeStr(d.appointment?.position_id),
						firstAppointmentDate: formatDate(d.appointment?.first_appointment_date) || "",
						firstAppointmentLetter: safeStr(d.appointment?.appointment_letter_no),
						workplace_name: safeStr(d.appointment?.workplace?.name || d.appointment?.workplace?.institution?.name),
					});

					if (serviceId) {
						try {
							const ranksRes = await api.get(`/teachers/current-appointment-form-data?service=${serviceId}`);
							setOpts((prev) => ({
								...prev,
								serviceRanks: ranksRes.data?.serviceRanks ?? ranksRes.data?.service_ranks ?? ranksRes.data?.ranks ?? [],
								positions: ranksRes.data?.positions ?? ranksRes.data?.position ?? [],
							}));
						} catch (e) {
							console.error("Failed to load ranks for service:", e);
						}
					}
				}

				if (section === "wop") {
					setForm({
						w_op_no: d.appointment?.w_op_no ?? "",
						pay_sheet_no: d.appointment?.pay_sheet_no ?? "",
					});
				}
			})
			.catch((err) => {
				console.error("[MoeAdminUpdateModal] Load error:", err);
				toast.error("Failed to load administrator data");
			})
			.finally(() => {
				if (!ignore) setLoading(false);
			});

		return () => {
			ignore = true;
		};
	}, [isOpen, adminId, section]);

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
	// 2B. LOAD APPOINTMENT DROPDOWN OPTIONS (Services)
	// ============================================================
	useEffect(() => {
		if (!isOpen) return;
		if (!["current_appointment", "my_appointment"].includes(section)) return;

		let ignore = false;
		api
			.get("/teachers/current-appointment-form-data")
			.then((res) => {
				if (ignore) return;
				setOpts((prev) => ({
					...prev,
					services: res.data?.service ?? res.data?.services ?? [],
				}));
			})
			.catch(() => {});

		return () => {
			ignore = true;
		};
	}, [isOpen, section]);

	// ============================================================
	// 2C. LOAD RANKS WHEN SERVICE CHANGES (Appointment section)
	// ============================================================
	useEffect(() => {
		if (!isOpen || !["current_appointment", "my_appointment"].includes(section)) return;

		const serviceId =
			section === "current_appointment"
				? form.currentAppointmentService
				: form.firstAppointmentService;

		if (!serviceId) {
			setOpts((prev) => ({ ...prev, serviceRanks: [], positions: [] }));
			return;
		}

		let ignore = false;
		api
			.get(`/teachers/current-appointment-form-data?service=${serviceId}`)
			.then((res) => {
				if (ignore) return;
				setOpts((prev) => ({
					...prev,
					serviceRanks: res.data?.serviceRanks ?? res.data?.service_ranks ?? res.data?.ranks ?? [],
					positions: res.data?.positions ?? res.data?.position ?? [],
				}));
			})
			.catch(() => {});

		return () => {
			ignore = true;
		};
	}, [isOpen, section, form.currentAppointmentService, form.firstAppointmentService]);

	// ============================================================
	// 3. LOAD DS OFFICES WHEN DISTRICT CHANGES (Contact section)
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
	// 4. LOAD GN DIVISIONS WHEN DS OFFICE CHANGES (Contact section)
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
	// 5. HANDLE SAVE
	// ============================================================
	const handleSave = async () => {
		if (!section || !adminId) return;
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

			console.log(`[MoeAdminUpdateModal] Saving section: ${section}, payload:`, payload);

			const res = await api.put(`/moe-admins/${adminId}`, payload);
			console.log("[MoeAdminUpdateModal] Save response:", res.data);

			toast.success("Updated successfully");
			onClose();
			onSaved?.(res.data);
		} catch (error) {
			console.error("[MoeAdminUpdateModal] Save error:", error);
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
										className={darkSafeInputClass}
										value={form.email ?? ""}
										onChange={(e) => setField("email", e.target.value)}
										placeholder="name@example.com"
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
					{/* WOP SECTION */}
					{/* ============================================================ */}
					{section === "wop" && (
						<>
							<div>
								<FormLabel text="W&OP Number" required />
								<input
									className={darkSafeInputClass}
									value={form.w_op_no ?? ""}
									onChange={(e) => setField("w_op_no", e.target.value)}
									placeholder="e.g. 123456"
								/>
							</div>

							<div>
								<FormLabel text="Pay Sheet Number" required />
								<input
									className={darkSafeInputClass}
									value={form.pay_sheet_no ?? ""}
									onChange={(e) => setField("pay_sheet_no", e.target.value)}
									placeholder="e.g. PS/2023/456"
								/>
							</div>
						</>
					)}

				</div>
			)}
		</DarkSafeModal>
	);
}
