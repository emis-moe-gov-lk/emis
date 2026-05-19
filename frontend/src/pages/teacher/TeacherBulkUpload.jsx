import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  HiDocumentDownload,
  HiOutlineUpload,
  HiPaperClip,
  HiX,
} from "react-icons/hi";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import Button from "@/components/UiComponents/Button";

const TeacherBulkUpload = () => {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleClear = () => {
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error("Choose an Excel file before importing.");
      return;
    }

    toast("Upload service is not connected yet. UI is ready for integration.", {
      icon: "📄",
    });
  };

  return (
    <div className="mx-auto flex w-full w-full px-4 sm:px-6 lg:px-8 flex-col gap-8 px-6 py-6 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-6">
        <BackToListButton to="/employees/teacher" label="Back to Teachers" />

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Bulk upload Teachers
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Create teacher profile and account
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 p-5 sm:p-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
            <p className="text-base font-medium text-blue-700">
              Download our industry-standard sample CSV format:
            </p>

            <a
              href="/teacher-bulk-upload-sample.csv"
              download
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <HiDocumentDownload className="h-4 w-4" />
              Download Sample CSV
            </a>
          </div>

          <div className="mt-7">
            <label
              htmlFor="teacher-bulk-upload-file"
              className="mb-3 block text-base font-medium text-gray-900"
            >
              Upload Excel File
            </label>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <input
                  ref={inputRef}
                  id="teacher-bulk-upload-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="teacher-bulk-upload-file"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <HiOutlineUpload className="h-4 w-4" />
                  Choose File
                </label>

                <span className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </div>

              {selectedFile ? (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
                  <HiPaperClip className="h-4 w-4 text-gray-400" />
                  {selectedFile.name}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={handleClear}>
              <HiX className="h-4 w-4" />
              Clear
            </Button>

            <Button type="button" variant="primary" onClick={handleImport} disabled={!selectedFile}>
              <HiOutlineUpload className="h-4 w-4" />
              Import Teachers
            </Button>
          </div>
      </section>
    </div>
  );
};

export default TeacherBulkUpload;
