import { useSyncExternalStore } from 'react';

import { PlantAnalysis } from './mock-analysis';

type LatestScan = {
  analysis: PlantAnalysis;
  photoUri: string;
};

let latestScan: LatestScan | null = null;
const listeners = new Set<() => void>();

export function setLatestScan(scan: LatestScan | null) {
  latestScan = scan;
  listeners.forEach((listener) => listener());
}

export function useLatestScan() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return latestScan;
}
