"use client";
import { useState } from "react";
import { FeatureRequestModal } from "@/components/feature-request-modal";

export function FeatureRequestButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
        onClick={() => setOpen(true)}
        aria-label="Request a Feature or Give Feedback"
      >
        Feedback / Feature Request
      </button>
      <FeatureRequestModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
