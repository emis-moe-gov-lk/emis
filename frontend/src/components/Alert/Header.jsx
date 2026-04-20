import React from "react";

const Header = () => {
  return (
    <div className="relative mb-6 w-full">
      {/* Heading */}
      <h1 className="text-xl font-bold">Alerts Overview</h1>

      {/* Subheading */}
      <h2 className="text-lg font-semibold mb-6 text-slate-600">
        Manage Alerts!
      </h2>

      {/* Separator */}
      <hr className="border-t border-slate-200" />
    </div>
  );
};

export default Header;
