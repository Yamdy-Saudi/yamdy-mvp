import { createFileRoute } from "@tanstack/react-router";
import { ListingsScreen } from "../../../components/screens/catalog";

export const Route = createFileRoute("/app/listings/")({
  component: ListingsScreen,
});
