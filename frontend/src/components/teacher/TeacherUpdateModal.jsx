import { useEffect, useState } from "react";
import { HiX } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "@/api/axios";

const inputCls =
	"w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 " +
	"placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 " +
	"focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50";

const selectCls =
	"w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm " +
	"text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 " +
	"disabled:cursor-not-allowed disabled:bg-gray-50";

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

function Lbl({ text, required = false }) {
	return (
		<label className="mb-1.5 block text-xs font-semibold text-gray-600">
			{text}
			{required && <span className="ml-0.5 text-red-500">*</span>}
		</label>
	);
}

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

	const setField = (key, value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

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
						dsOfficeId: d.ds_office?.ds_office_id ?? "",
						gnDivisionId: d.gn_division?.gn_division_id ?? "",
						addressLine1: d.address_line1 ?? "",
						addressLine2: d.address_line2 ?? "",
						addressLine3: d.address_line3 ?? "",
						postalCode: d.postal_code ?? "",
						latitude: d.latitude ?? "",
						longitude: d.longitude ?? "",
					});
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
				const rawDs = res.data?.divisionalSecretariats ?? [];
				const normalizedDs = rawDs.map((ds) => ({
					id: ds.dso_id ?? ds.ds_office_id ?? ds.id,
					name: ds.dso_name ?? ds.ds_office_name ?? ds.name,
				}));
				setOpts((prev) => ({
					...prev,
					dsOffices: normalizedDs,
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
				const rawGn = res.data?.gnDivisions ?? [];
				const normalizedGn = rawGn.map((gn) => ({
					id: gn.gn_division_id ?? gn.id,
					name: gn.gn_division_name ?? gn.name,
				}));
				setOpts((prev) => ({
					...prev,
					gnDivisions: normalizedGn,
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
			const res = await api.patch(`/teachers/${teacherId}`, { section, ...form });
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
		} catch {
			toast.error("Failed to save changes");
		} finally {
			setSaving(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
				onClick={onClose}
			/>

			<div className="relative z-10 flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl max-h-[90vh]">
				<div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
							Update Info
						</p>
						<h2 className="mt-0.5 text-base font-bold text-gray-900">
							{TITLES[section]}
						</h2>
					</div>
					<button
						onClick={onClose}
						aria-label="Close"
						className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
					>
						<HiX className="h-5 w-5" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-6 py-5">
					{loading ? (
						<p className="text-sm text-gray-500">Loading...</p>
					) : (
						<div className="space-y-4">
							{section === "personal" && (
								<>
									<div>
										<Lbl text="NIC Number" />
										<input className={inputCls} value={form.nic ?? ""} readOnly />
									</div>
									<div className="grid grid-cols-[120px_1fr] gap-3">
										<div>
											<Lbl text="Title" required />
											<select
												className={selectCls}
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
											<Lbl text="Full Name" required />
											<input
												className={inputCls}
												value={form.fullName ?? ""}
												onChange={(e) => setField("fullName", e.target.value)}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<Lbl text="Gender" required />
											<select
												className={selectCls}
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
											<Lbl text="Birthday" required />
											<input
												type="date"
												className={inputCls}
												value={form.dateOfBirth ?? ""}
												onChange={(e) => setField("dateOfBirth", e.target.value)}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<Lbl text="Ethnicity" required />
											<select
												className={selectCls}
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
											<Lbl text="Religion" required />
											<select
												className={selectCls}
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
										<Lbl text="Civil Status" required />
										<select
											className={selectCls}
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
											<Lbl text="Blood Group" required />
											<select
												className={selectCls}
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
											<Lbl text="Overall Condition" required />
											<select
												className={selectCls}
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
											<Lbl text="Describe Health Issues" required />
											<textarea
												rows={3}
												className={`${inputCls} resize-none`}
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
											<Lbl text="Email" required />
											<input
												type="email"
												className={inputCls}
												value={form.email ?? ""}
												onChange={(e) => setField("email", e.target.value)}
											/>
										</div>
										<div>
											<Lbl text="Phone" required />
											<input
												className={inputCls}
												value={form.phone ?? ""}
												onChange={(e) =>
													setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
												}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<Lbl text="District" required />
											<select
												className={selectCls}
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
											<Lbl text="DS Office" required />
											<select
												className={selectCls}
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
										<Lbl text="GN Division" required />
										<select
											className={selectCls}
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
											<Lbl text="Address Line 1" required />
											<input
												className={inputCls}
												value={form.addressLine1 ?? ""}
												onChange={(e) => setField("addressLine1", e.target.value)}
											/>
										</div>
										<div>
											<Lbl text="Address Line 2" required />
											<input
												className={inputCls}
												value={form.addressLine2 ?? ""}
												onChange={(e) => setField("addressLine2", e.target.value)}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<Lbl text="Address Line 3" />
											<input
												className={inputCls}
												value={form.addressLine3 ?? ""}
												onChange={(e) => setField("addressLine3", e.target.value)}
											/>
										</div>
										<div>
											<Lbl text="Postal Code" required />
											<input
												className={inputCls}
												value={form.postalCode ?? ""}
												onChange={(e) =>
													setField("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
												}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<Lbl text="Latitude" />
											<input
												className={inputCls}
												value={form.latitude ?? ""}
												onChange={(e) => setField("latitude", e.target.value)}
											/>
										</div>
										<div>
											<Lbl text="Longitude" />
											<input
												className={inputCls}
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
											<Lbl text="Address Line 1" />
											<input
												className={inputCls}
												value={form.tAddressLine1 ?? ""}
												onChange={(e) => setField("tAddressLine1", e.target.value)}
											/>
										</div>
										<div>
											<Lbl text="Address Line 2" />
											<input
												className={inputCls}
												value={form.tAddressLine2 ?? ""}
												onChange={(e) => setField("tAddressLine2", e.target.value)}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<Lbl text="Address Line 3" />
											<input
												className={inputCls}
												value={form.tAddressLine3 ?? ""}
												onChange={(e) => setField("tAddressLine3", e.target.value)}
											/>
										</div>
										<div>
											<Lbl text="Postal Code" />
											<input
												className={inputCls}
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
				</div>

				<div className="flex shrink-0 gap-3 border-t border-gray-100 px-6 py-4">
					<button
						type="button"
						onClick={onClose}
						disabled={saving}
						className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={saving || loading}
						className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
					>
						{saving ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</div>
		</div>
	);
}
