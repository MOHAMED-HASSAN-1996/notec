"use client";

import { useSyncExternalStore } from "react";
import type { CommunityLinks } from "./types";

export type StoredCommunity = {
  id: string;
  name: string;
  description: string;
  logo: string;
  links: CommunityLinks;
  createdAt: number;
};

const KEY = "notec_communities_v1";
const EVT = "notec-communities-updated";

let cache: StoredCommunity[] | null = null;

function read(): StoredCommunity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return cache ?? [];
    const parsed = JSON.parse(raw) as StoredCommunity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return cache ?? [];
  }
}

function getSnapshot(): StoredCommunity[] {
  cache = read();
  return cache;
}

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVT, cb);
  };
}

/**
 * Reactive access to stored communities. Returns `null` on the server / before
 * hydration, the live array afterwards — subscribe updates on save/across tabs.
 */
export function useStoredCommunities(): StoredCommunity[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[.\s/]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-");
}

export function loadCommunities(): StoredCommunity[] {
  return read();
}

export function saveCommunities(list: StoredCommunity[]): void {
  cache = list;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* ignore quota / private-mode errors */
  }
}