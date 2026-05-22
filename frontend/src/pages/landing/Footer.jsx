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
                    NEMIS
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                National Education Management Information System serving the Ministry of
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

            {/* Column 3: Download App + QR Code */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold">
                Download App
              </h3>
              <p className="mb-4 text-xs sm:text-sm text-gray-300">
                Access NEMIS on the go.
              </p>

              {/* Flex container: Ensures buttons and QR stay side-by-side even on mobile */}
              <div className="flex flex-row-reverse items-start justify-around gap-3 sm:gap-4">
                {/* Buttons Column */}
                <div className="flex flex-col gap-2 flex-grow sm:flex-grow-0">
                  <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-white transition-all bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-xs sm:text-sm whitespace-nowrap">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="currentColor"
                      viewBox="0 0 512 512"
                    >
                      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                    </svg>
                    <span>Google Play</span>
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-white transition-all bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-xs sm:text-sm whitespace-nowrap">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="currentColor"
                      viewBox="0 0 384 512"
                    >
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                    </svg>
                    <span>App Store</span>
                  </button>
                </div>

                {/* QR Code Placeholder (Visible on all screens) */}
                <div className="flex flex-shrink-0 bg-white p-1.5 rounded-lg h-[86px] w-[86px] items-center justify-center shadow-lg">
                  <div className="w-full h-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-800">
                    <QrCode className="w-8 h-8 opacity-50" />
                    <span className="text-[8px] font-bold mt-1 uppercase tracking-wide">
                      Scan Me
                    </span>
                  </div>
                </div>
              </div>
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
