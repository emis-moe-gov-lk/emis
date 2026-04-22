import { useState, useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import NavBar from "../components/Layout/NavBar";
import SideBar from "../components/Layout/SideBar";
import MainContent from "../components/Layout/MainContent";
import RightSidebar from "../components/Layout/RightSidebar";

const DashboardLayout = () => {
  // const location = useLocation();
  const { state, getBasicUserInfo, getDecodedIDToken } = useAuthContext();
  const [userInfo, setUserInfo] = useState({ name: "User", email: "Email" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch authenticated user info

  useEffect(() => {
    if (!state.isAuthenticated) return;

    Promise.all([getBasicUserInfo(), getDecodedIDToken()])
      .then(([basic, decoded]) => {
        setUserInfo({
          name: basic?.displayName || decoded?.name || state.username || "User",
          email: basic?.email || decoded?.email || "Email",
        });
      })
      .catch(console.error);
  }, [
    state.isAuthenticated,
    getBasicUserInfo,
    getDecodedIDToken,
    state.username,
  ]);

  // Responsive detection

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      {/* MOBILE NAVBAR */}
      {isMobile && (
        <NavBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      {/* SIDEBAR */}
      <SideBar
        isCollapsed={isCollapsed}
        onToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      {/* MAIN CONTENT */}
      {/* CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden pt-16 lg:pt-0 bg-gray-50 dark:bg-gray-900">
        <MainContent isCollapsed={isCollapsed} isMobile={isMobile} />
        <RightSidebar userInfo={userInfo} />
      </div>

      {/* MOBILE OVERLAY (inside shell) */}
      {isSidebarOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
