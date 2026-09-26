import type { AggregatorAdapter, BusinessPreview } from "../aggregator";

const preview: BusinessPreview = {
  brandName: "Shawarma & Co.",
  brandNameAr: "شاورما وشركاه",
  source: "demo",
  branches: [
    {
      externalVendorId: "demo-olaya",
      code: "demo-olaya",
      name: "Riyadh — Olaya",
      nameAr: "الرياض — العليا",
      city: "Riyadh",
      menuItems: 142,
      selectedByDefault: true,
    },
    {
      externalVendorId: "demo-nakheel",
      code: "demo-nakheel",
      name: "Riyadh — Al Nakheel",
      nameAr: "الرياض — النخيل",
      city: "Riyadh",
      menuItems: 138,
      selectedByDefault: true,
    },
    {
      externalVendorId: "demo-malqa",
      code: "demo-malqa",
      name: "Riyadh — Al Malqa",
      nameAr: "الرياض — الملقا",
      city: "Riyadh",
      menuItems: 127,
      selectedByDefault: true,
    },
  ],
};

export const mockHungerStationAdapter: AggregatorAdapter = {
  provider: "hungerstation",
  mode: "mock",
  capabilities: ["catalog.read"],
  async previewBusiness() {
    return structuredClone(preview);
  },
};
