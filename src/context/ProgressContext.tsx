"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { ValidationContext } from "@/types/validation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface ProgressState {
  completedSteps: Record<string, boolean>;
  points: number;
  validationContext: ValidationContext;
}

type ProgressAction =
  | {
      type: "COMPLETE_STEP";
      stepId: string;
      points: number;
      context?: ValidationContext;
    }
  | { type: "LOAD"; state: ProgressState }
  | { type: "RESET" }
  | { type: "RESET_MODULE"; stepIds: string[]; pointsToRemove: number };

const initialState: ProgressState = {
  completedSteps: {},
  points: 0,
  validationContext: {},
};

function progressReducer(
  state: ProgressState,
  action: ProgressAction
): ProgressState {
  switch (action.type) {
    case "COMPLETE_STEP": {
      if (state.completedSteps[action.stepId]) return state;
      return {
        ...state,
        completedSteps: { ...state.completedSteps, [action.stepId]: true },
        points: state.points + action.points,
        validationContext: {
          ...state.validationContext,
          ...action.context,
        },
      };
    }
    case "LOAD":
      return action.state;
    case "RESET_MODULE": {
      const newCompleted = { ...state.completedSteps };
      for (const id of action.stepIds) {
        delete newCompleted[id];
      }
      return {
        ...state,
        completedSteps: newCompleted,
        points: Math.max(0, state.points - action.pointsToRemove),
      };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function saveToLocalStorage(state: ProgressState) {
  localStorage.setItem("liftoff_progress", JSON.stringify(state));
}

interface ProgressContextValue extends ProgressState {
  isHydrated: boolean;
  hasLocalProgress: boolean;
  completeStep: (
    stepId: string,
    points: number,
    context?: ValidationContext
  ) => void;
  isStepCompleted: (stepId: string) => boolean;
  resetProgress: () => void;
  resetModule: (stepIds: string[], pointsPerStep: number) => void;
  importLocalProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined
);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasLocalProgress, setHasLocalProgress] = useState(false);
  const { isRegistered, supabaseUser } = useAuth();

  // Load progress from the appropriate backend
  useEffect(() => {
    async function loadProgress() {
      if (isRegistered && supabaseUser) {
        const supabase = createClient();

        // Load completed steps from Supabase
        const { data: progressRows } = await supabase
          .from("progress")
          .select("step_id, points_awarded")
          .eq("user_id", supabaseUser.id);

        // Load active validation context
        const { data: contextRows } = await supabase
          .from("validation_contexts")
          .select("context")
          .eq("user_id", supabaseUser.id)
          .eq("is_active", true)
          .limit(1);

        const completedSteps: Record<string, boolean> = {};
        let points = 0;
        if (progressRows) {
          for (const row of progressRows) {
            completedSteps[row.step_id] = true;
            points += row.points_awarded;
          }
        }

        const validationContext =
          contextRows?.[0]?.context as ValidationContext ?? {};

        dispatch({
          type: "LOAD",
          state: { completedSteps, points, validationContext },
        });

        // Check if there's local progress to import
        const local = localStorage.getItem("liftoff_progress");
        if (local) {
          try {
            const parsed = JSON.parse(local) as ProgressState;
            const localStepCount = Object.keys(
              parsed.completedSteps ?? {}
            ).length;
            const supabaseStepCount = Object.keys(completedSteps).length;
            if (localStepCount > 0 && supabaseStepCount === 0) {
              setHasLocalProgress(true);
            }
          } catch {
            // ignore
          }
        }
      } else {
        // Fallback: load from localStorage
        const stored = localStorage.getItem("liftoff_progress");
        if (stored) {
          try {
            dispatch({ type: "LOAD", state: JSON.parse(stored) });
          } catch {
            // ignore corrupt data
          }
        }
      }
      setIsHydrated(true);
    }

    loadProgress();
  }, [isRegistered, supabaseUser]);

  const completeStep = useCallback(
    (stepId: string, points: number, context?: ValidationContext) => {
      dispatch({ type: "COMPLETE_STEP", stepId, points, context });

      if (!isRegistered) {
        // Save to localStorage for unregistered users
        // We need the new state, so we compute it inline
        const stored = localStorage.getItem("liftoff_progress");
        let current: ProgressState = initialState;
        if (stored) {
          try {
            current = JSON.parse(stored);
          } catch {
            // ignore
          }
        }
        if (!current.completedSteps[stepId]) {
          const newState = {
            ...current,
            completedSteps: { ...current.completedSteps, [stepId]: true },
            points: current.points + points,
            validationContext: { ...current.validationContext, ...context },
          };
          saveToLocalStorage(newState);
        }
      }
      // Server-side persistence for registered users happens in the validate API route
    },
    [isRegistered]
  );

  const isStepCompleted = useCallback(
    (stepId: string) => {
      return !!state.completedSteps[stepId];
    },
    [state.completedSteps]
  );

  const resetProgress = useCallback(async () => {
    dispatch({ type: "RESET" });
    localStorage.removeItem("liftoff_celebrated");

    if (isRegistered && supabaseUser) {
      const supabase = createClient();
      await supabase.from("progress").delete().eq("user_id", supabaseUser.id);
      await supabase
        .from("validation_contexts")
        .delete()
        .eq("user_id", supabaseUser.id);
    } else {
      localStorage.removeItem("liftoff_progress");
    }
  }, [isRegistered, supabaseUser]);

  const resetModule = useCallback(
    async (stepIds: string[], pointsPerStep: number) => {
      const pointsToRemove =
        stepIds.filter((id) => state.completedSteps[id]).length * pointsPerStep;
      dispatch({ type: "RESET_MODULE", stepIds, pointsToRemove });

      if (isRegistered && supabaseUser) {
        const supabase = createClient();
        await supabase
          .from("progress")
          .delete()
          .eq("user_id", supabaseUser.id)
          .in("step_id", stepIds);
      } else {
        // Recompute and save localStorage
        const newCompleted = { ...state.completedSteps };
        for (const id of stepIds) {
          delete newCompleted[id];
        }
        saveToLocalStorage({
          ...state,
          completedSteps: newCompleted,
          points: Math.max(0, state.points - pointsToRemove),
        });
      }
    },
    [isRegistered, supabaseUser, state]
  );

  const importLocalProgress = useCallback(async () => {
    if (!isRegistered || !supabaseUser) return;

    const stored = localStorage.getItem("liftoff_progress");
    if (!stored) return;

    try {
      const local = JSON.parse(stored) as ProgressState;
      const stepIds = Object.keys(local.completedSteps ?? {}).filter(
        (id) => local.completedSteps[id]
      );

      if (stepIds.length === 0) return;

      const supabase = createClient();
      const rows = stepIds.map((stepId) => ({
        user_id: supabaseUser.id,
        step_id: stepId,
        points_awarded: 10,
      }));

      await supabase.from("progress").upsert(rows, {
        onConflict: "user_id,step_id",
      });

      // Import validation context if present
      const localContext = local.validationContext ?? {};
      if (Object.keys(localContext).length > 0 && localContext.userId) {
        await supabase.from("validation_contexts").upsert(
          {
            user_id: supabaseUser.id,
            postman_user_id: localContext.userId,
            context: localContext as unknown as import("@/types/supabase").Json,
            is_active: true,
          },
          { onConflict: "user_id,postman_user_id" }
        );
      }

      localStorage.removeItem("liftoff_progress");
      setHasLocalProgress(false);

      // Reload from Supabase
      const { data: progressRows } = await supabase
        .from("progress")
        .select("step_id, points_awarded")
        .eq("user_id", supabaseUser.id);

      const { data: ctxRows } = await supabase
        .from("validation_contexts")
        .select("context")
        .eq("user_id", supabaseUser.id)
        .eq("is_active", true)
        .limit(1);

      const completedSteps: Record<string, boolean> = {};
      let points = 0;
      if (progressRows) {
        for (const row of progressRows) {
          completedSteps[row.step_id] = true;
          points += row.points_awarded;
        }
      }

      const importedContext = ctxRows?.[0]?.context as ValidationContext ?? {};

      dispatch({
        type: "LOAD",
        state: { completedSteps, points, validationContext: importedContext },
      });
    } catch {
      // ignore
    }
  }, [isRegistered, supabaseUser, state.validationContext]);

  const value = useMemo(
    () => ({
      ...state,
      isHydrated,
      hasLocalProgress,
      completeStep,
      isStepCompleted,
      resetProgress,
      resetModule,
      importLocalProgress,
    }),
    [
      state,
      isHydrated,
      hasLocalProgress,
      completeStep,
      isStepCompleted,
      resetProgress,
      resetModule,
      importLocalProgress,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx)
    throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
