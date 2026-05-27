const Header = ({ userRoles = [] }) => {
  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const capitalizeAllLetters = (text) => {
    if (!text) return "";
    return text.toUpperCase();
  };
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-jakarta">
        National Education Management System
      </h1>

      <p className="text-slate-500 dark:text-gray-400 mt-2 text-xml font-medium">
        {userRoles.length > 0
          ? capitalizeAllLetters(userRoles[0])
          : "Loading..."}{" "}
        • {capitalizeAllLetters(new Date().toDateString())}
      </p>
    </div>
  );
};

export default Header;
