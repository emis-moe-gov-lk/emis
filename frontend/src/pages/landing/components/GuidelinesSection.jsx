import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowRightLeft, CalendarDays, X, CheckCircle2, Download, ExternalLink, Globe } from "lucide-react";

const GuidelineModal = ({ guide, onClose }) => {
  const [showDownloadOptions, setShowDownloadDownloadOptions] = useState(false);

  if (!guide) return null;

  const handleDownload = (lang) => {
    const file = guide.downloads?.[lang];
    if (file) {
      const link = document.createElement('a');
      link.href = file;
      link.download = `${guide.title}_${lang.toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`The ${lang} version of this guide is not yet available.`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 bg-white/80 backdrop-blur-sm"
        >
          <X size={18} className="text-slate-400" />
        </button>

        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-6 sm:p-10">
            {/* Header - More Compact */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-3 rounded-2xl ${guide.color} text-white shadow-lg`}>
                <guide.icon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {guide.title}
                </h2>
                <p className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Procedure Guide
                </p>
              </div>
            </div>

            {/* Steps List - Reduced spacing */}
            <div className="space-y-5 mb-8">
              {guide.content.map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 font-black text-[10px]">
                      {idx + 1}
                    </div>
                    {idx !== guide.content.length - 1 && (
                      <div className="w-px h-full bg-slate-100 my-1" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 mb-1 leading-tight">{step.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions / Download Options */}
            <div className="pt-6 border-t border-slate-100">
               {!showDownloadOptions ? (
                  <button 
                    onClick={() => setShowDownloadDownloadOptions(true)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group/dl"
                  >
                    <Download size={16} className="group-hover/dl:animate-bounce" />
                    Download PDF Guide
                  </button>
               ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="flex items-center gap-2 mb-4 justify-center">
                        <Globe size={12} className="text-blue-600" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Language</span>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => handleDownload('si')}
                          className="py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-all font-bold text-[10px] uppercase tracking-tighter flex flex-col items-center gap-1 border border-slate-100"
                        >
                           <span className="text-base">සිං</span>
                           Sinhala
                        </button>
                        <button 
                          onClick={() => handleDownload('en')}
                          className="py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-all font-bold text-[10px] uppercase tracking-tighter flex flex-col items-center gap-1 border border-slate-100"
                        >
                           <span className="text-base">EN</span>
                           English
                        </button>
                        <button 
                          onClick={() => handleDownload('ta')}
                          className="py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-all font-bold text-[10px] uppercase tracking-tighter flex flex-col items-center gap-1 border border-slate-100"
                        >
                           <span className="text-base">தமிழ்</span>
                           Tamil
                        </button>
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const GuidelinesSection = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guidelineData = [
    {
      id: 'registration',
      title: "Registration",
      icon: FileText,
      description: "School & staff onboarding walkthrough.",
      color: "bg-blue-600",
      content: [
        { title: "Portal Access", text: "Visit your respective zonal education portal to begin the digital onboarding process." },
        { title: "Documentation", text: "Prepare and upload scanned copies of verified school establishment and staff service records." },
        { title: "Admin Review", text: "Wait for the Divisional and Zonal verification officers to approve your digital entry." }
      ],
      downloads: { en: null, si: null, ta: null }
    },
    {
      id: 'transfer',
      title: "Transfers",
      icon: ArrowRightLeft,
      description: "Rules for teacher placements & zones.",
      color: "bg-emerald-600",
      content: [
        { title: "Service Eligibility", text: "Confirm that you have completed at least 3 years of service in your current station." },
        { title: "HRMS Application", text: "Login to the HRMS portal and select 'Transfer Request' from the Management menu." },
        { title: "Preference Entry", text: "List your preferred schools in order of priority based on currently available vacancies." }
      ],
      downloads: { en: null, si: "/guidelines/transfer_si.pdf", ta: null }
    },
    {
      id: 'leave',
      title: "Leave Info",
      icon: CalendarDays,
      description: "Manage medical, study & casual leave.",
      color: "bg-purple-600",
      content: [
        { title: "Request Submission", text: "Select the required leave type (Medical, Casualty, or Study) from your portal." },
        { title: "Evidence Upload", text: "For medical leave over 2 days, upload the verified government medical certificate." },
        { title: "Status Tracking", text: "Monitor the approval chain from Principal to Zonal director in real-time." }
      ],
      downloads: { en: null, si: null, ta: null }
    }
  ];

  return (
    <section id="guidelines-section" className="py-24 bg-white border-t border-slate-50 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-400/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase">
            How it <span className="text-blue-600">Works</span>
          </h2>
          <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mb-8 shadow-sm shadow-blue-500/40" />
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Detailed procedural documentation for every core module in the national management infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {guidelineData.map((guide) => (
            <div 
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="group cursor-pointer relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl ${guide.color} text-white flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <guide.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">
                  {guide.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  {guide.description}
                </p>
                <div className="w-full py-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors flex items-center justify-center gap-2">
                   View Procedure <ExternalLink size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <GuidelineModal 
            guide={selectedGuide} 
            onClose={() => setSelectedGuide(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GuidelinesSection;
