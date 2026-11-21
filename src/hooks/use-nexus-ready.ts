import { useEffect, useState } from "react";
import { useNexus } from "@/stores/nexus-store";
import type { QualitySetting } from "@/types/nexus";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const apply = () => setHidden(document.hidden);
    apply();
    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, []);
  return hidden;
}

export function useQualityTier(): "high" | "low" {
  const setting = useNexus((state) => state.quality);
  const [narrow, setNarrow] = useState(false);
  const [cores, setCores] = useState(8);
  useEffect(() => {
    setCores(navigator.hardwareConcurrency || 8);
    const query = window.matchMedia("(max-width: 720px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  if (setting === "high") return "high";
  if (setting === "low") return "low";
  return narrow || cores <= 4 ? "low" : "high";
}

export function cycleQuality(current: QualitySetting): QualitySetting {
  if (current === "auto") return "high";
  if (current === "high") return "low";
  return "auto";
}

export function useFullscreen() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const toggle = () => {
    if (!document.fullscreenEnabled && !document.fullscreenElement) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };
  return { active, toggle };
}
