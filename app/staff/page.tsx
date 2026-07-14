import type { Metadata } from "next";
import { StaffDashboard } from "@/components/StaffDashboard";

export const metadata: Metadata = {
  title: "Operations dashboard",
  description:
    "Shared simulated matchday telemetry with grounded, human-reviewed stadium operations recommendations.",
};

export default function StaffPage() {
  return (
    <div className="container max-w-7xl py-7 sm:py-10">
      <StaffDashboard />
    </div>
  );
}
