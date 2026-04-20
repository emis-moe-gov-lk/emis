import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function HelpCenter() {
  return (
    <>
      <Header />
      {/* Main Container with Education-themed Background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
        {/* Subtle Education Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmMWY1ZmEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMTIgMGg2djI0aC02eiIvPjxwYXRoIGQ9Ik0zNiAwaDZ2MjRoLTZ6Ii8+PHBhdGggZD0iTTAgMTJoMjR2NkgweiIvPjxwYXRoIGQ9Ik0wIDM2aDI0djZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Knowledge Graph Background Element */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        
        {/* Notebook Lines Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative z-10">
          <div className="container mx-auto px-6 py-12">
            {/* Page Header */}
            <div className="text-center mb-16">
              <div className="inline-block">
                <h1 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text">
                  Help & Support Center
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Get assistance with the Sri Lanka Education Management System
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mt-6 rounded-full"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
              {/* Quick Help Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-white/60 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Student Portal</h3>
                  <p className="text-gray-600 mb-4">
                    Guide to using student features, enrollment, and academic records
                  </p>
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
                    Learn More 
                    <span className="text-lg">→</span>
                  </button>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-white/60 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Teacher Resources</h3>
                  <p className="text-gray-600 mb-4">
                    Resources for teachers, grade submission, and classroom management
                  </p>
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
                    Learn More 
                    <span className="text-lg">→</span>
                  </button>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-white/60 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <span className="text-2xl">🏫</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Administration</h3>
                  <p className="text-gray-600 mb-4">
                    Administrative tools, reports, and system management guides
                  </p>
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
                    Learn More 
                    <span className="text-lg">→</span>
                  </button>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border border-white/60">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  <div className="border-b border-gray-200/60 pb-6 hover:bg-blue-50/50 rounded-lg px-4 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      How to reset my password?
                    </h3>
                    <p className="text-gray-600 ml-4">
                      You can reset your password by clicking on "Forgot Password" on the login page. 
                      A reset link will be sent to your registered email address.
                    </p>
                  </div>
                  <div className="border-b border-gray-200/60 pb-6 hover:bg-blue-50/50 rounded-lg px-4 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      How to update student information?
                    </h3>
                    <p className="text-gray-600 ml-4">
                      Navigate to the Student Management section, select the student, and click "Edit Profile". 
                      Only authorized personnel can modify student records.
                    </p>
                  </div>
                  <div className="border-b border-gray-200/60 pb-6 hover:bg-blue-50/50 rounded-lg px-4 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Where can I find academic reports?
                    </h3>
                    <p className="text-gray-600 ml-4">
                      Academic reports are available in the Reports section. You can generate term reports, 
                      progress cards, and attendance summaries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10 text-center">
                  <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
                  <p className="text-blue-100 mb-6 text-lg">
                    Our support team is here to assist you with any questions
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg">
                      Contact Support
                    </button>
                    <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105">
                      Email Help Desk
                    </button>
                  </div>
                  <p className="text-blue-200 mt-4 flex items-center justify-center gap-2">
                    <span className="text-xl">📞</span>
                    Support Hotline: +94 11 2 345 678
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}