import { useEffect, useRef } from "react";

export function useVisibleAutoRefresh(
  refresh: () => void | Promise<void>,
  enabled: boolean,
  intervalMs = 10_000,
) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let requestInFlight = false;

    const runRefresh = async () => {
      if (!active || requestInFlight || document.visibilityState !== "visible") return;
      requestInFlight = true;
      try {
        await refreshRef.current();
      } catch {
        // Background refresh failures leave the last known data visible.
      } finally {
        requestInFlight = false;
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void runRefresh();
    };

    const intervalId = window.setInterval(() => void runRefresh(), intervalMs);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [enabled, intervalMs]);
}
