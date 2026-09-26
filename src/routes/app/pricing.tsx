import { createFileRoute } from "@tanstack/react-router";
import { PricingScreen } from "../../components/screens/insights";

export const Route = createFileRoute("/app/pricing")({
  component: PricingScreen,
});
