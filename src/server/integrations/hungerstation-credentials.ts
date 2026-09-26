// Server-only contract. No browser route imports this module.
export type HungerStationCredentialConfig = {
  connectionId: string;
  mode: "sandbox";
  chainId: string;
  vendorIds: readonly string[];
  clientIdSecretRef: string;
  clientSecretRef: string;
};

export function validateCredentialConfig(config: HungerStationCredentialConfig): void {
  if (!config.chainId || config.vendorIds.length === 0)
    throw new Error("Partner identifiers are required.");
  if (!config.clientIdSecretRef || !config.clientSecretRef)
    throw new Error("Secret references are required.");
}
