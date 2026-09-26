import { createFileRoute } from "@tanstack/react-router";
import { HealthScreen } from "../../components/screens/insights";

export const Route = createFileRoute("/app/health")({
  component: HealthScreen,
});
