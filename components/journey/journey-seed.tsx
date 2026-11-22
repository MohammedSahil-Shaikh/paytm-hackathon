"use client";

import { useEffect } from "react";
import { seedDemoJourney } from "@/lib/client/seed";

/** Ensures demo candidate + research exist for local smoke / hackathon demos. */
export function JourneySeed() {
  useEffect(() => {
    seedDemoJourney({ clearInterview: true });
  }, []);

  return null;
}
