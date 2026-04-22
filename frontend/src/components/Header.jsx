import { useState, useEffect } from "react";
import LoginButton from "../components/auth/LoginButton";
import emblem from "../assets/images/Emblem_of_Sri_Lanka.svg";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200"
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group">
            {/* Emblem container */}
            <img
                src={emblem}
                alt="Emblem of Sri Lanka"
                className="w-10 h-10 object-contain filter"
              />

            {/* Text section */}
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                EMIS
              </span>
              <span className="text-xs text-blue-700 font-extrabold tracking-wide">
                Education Management System
              </span>
            </div>
          </a>

          {/* Right Side - Navigation & Actions */}
          <div className="flex items-center space-x-3">
            {/* Help Center Link */}
            <a
              href="/help-center"
              className="hidden sm:flex items-center text-gray-600 hover:text-blue-600 font-medium text-sm transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50 group"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help Center
            </a>

            {/* Search Icon */}
            <button className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-105">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Login Button */}
            <div className="ml-2">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;