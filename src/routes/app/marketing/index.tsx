import { createFileRoute } from "@tanstack/react-router";
import { MarketingScreen } from "../../../components/screens/commerce";

export const Route = createFileRoute("/app/marketing/")({
  component: MarketingScreen,
});
