"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useBook } from "@/lib/contexts/book-context";
import { apiFetch } from "@/lib/api";

interface TimelineOption {
  id: string;
  title: string;
  order: number;
  era?: string | null;
  inWorldDate?: string | null;
  plotEvent?: { title: string; storyArc?: { title: string } };
}

interface TimelineContextType {
  timelines: TimelineOption[];
  activeTimeline: TimelineOption | null;
  setActiveTimeline: (timeline: TimelineOption | null) => void;
  loading: boolean;
  refreshTimelines: () => Promise<void>;
}

const TimelineContext = createContext<TimelineContextType>({
  timelines: [],
  activeTimeline: null,
  setActiveTimeline: () => {},
  loading: false,
  refreshTimelines: async () => {},
});

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const { activeBook } = useBook();
  const [timelines, setTimelines] = useState<TimelineOption[]>([]);
  const [activeTimeline, setActiveTimeline] = useState<TimelineOption | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshTimelines = useCallback(async () => {
    if (!activeBook) {
      setTimelines([]);
      setActiveTimeline(null);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/timeline");
      if (res.ok) {
        const data = await res.json();
        setTimelines(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [activeBook]);

  useEffect(() => {
    refreshTimelines();
    // Clear active timeline when switching books
    setActiveTimeline(null);
  }, [activeBook?.id, refreshTimelines]);

  return (
    <TimelineContext.Provider
      value={{ timelines, activeTimeline, setActiveTimeline, loading, refreshTimelines }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  return useContext(TimelineContext);
}
