"use client";
import { useEffect, useState } from "react";

export function useDemoMode() {
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    // Check for demo mode in localStorage or query param
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("demo") === "1" || localStorage.getItem("demo-mode") === "1") {
        setDemo(true);
      }
    }
  }, []);

  function enableDemo() {
    localStorage.setItem("demo-mode", "1");
    setDemo(true);
  }
  function disableDemo() {
    localStorage.removeItem("demo-mode");
    setDemo(false);
  }

  return { demo, enableDemo, disableDemo };
}
