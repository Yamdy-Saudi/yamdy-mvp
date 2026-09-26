import { createFileRoute } from "@tanstack/react-router";
import { PerformanceScreen } from "../../components/screens/insights";

export const Route = createFileRoute("/app/performance")({
  component: PerformanceScreen,
});
