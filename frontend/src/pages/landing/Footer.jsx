import { MapPin, Mail, Phone, QrCode } from "lucide-react";
import emblemSriLanka from "../../assets/landing/Emblem_of_Sri_Lanka.svg";

const Footer = () => {
  return (
    <section id="Footer">
      <footer className="relative overflow-hidden bg-transparent text-white bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
          <div className="absolute w-32 h-32 bg-blue-500 rounded-full top-20 left-10 filter blur-3xl animate-pulse"></div>
          <div
            className="absolute w-40 h-40 bg-blue-500 rounded-full top-40 right-20 filter blur-3xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute w-48 h-48 bg-blue-500 rounded-full bottom-10 left-1/2 filter blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative px-4 py-8 mx-auto max-w-7xl sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
            {/* Column 1: Branding */}
            <div className="group col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6 space-x-2">
                <div className="flex items-center justify-center h-10 sm:h-12">
                  <img
                    className="w-auto h-10 sm:h-12"
                    src={emblemSriLanka}
                    alt="Logo"
                  />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
                    EMIS
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Education Management Information System serving the Ministry of
                Education, Higher Education and Vocational Education, enhancing
                learning through efficient data management.
              </p>
            </div>

            {/* Column 2: Contact Us */}
            <div className="col-span-1">
              <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold">
                Contact Us
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 animate-pulse">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-white break-words">
                      Ministry of Education, Isurupaya, Pelawatta, Battaramulla
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 animate-pulse">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <a
                      href="mailto:datamanagementbranch@gmail.com"
                      className="text-xs sm:text-sm text-white transition hover:text-blue-400 break-all"
                    >
                      datamanagementbranch@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    <div
                      className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <a
                      href="tel:+94112785141"
                      className="text-xs sm:text-sm text-white transition hover:text-blue-400"
                    >
                      +(94) 11-XXX XXXX
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 3: Follow Us */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold">
                Follow Us
              </h3>
              <p className="mb-6 text-xs sm:text-sm text-gray-300">
                Stay updated with the latest news and announcements.
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 shadow-lg"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.37-4.669 1.235 0 2.528.22 2.528.22v2.78h-1.424c-1.49 0-1.95.925-1.95 1.874v2.441h3.134l-.501 3.47h-2.633V23.93C19.612 23.029 24 18.065 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:text-white hover:scale-110 shadow-lg"
                  aria-label="Follow us on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-110 shadow-lg"
                  aria-label="Follow us on YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>

              {/* QR Code Placeholder stays for professional look */}
              {/* 
              <div className="mt-8 flex items-center gap-4">
                 <div className="flex flex-shrink-0 bg-white p-1.5 rounded-lg h-16 w-16 items-center justify-center shadow-lg">
                    <QrCode className="w-8 h-8 text-slate-800 opacity-50" />
                 </div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scan for <br/> Mobile Portal</p>
              </div>
              */}

              {/* Commented out old App Download section */}
              {/* 
              <p className="mb-4 text-xs sm:text-sm text-gray-300">
                Access EMIS on the go.
              </p>
              <div className=\"flex flex-row-reverse items-start justify-around gap-3 sm:gap-4\">
                ... buttons ...
              </div>
              */}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between pt-6 sm:pt-8 mt-8 border-t border-gray-800 gap-4 sm:gap-0 md:flex-row">
            <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} Ministry of Education, Higher Education and Vocational Education.
              All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <a href="#" className="text-gray-400 transition hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 transition hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 transition hover:text-white">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};
export default Footer;
