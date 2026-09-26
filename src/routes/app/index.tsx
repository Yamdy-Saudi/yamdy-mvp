import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "../../components/screens/insights";

export const Route = createFileRoute("/app/")({
  component: HomeScreen,
});
