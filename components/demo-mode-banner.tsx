"use client";
import { useDemoMode } from "@/lib/hooks/useDemoMode";

export function DemoModeBanner() {
  const { demo, disableDemo } = useDemoMode();
  if (!demo) return null;
  return (
    <div className="w-full bg-blue-500 text-white text-center py-2 font-semibold z-50">
      Demo Mode: You are viewing fake data. <button className="underline ml-2" onClick={disableDemo}>Exit Demo</button>
    </div>
  );
}
