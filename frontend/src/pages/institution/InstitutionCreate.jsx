import BackToListButton from "@/components/UiComponents/BackToListButton";

const InstitutionCreate = () => {
  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <BackToListButton to="/institution" label="Back to List" />
      </div>

      {/* Page title */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Institution</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Institution creation form will be added here.
      </p>

      {/* Form placeholder */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 bg-white dark:bg-gray-800/50 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Institution creation form will be added here.
        </p>
      </div>
    </div>
  );
};

export default InstitutionCreate;
