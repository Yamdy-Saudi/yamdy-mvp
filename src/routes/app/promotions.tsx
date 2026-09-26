import { createFileRoute } from "@tanstack/react-router";
import { PromotionsScreen } from "../../components/screens/commerce";

export const Route = createFileRoute("/app/promotions")({
  component: PromotionsScreen,
});
