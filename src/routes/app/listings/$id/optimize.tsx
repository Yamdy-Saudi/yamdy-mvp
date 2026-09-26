import { createFileRoute } from "@tanstack/react-router";
import { ContentOptimizerScreen } from "../../../../components/screens/catalog";

export const Route = createFileRoute("/app/listings/$id/optimize")({
  component: OptimizerRoute,
});

function OptimizerRoute() {
  const { id } = Route.useParams();
  return <ContentOptimizerScreen id={id} />;
}
