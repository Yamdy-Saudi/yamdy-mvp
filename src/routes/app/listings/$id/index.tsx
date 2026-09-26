import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailScreen } from "../../../../components/screens/catalog";

export const Route = createFileRoute("/app/listings/$id/")({
  component: ProductRoute,
});

function ProductRoute() {
  const { id } = Route.useParams();
  return <ProductDetailScreen id={id} />;
}
