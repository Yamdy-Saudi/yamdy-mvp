import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StaticDemoProvider } from "../components/demo-provider";
import { AppShell } from "../components/yamdy-shell";
import {
  HomeScreen,
  HealthScreen,
  OpportunitiesScreen,
  OpportunityDetailScreen,
  PricingScreen,
  PerformanceScreen,
} from "../components/screens/insights";
import {
  ListingsScreen,
  ProductDetailScreen,
  ContentOptimizerScreen,
} from "../components/screens/catalog";
import {
  PromotionsScreen,
  BundlesScreen,
  MarketingScreen,
  CampaignBuilderScreen,
  BidsScreen,
} from "../components/screens/commerce";
import { ApprovalsScreen, ActivityScreen, SettingsScreen } from "../components/screens/governance";
import { previewData, previewWorkspace } from "../demo/preview-data";

export const Route = createFileRoute("/demo-preview")({ component: DemoPreview });

const screens = [
  ["Home", <HomeScreen />],
  ["Opportunities", <OpportunitiesScreen />],
  ["Opportunity Detail", <OpportunityDetailScreen id={previewData.opportunities[1]!.id} />],
  ["Health", <HealthScreen />],
  ["Listings", <ListingsScreen />],
  ["Product Detail", <ProductDetailScreen id={previewData.products[0]!.id} />],
  ["Content Optimizer", <ContentOptimizerScreen id={previewData.products[0]!.id} />],
  ["Pricing", <PricingScreen />],
  ["Promotions", <PromotionsScreen />],
  ["Bundles", <BundlesScreen />],
  ["Marketing", <MarketingScreen />],
  ["Campaign Builder", <CampaignBuilderScreen />],
  ["Bids", <BidsScreen />],
  ["Performance", <PerformanceScreen />],
  ["Approvals", <ApprovalsScreen />],
  ["Activity", <ActivityScreen />],
  ["Settings", <SettingsScreen />],
] as const;

function DemoPreview() {
  const [selected, setSelected] = useState(0);
  if (!import.meta.env.DEV)
    return <div className="loading-state">Preview available in development only.</div>;
  return (
    <StaticDemoProvider workspace={previewWorkspace} data={previewData}>
      <AppShell workspace={previewWorkspace}>
        <div className="demo-preview-switcher">
          <span>Visual QA · static fixture</span>
          <select
            aria-label="Preview screen"
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {screens.map(([name], index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {screens[selected]?.[1]}
      </AppShell>
    </StaticDemoProvider>
  );
}
