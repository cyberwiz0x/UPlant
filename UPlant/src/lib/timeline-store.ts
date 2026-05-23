import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { PlantAnalysis } from './mock-analysis';

const STORAGE_KEY = 'uplant.careTimelines.v1';

export type TimelineTask = {
  id: string;
  title: string;
  dueLabel: string;
  detail: string;
};

export type TimelineScan = {
  id: string;
  photoUri: string;
  scannedAt: string;
  plantName: string;
  healthStatus: string;
  condition: string;
  confidence: number;
};

export type CareTimeline = {
  id: string;
  nickname: string;
  species: string;
  createdAt: string;
  latestCondition: string;
  tasks: TimelineTask[];
  scans: TimelineScan[];
};

let timelines: CareTimeline[] = [];
let hasLoaded = false;
const listeners = new Set<() => void>();

export async function loadTimelines() {
  if (hasLoaded) {
    return;
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  timelines = raw ? JSON.parse(raw) : [];
  hasLoaded = true;
  emit();
}

export function useCareTimelines() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function createCareTimeline(nickname: string, analysis: PlantAnalysis, photoUri: string) {
  await loadTimelines();

  const now = new Date().toISOString();
  const scan = createScan(analysis, photoUri, now);
  const timeline: CareTimeline = {
    id: `timeline_${Date.now()}`,
    nickname: nickname.trim() || analysis.plant.commonName,
    species: analysis.plant.scientificName,
    createdAt: now,
    latestCondition: analysis.health.condition,
    tasks: createTasks(analysis),
    scans: [scan],
  };

  timelines = [timeline, ...timelines];
  await persist();
  return timeline;
}

export async function addScanToTimeline(timelineId: string, analysis: PlantAnalysis, photoUri: string) {
  await loadTimelines();
  const targetTimeline = timelines.find((timeline) => timeline.id === timelineId);
  if (!targetTimeline) {
    return null;
  }

  const now = new Date().toISOString();
  const scan = createScan(analysis, photoUri, now);
  const updatedTimeline = {
    ...targetTimeline,
    latestCondition: analysis.health.condition,
    tasks: createTasks(analysis),
    scans: [scan, ...targetTimeline.scans],
  };
  timelines = [updatedTimeline, ...timelines.filter((timeline) => timeline.id !== timelineId)];
  await persist();
  return updatedTimeline;
}

export async function renameCareTimeline(timelineId: string, nickname: string) {
  await loadTimelines();
  const trimmedNickname = nickname.trim();
  if (!trimmedNickname) {
    return null;
  }

  const targetTimeline = timelines.find((timeline) => timeline.id === timelineId);
  if (!targetTimeline) {
    return null;
  }

  const updatedTimeline: CareTimeline = { ...targetTimeline, nickname: trimmedNickname };
  timelines = timelines.map((timeline) => {
    if (timeline.id !== timelineId) {
      return timeline;
    }
    return updatedTimeline;
  });
  await persist();
  return updatedTimeline;
}

export async function deleteCareTimeline(timelineId: string) {
  await loadTimelines();
  timelines = timelines.filter((timeline) => timeline.id !== timelineId);
  await persist();
}

function createScan(analysis: PlantAnalysis, photoUri: string, scannedAt: string): TimelineScan {
  return {
    id: `scan_${Date.now()}`,
    photoUri,
    scannedAt,
    plantName: analysis.plant.commonName,
    healthStatus: analysis.health.status,
    condition: analysis.health.condition,
    confidence: analysis.health.confidence,
  };
}

function createTasks(analysis: PlantAnalysis): TimelineTask[] {
  const condition = analysis.health.condition;
  if (analysis.health.status === 'healthy') {
    return [
      {
        id: 'rotate',
        title: 'Rotate plant',
        dueLabel: 'This week',
        detail: 'Turn the pot so new growth gets even light.',
      },
      {
        id: 'soil',
        title: 'Check soil before watering',
        dueLabel: 'Next watering',
        detail: 'Water only when the top soil feels dry.',
      },
      {
        id: 'rescan',
        title: 'Progress photo',
        dueLabel: 'In 7 days',
        detail: 'Take another scan to keep a healthy baseline.',
      },
    ];
  }

  if (condition === 'yellowing leaves') {
    return [
      {
        id: 'moisture',
        title: 'Check soil moisture',
        dueLabel: 'Today',
        detail: 'If soil is wet, pause watering and check drainage.',
      },
      {
        id: 'light',
        title: 'Adjust light',
        dueLabel: 'Today',
        detail: 'Move to bright indirect light and avoid harsh direct sun.',
      },
      {
        id: 'rescan',
        title: 'Compare yellowing',
        dueLabel: 'In 5-7 days',
        detail: 'Scan the same plant again to see if yellowing is spreading.',
      },
    ];
  }

  return [
    {
      id: 'inspect',
      title: 'Inspect leaves',
      dueLabel: 'Today',
      detail: 'Check leaf undersides for pests, spots, or new browning.',
    },
    {
      id: 'stabilize',
      title: 'Stabilize care',
      dueLabel: 'Next 3 days',
      detail: 'Keep watering and light consistent while watching new growth.',
    },
    {
      id: 'rescan',
      title: 'Progress photo',
      dueLabel: 'In 7 days',
      detail: 'Take another scan to compare health over time.',
    },
  ];
}

async function persist() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timelines));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  loadTimelines();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return timelines;
}

function emit() {
  listeners.forEach((listener) => listener());
}
