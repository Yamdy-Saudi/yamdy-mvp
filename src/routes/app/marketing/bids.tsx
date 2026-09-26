import { createFileRoute } from "@tanstack/react-router";
import { BidsScreen } from "../../../components/screens/commerce";

export const Route = createFileRoute("/app/marketing/bids")({
  component: BidsScreen,
});
