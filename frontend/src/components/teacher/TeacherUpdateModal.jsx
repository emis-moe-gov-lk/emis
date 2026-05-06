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
};

const normalizeDsOfficeOption = (ds) => ({
	id: ds?.dso_id ?? ds?.ds_office_id ?? ds?.id ?? "",
	name: ds?.dso_name ?? ds?.ds_office_name ?? ds?.name ?? "",
});

const normalizeGnDivisionOption = (gn) => ({
	id: gn?.gn_division_id ?? gn?.id ?? "",
	name: gn?.gn_division_name ?? gn?.name ?? "",
});

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

	useEffect(() => {
		if (section !== "health") return;
		if (form.healthCondition !== "1") return;

		setForm((prev) =>
			prev.knownProblems
				? { ...prev, knownProblems: "" }
				: prev,
		);
	}, [form.healthCondition, section]);

	useEffect(() => {
		if (!isOpen || !teacherId) return;

		const onEsc = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onEsc);
		return () => document.removeEventListener("keydown", onEsc);
	}, [isOpen, teacherId, onClose]);

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
			})
			.catch(() => toast.error("Failed to load teacher data"))
			.finally(() => {
				if (!ignore) setLoading(false);
			});

		return () => {
			ignore = true;
		};
	}, [isOpen, teacherId, section]);

	// Base load: /api/teachers/personal-form-data
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

	// After district select: /api/teachers/personal-form-data?district=...
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

	// After DS office select: /api/teachers/personal-form-data?ds_office=...
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

	const handleSave = async () => {
		if (!section || !teacherId) return;
		setSaving(true);
		try {
			const payload =
				section === "health"
					? {
							section,
							...form,
							knownProblems:
								form.healthCondition === "1" ? null : form.knownProblems,
					  }
					: { section, ...form };

			const res = await api.patch(`/teachers/${teacherId}`, payload);
			const profileStatus =
				res.data?.data?.profile_status ??
				res.data?.profile_status ??
				res.data?.data?.appointment?.profile_status;

			if (profileStatus === "revised") {
				toast.success("Updated successfully. Profile status: revised");
			} else {
				console.log("Teacher update response:", res.data);
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
					{section === "personal" && (
						<>
										<div>
							<FormLabel text="NIC Number" />
							<input
								className={`${darkSafeInputClass} bg-gray-900 text-gray-400 placeholder-gray-500`}
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
									className={darkSafeInputClass}
									value={form.initialsName ?? ""}
									onChange={(e) => setField("initialsName", e.target.value)}
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
									/>
								</div>
							)}
						</>
					)}

					{section === "contact" && (
						<>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Email" required />
									<input
										type="email"
										className={`${darkSafeInputClass} bg-gray-900 text-gray-400 placeholder-gray-500`}
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
										<option value="">Select</option>
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
										<option value="">Select</option>
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
									<option value="">Select</option>
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
									/>
								</div>
								<div>
									<FormLabel text="Address Line 2" required />
									<input
										className={darkSafeInputClass}
										value={form.addressLine2 ?? ""}
										onChange={(e) => setField("addressLine2", e.target.value)}
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
									/>
								</div>
								<div>
									<FormLabel text="Longitude" />
									<input
										className={darkSafeInputClass}
										value={form.longitude ?? ""}
										onChange={(e) => setField("longitude", e.target.value)}
									/>
								</div>
							</div>
						</>
					)}

					{section === "temporary" && (
						<>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<FormLabel text="Address Line 1" />
									<input
										className={darkSafeInputClass}
										value={form.tAddressLine1 ?? ""}
										onChange={(e) => setField("tAddressLine1", e.target.value)}
									/>
								</div>
								<div>
									<FormLabel text="Address Line 2" />
									<input
										className={darkSafeInputClass}
										value={form.tAddressLine2 ?? ""}
										onChange={(e) => setField("tAddressLine2", e.target.value)}
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
									/>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</DarkSafeModal>
	);
}
