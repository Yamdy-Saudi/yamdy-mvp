import { createFileRoute } from "@tanstack/react-router";
import { SettingsScreen } from "../../components/screens/governance";

export const Route = createFileRoute("/app/settings")({
  component: SettingsScreen,
});
