const SectionsUi = ({ title, data, onEdit }) => {
  return (
    <div className="relative mb-6">
      {/* Section title pill */}
      <div className="absolute -top-3 left-6 z-10 rounded-full surface-muted px-4 py-1 text-sm font-medium">
        {title}
      </div>

      {/* Section body */}
      <div className="rounded-2xl surface-muted p-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex gap-2">
              <span className="font-medium">{item.label}</span>
              <span>:</span>
              <span className="text-gray-800 dark:text-gray-100">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute right-4 bottom-4 rounded-full border px-4 py-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionsUi;
