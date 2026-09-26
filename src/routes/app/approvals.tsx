import { createFileRoute } from "@tanstack/react-router";
import { ApprovalsScreen } from "../../components/screens/governance";

export const Route = createFileRoute("/app/approvals")({
  component: ApprovalsScreen,
});
