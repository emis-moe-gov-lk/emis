import React from 'react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Error Code */}
        <div className="text-8xl font-bold text-blue-900 mb-4">404</div>
        
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          <button 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
            onClick={() => window.location.href = '/'}
          >
            Return to Homepage
          </button>
        </div>

        {/* Support Text */}
        <p className="text-gray-500 text-sm mt-8">
          If you need immediate assistance, please contact our support team.
        </p>
      </div>
    </div>
  );
};