import HeroSection from "./components/HeroSection";
import UseCasesSection from "./components/UseCasesSection";
import StatsSection from "./components/StatsSection";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StatsSection />
      <UseCasesSection />
    </div>
  );
};

export default Welcome;
