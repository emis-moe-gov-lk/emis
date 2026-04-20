import React, { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { FiEdit2, FiUser } from "react-icons/fi";

const AvatarUploader = ({ onChange, initialImage }) => {
  const inputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [preview, setPreview] = useState(initialImage);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const openFilePicker = () => inputRef.current.click();

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Only JPG or PNG allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const convertToWebP = async () => {
    const img = new Image();
    img.src = imageSrc;
    await new Promise((res) => (img.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 400, 400);

    canvas.toBlob(
      (blob) => {
        setPreview(URL.createObjectURL(blob));
        onChange(blob);
        setImageSrc(null);
      },
      "image/webp",
      0.9,
    );
  };

  return (
    <div className="relative h-32 w-32">
      {/* Avatar */}
      {preview ? (
        <img
          src={preview}
          alt="Avatar"
          className="h-32 w-32 rounded-full object-cover border"
        />
      ) : (
        <div className="h-32 w-32 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 border">
          <FiUser className="text-gray-500 dark:text-gray-300" size={32} />
        </div>
      )}

      {/* Pencil Icon */}
      <button
        onClick={openFilePicker}
        className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1.5 text-white shadow hover:bg-blue-700"
      >
        <FiEdit2 size={14} />
      </button>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Crop Modal (simple inline) */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl w-[90%] max-w-md">
            <div className="relative h-64 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setImageSrc(null)}
                className="px-4 py-2 text-sm rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={convertToWebP}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
