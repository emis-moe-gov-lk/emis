import HeroSection from "./components/HeroSection";
import UseCasesSection from "./components/UseCasesSection";
import StatsSection from "./components/StatsSection";
import GuidelinesSection from "./components/GuidelinesSection";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StatsSection />
      <UseCasesSection />
      <GuidelinesSection />
    </div>
  );
};

export default Welcome;
