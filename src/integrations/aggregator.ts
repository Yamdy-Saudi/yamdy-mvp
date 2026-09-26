export type AggregatorProvider = "hungerstation";
export type AggregatorMode = "mock" | "sandbox";
export type Capability =
  | "catalog.read"
  | "price.write"
  | "availability.write"
  | "orders.read"
  | "promotions.strikethrough";

export type BranchCandidate = {
  externalVendorId: string;
  code: string;
  name: string;
  nameAr: string;
  city: string;
  menuItems: number;
  selectedByDefault: boolean;
};

export type BusinessPreview = {
  brandName: string;
  brandNameAr: string;
  branches: BranchCandidate[];
  source: "demo" | "sandbox";
};

export interface AggregatorAdapter {
  readonly provider: AggregatorProvider;
  readonly mode: AggregatorMode;
  readonly capabilities: readonly Capability[];
  previewBusiness(): Promise<BusinessPreview>;
}

export class UnsupportedCapabilityError extends Error {
  constructor(capability: string) {
    super(`Aggregator capability unavailable: ${capability}`);
    this.name = "UnsupportedCapabilityError";
  }
}
