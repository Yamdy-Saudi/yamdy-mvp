import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "../components/yamdy-shell";
import { DemoProvider } from "../components/demo-provider";
import { useWorkspace } from "../hooks/use-workspace";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const state = useWorkspace();
  if (state.loading) return <div className="loading-state">Loading your workspace…</div>;
  if (state.error) return <div className="loading-state form-error">{state.error}</div>;
  if (!state.workspace)
    return <div className="loading-state">No workspace assigned to this account.</div>;
  return (
    <DemoProvider workspace={state.workspace}>
      <AppShell workspace={state.workspace}>
        <Outlet />
      </AppShell>
    </DemoProvider>
  );
}
