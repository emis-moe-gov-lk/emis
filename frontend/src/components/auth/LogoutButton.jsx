"use client";
import { useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Button } from "flowbite-react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function LogoutButton() {
  const { signOut } = useAuthContext();
  const [openModal, setOpenModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* 🔵 LOGOUT BUTTON — UPDATED UI ONLY */}
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        className="
          flex items-center justify-center gap-2
          px-4
          py-2
          rounded-xl
          bg-gradient-to-r from-blue-600 to-indigo-700
          text-white
          font-bold
          text-xs
          uppercase
          tracking-wider
          shadow-lg shadow-blue-500/25
          hover:shadow-blue-500/40
          hover:scale-[1.02]
          active:scale-95
          transition-all
        "
      >
        {/* Logout Icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path
            d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 17L15 12L10 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 12H3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <span className="tracking-wide uppercase">Logout</span>
      </button>

      {/* 🟡 CONFIRMATION MODAL — UNCHANGED */}
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
              Are you sure you want to logout?
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              You will be signed out of your account and redirected to the login
              page.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                color="red"
                onClick={handleLogout}
                className="rounded-full px-5 py-2 shadow-md hover:opacity-95 transition"
              >
                Yes, I'm sure
              </Button>
              <Button
                color="alternative"
                onClick={() => setOpenModal(false)}
                className="rounded-full px-5 py-2"
              >
                No, cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
