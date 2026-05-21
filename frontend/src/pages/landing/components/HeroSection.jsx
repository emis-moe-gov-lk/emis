import students8 from "../../../assets/landing/hero-image.png";
import { useAuthContext } from "@asgardeo/auth-react";

const HeroSection = () => {
  const { signIn } = useAuthContext();

  return (
    <section
      id="landing"
      className="relative min-h-screen flex items-center bg-slate-900 bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `url(${students8})`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/60 to-slate-900/40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl">
          National Education Management Information System
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-white/95 mb-3 font-semibold max-w-3xl">
          Official Platform for Sri Lanka's School Administration
        </p>

        {/* Stats */}
        <br />
        <p className="text-base md:text-lg text-white/85 mb-8 max-w-3xl leading-relaxed">
          A secure, centralized system connecting 10,000+ schools, 250,000+
          teachers, and 4 million students across all nine provinces.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg text-base sm:text-lg border-2 border-white/30 hover:border-white/50 transition-all">
            Learn How It Works
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
