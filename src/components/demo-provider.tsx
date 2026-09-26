import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { bootstrapDemo, loadDemoData, type DemoData } from "../lib/demo";
import type { WorkspaceSummary } from "../lib/auth";

type DemoContextValue = {
  workspace: WorkspaceSummary;
  data: DemoData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({
  workspace,
  children,
}: {
  workspace: WorkspaceSummary;
  children: ReactNode;
}) {
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setError(null);
    try {
      if (
        workspace.onboardingStage === "complete" &&
        ["owner", "general_manager", "ecommerce_manager"].includes(workspace.role)
      ) {
        await bootstrapDemo(workspace.id);
      }
      setData(await loadDemoData(workspace.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load demo workspace.");
    } finally {
      setLoading(false);
    }
  }, [workspace.id, workspace.onboardingStage, workspace.role]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <DemoContext.Provider value={{ workspace, data, loading, error, refresh }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider is required.");
  return value;
}

export function StaticDemoProvider({
  workspace,
  data,
  children,
}: {
  workspace: WorkspaceSummary;
  data: DemoData;
  children: ReactNode;
}) {
  return (
    <DemoContext.Provider
      value={{ workspace, data, loading: false, error: null, refresh: async () => {} }}
    >
      {children}
    </DemoContext.Provider>
  );
}
