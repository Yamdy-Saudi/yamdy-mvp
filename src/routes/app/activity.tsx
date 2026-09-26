import { createFileRoute } from "@tanstack/react-router";
import { ActivityScreen } from "../../components/screens/governance";

export const Route = createFileRoute("/app/activity")({
  component: ActivityScreen,
});
