import React, { useEffect, useState } from "react";
import { Menu, X, Users, ChevronDown, UserCircle, ArrowRightLeft, CalendarDays, Ban } from "lucide-react";
import emblemSriLanka from "../../assets/landing/Emblem_of_Sri_Lanka.svg";
import { useAuthContext as useAsgardeo } from "@asgardeo/auth-react";

// Header Component
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, signOut, signIn } = useAsgardeo();
  const { isAuthenticated } = state;

  const handleSignIn = () => {
    signIn();
  };

  const [navState, setNavState] = useState("top");

  useEffect(() => {
  

    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 50) {
        setNavState("top");
      } else {
        setNavState("scrolled");
      }
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
        navState === "top"
          ? "bg-transparent text-white"
          : "bg-slate-900/80 backdrop-blur-xl border-b border-white/5 text-white shadow-2xl"
      } `}
    >
      <div className={`mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 `}>
        <div className="flex h-20 items-center justify-between">
          {/* Brand - Left Edge */}
          <a
            href="/"
            className="flex items-center gap-4 transition-transform duration-300 hover:scale-[1.01] focus:outline-none group"
            aria-label="Go to homepage"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/10 p-2 transition-all duration-500 group-hover:bg-white/20 group-hover:rotate-3 shadow-inner">
              <img
                src={emblemSriLanka}
                alt="EMIS"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tighter text-white uppercase">
                EMIS
              </span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                Education Management Information System
              </span>
            </div>
          </a>

          {/* Combined Right Section (Services + Auth) */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex items-center">
              {/* Services Dropdown */}
              <li className="relative group">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 focus:outline-none cursor-pointer"
                >
                  Services
                  <ChevronDown size={14} className="transition-transform duration-500 group-hover:rotate-180 text-blue-400" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-500 ease-out z-50">
                  <div className="w-80 rounded-[1.5rem] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 bg-slate-900/95 backdrop-blur-3xl p-2">
                    {/* HRMS Link - Working */}
                    <button
                      onClick={handleSignIn}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 hover:bg-white/5 group/item text-left cursor-pointer"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all duration-300 shadow-lg">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white leading-tight uppercase">HRMS</p>
                        <p className="mt-1 text-[10px] font-bold text-gray-500 uppercase tracking-tight group-hover/item:text-gray-300">Human Resource Management</p>
                      </div>
                    </button>

                    {/* Transfer Link - Teacher Transfer System, Stop icon on hover */}
                    <div className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group/item text-left border border-transparent hover:bg-white/5 cursor-not-allowed">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white/20 border border-white/5 group-hover:border-red-500/30 group-hover:bg-red-500/5 transition-all duration-300">
                        <ArrowRightLeft size={24} />
                      </div>
                      <div className="flex-1 relative">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-white/40 leading-tight uppercase group-hover:text-red-400/50 transition-colors">TRANSFER</p>
                          <Ban size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <p className="mt-1 text-[10px] font-bold text-gray-700 uppercase tracking-tight group-hover:text-red-900/40 transition-colors">Teacher Transfer System</p>
                      </div>
                    </div>

                    {/* Leave Link - Leave Management System, Stop icon on hover */}
                    <div className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group/item text-left border border-transparent hover:bg-white/5 cursor-not-allowed">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white/20 border border-white/5 group-hover:border-red-500/30 group-hover:bg-red-500/5 transition-all duration-300">
                        <CalendarDays size={24} />
                      </div>
                      <div className="flex-1 relative">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-white/40 leading-tight uppercase group-hover:text-red-400/50 transition-colors">LEAVE</p>
                          <Ban size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <p className="mt-1 text-[10px] font-bold text-gray-700 uppercase tracking-tight group-hover:text-red-900/40 transition-colors">Leave Management System</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl active:scale-95"
                >
                  Dashboard <Users size={16} />
                </a>

                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 p-2 text-white hover:bg-white/10 focus:outline-none transition-all duration-300"
            >
              {!isOpen ? <Menu size={24} /> : <X size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden bg-slate-900/95 backdrop-blur-3xl transition-all duration-500 ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-12 pt-6">
          <nav className="space-y-6">
            <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] px-2 mb-4">System Modules</div>
            
            <button
              onClick={handleSignIn}
              className="w-full flex items-center gap-5 p-5 rounded-3xl bg-white/5 text-white border border-white/5"
            >
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <UserCircle size={28} />
              </div>
              <div className="text-left">
                <p className="text-base font-black uppercase tracking-tight">HRMS</p>
                <p className="text-[10px] font-bold text-white/40 uppercase mt-1">Human Resource Management</p>
              </div>
            </button>

            <div className="w-full flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/5 cursor-not-allowed opacity-40">
              <div className="p-3 rounded-xl bg-slate-800 text-slate-500">
                <ArrowRightLeft size={28} />
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-base font-black text-white/40 uppercase tracking-tight">TRANSFER</p>
                  <Ban size={20} className="text-red-500" />
                </div>
                <p className="text-[10px] font-bold text-white/20 uppercase mt-1">Teacher Transfer System</p>
              </div>
            </div>

            <div className="w-full flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/5 cursor-not-allowed opacity-40">
              <div className="p-3 rounded-xl bg-slate-800 text-slate-500">
                <CalendarDays size={28} />
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-base font-black text-white/40 uppercase tracking-tight">LEAVE</p>
                  <Ban size={20} className="text-red-500" />
                </div>
                <p className="text-[10px] font-bold text-white/20 uppercase mt-1">Leave Management System</p>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
};
export default Header;
