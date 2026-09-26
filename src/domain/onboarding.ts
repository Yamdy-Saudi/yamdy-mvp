export type OnboardingStage = "connect" | "import" | "complete";

export function validateWorkspaceInput(input: {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
  acceptedTerms: boolean;
}): string | null {
  if (input.fullName.trim().length < 2) return "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return "Enter a valid work email.";
  if (input.password.length < 8) return "Use at least 8 password characters.";
  if (input.businessName.trim().length < 2) return "Enter your business name.";
  if (!input.acceptedTerms) return "Accept the terms to continue.";
  return null;
}

export function nextOnboardingStage(stage: OnboardingStage): OnboardingStage {
  return stage === "connect" ? "import" : "complete";
}
