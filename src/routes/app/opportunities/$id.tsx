import { createFileRoute } from "@tanstack/react-router";
import { OpportunityDetailScreen } from "../../../components/screens/insights";

export const Route = createFileRoute("/app/opportunities/$id")({
  component: OpportunityRoute,
});

function OpportunityRoute() {
  const { id } = Route.useParams();
  return <OpportunityDetailScreen id={id} />;
}
