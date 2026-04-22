const Header = ({ userRoles = [] }) => {
  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-jakarta">
        National Education Management System
      </h1>

      <p className="text-slate-500 mt-2 text-xml font-medium">
        {userRoles.length > 0
          ? capitalizeFirstLetter(userRoles[0])
          : "Loading..."}{" "}
        • {capitalizeFirstLetter(new Date().toDateString())}
      </p>
    </div>
  );
};

export default Header;
