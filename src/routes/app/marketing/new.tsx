import { createFileRoute } from "@tanstack/react-router";
import { CampaignBuilderScreen } from "../../../components/screens/commerce";

export const Route = createFileRoute("/app/marketing/new")({
  component: CampaignBuilderScreen,
});
