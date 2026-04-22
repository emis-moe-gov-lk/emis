import { useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function LogoutButton2({ isCollapsed }) {
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
      {/* 🔵 REFINED LOGOUT BUTTON */}
      <div className="mt-auto px-4 pb-6">
        <button
          onClick={() => setOpenModal(true)}
          className={`
            flex items-center gap-3
            w-full
            px-4
            py-3
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
            ${isCollapsed ? "justify-center" : "justify-start"}
          `}
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>
      </div>

      {/*  Confirmation Modal */}
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-blue-500" />

            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
              Are you sure you want to logout?
            </h3>

            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              You will be signed out of your account and redirected to the login
              page.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleLogout}
                className="
                  rounded-full px-5 py-2
                  bg-gradient-to-r from-blue-600 to-indigo-700
                  text-white shadow-md
                  hover:from-blue-700 hover:to-indigo-800
                "
              >
                Yes, logout
              </Button>

              <Button
                color="alternative"
                onClick={() => setOpenModal(false)}
                className="rounded-full px-5 py-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
