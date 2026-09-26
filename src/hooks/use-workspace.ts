import { useEffect, useState } from "react";
import { getCurrentUser, loadWorkspace, type WorkspaceSummary } from "../lib/auth";
import { getSupabase } from "../lib/supabase";

type State =
  | { loading: true; workspace: null; error: null }
  | { loading: false; workspace: WorkspaceSummary | null; error: string | null };

export function useWorkspace(): State {
  const [state, setState] = useState<State>({ loading: true, workspace: null, error: null });
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        if (!getSupabase()) {
          if (active)
            setState({
              loading: false,
              workspace: null,
              error:
                "Supabase is not configured. Copy .env.example to .env.local and add the local publishable key.",
            });
          return;
        }
        const user = await getCurrentUser();
        if (!user) {
          if (active) window.location.replace("/signin");
          return;
        }
        const workspace = await loadWorkspace();
        if (active) setState({ loading: false, workspace, error: null });
      } catch (error) {
        if (active)
          setState({
            loading: false,
            workspace: null,
            error: error instanceof Error ? error.message : "Could not load workspace.",
          });
      }
    }
    void refresh();
    return () => {
      active = false;
    };
  }, []);
  return state;
}
