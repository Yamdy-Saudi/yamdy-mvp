import { createFileRoute } from "@tanstack/react-router";
import { OpportunitiesScreen } from "../../../components/screens/insights";

export const Route = createFileRoute("/app/opportunities/")({
  component: OpportunitiesScreen,
});
