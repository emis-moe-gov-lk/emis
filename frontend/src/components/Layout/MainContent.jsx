import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router";
import Header from "./Header";

const MainContent = ({ isCollapsed, isMobile }) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {!isMobile && <Header isCollapsed={isCollapsed} />}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-white dark:bg-gray-900 rounded-2xl mb-4 border dark:border-gray-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-7xl"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainContent;
