import { RightsClient } from "./RightsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Know Your Rights | RationLens",
};

export default function RightsPage() {
  return <RightsClient />;
}
