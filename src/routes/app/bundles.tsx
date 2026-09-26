import { createFileRoute } from "@tanstack/react-router";
import { BundlesScreen } from "../../components/screens/commerce";

export const Route = createFileRoute("/app/bundles")({
  component: BundlesScreen,
});
