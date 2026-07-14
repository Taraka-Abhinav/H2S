import { ChallengeCoverage } from "@/components/home/ChallengeCoverage";
import { HomeCallToAction } from "@/components/home/HomeCallToAction";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeMetrics } from "@/components/home/HomeMetrics";
import { PersonaChooser } from "@/components/home/PersonaChooser";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HomeHero />
      <HomeMetrics />
      <PersonaChooser />
      <ChallengeCoverage />
      <HomeFeatures />
      <HomeCallToAction />
    </div>
  );
}
