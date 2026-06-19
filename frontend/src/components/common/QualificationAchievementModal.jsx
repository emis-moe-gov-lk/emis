import { HiOfficeBuilding, HiCalendar } from "react-icons/hi";
import DarkSafeModal, {
	darkSafeInputClass,
	darkSafeTextareaClass,
	darkSafeButtonClasses,
} from "@/components/common/DarkSafeModal";

export default function QualificationAchievementModal({
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
