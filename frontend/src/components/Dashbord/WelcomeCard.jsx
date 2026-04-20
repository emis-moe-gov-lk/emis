import welcomeImage from "/welcome.png";

const WelcomeCard = ({ user, people }) => {
  console.log("WelcomeCard received user:", user);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#635BFF] via-[#564df0] to-[#4338ca] p-10 shadow-2xl shadow-indigo-200 text-white">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
        <div className="w-full md:w-3/5 space-y-6">
          {/* Date */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
            {today}
          </div>

          {/* Welcome Title */}
          <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1]">
            Welcome Back,
            <br /> {user?.name}!
          </h3>

          {/* Profile Status */}
          <p className="text-indigo-100 text-lg font-medium max-w-md opacity-90">
            Your profile{" "}
            <span className="text-white underline decoration-teal-400 underline-offset-4">
              {people?.appointment?.is_verified ? "Verified" : "Not Verified"}
            </span>
            . Please check your profile and update your information if needed.
          </p>

          {/* Button */}
          <a
            href="/dashboard/profile"
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
          >
            👤 My Profile
          </a>
        </div>

        {/* Image */}
        <div className="hidden md:block relative w-full md:w-2/5 h-64">
          <img
            src={welcomeImage}
            alt="Dashboard Illustration"
            className="absolute bottom-0 right-0 h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      {/* Background Glow Effects */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/4 top-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};

export default WelcomeCard;
