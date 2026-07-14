import { useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import toast from "react-hot-toast";

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_DURATION_MS = 60 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
];

export function useIdleTimeout({
  idleTimeout = DEFAULT_IDLE_TIMEOUT_MS,
  warningDuration = WARNING_DURATION_MS,
} = {}) {
  const { signOut, state } = useAuthContext();

  const idleRef = useRef(null);
  const warningRef = useRef(null);
  const signedOutRef = useRef(false);
  const isAuthRef = useRef(state.isAuthenticated);

  useEffect(() => {
    isAuthRef.current = state.isAuthenticated;
  }, [state.isAuthenticated]);

  const clearTimers = useCallback(() => {
    if (idleRef.current) {
      clearTimeout(idleRef.current);
      idleRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    toast.dismiss("idle-warning");
  }, []);

  const startIdleTimer = useCallback(() => {
    if (!isAuthRef.current) return;

    clearTimers();

    idleRef.current = setTimeout(() => {
      if (!isAuthRef.current) return;

      toast.error(
        `Session expiring due to inactivity. Logging out in ${Math.round(warningDuration / 1000)}s...`,
        { id: "idle-warning", duration: warningDuration },
      );

      warningRef.current = setTimeout(async () => {
        if (signedOutRef.current) return;
        signedOutRef.current = true;

        sessionStorage.clear();
        localStorage.clear();
        await signOut();
      }, warningDuration);
    }, idleTimeout);
  }, [idleTimeout, warningDuration, clearTimers, signOut]);

  const handleActivity = useCallback(() => {
    if (!isAuthRef.current) return;

    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
      toast.dismiss("idle-warning");
    }

    startIdleTimer();
  }, [startIdleTimer]);

  useEffect(() => {
    if (!state.isAuthenticated) {
      clearTimers();
      signedOutRef.current = false;
      return;
    }

    startIdleTimer();

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [state.isAuthenticated, handleActivity, startIdleTimer, clearTimers]);
}
