import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api/client";

interface ProgressState {
  completedChapters: string[];
  markComplete: (chapterId: string) => void;
  isCompleted: (chapterId: string) => boolean;
  syncProgress: (chapterIds: string[]) => void;
  loadProgress: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedChapters: [],
      markComplete: (chapterId) => {
        if (!get().completedChapters.includes(chapterId)) {
          set((state) => ({
            completedChapters: [...state.completedChapters, chapterId],
          }));
        }
        apiClient.markComplete(chapterId).catch(() => {});
      },
      isCompleted: (chapterId) => get().completedChapters.includes(chapterId),
      syncProgress: (chapterIds) => set({ completedChapters: chapterIds }),
      loadProgress: async () => {
        try {
          const ids = await apiClient.getProgress();
          set({ completedChapters: ids });
        } catch {
          /* keep local persisted progress */
        }
      },
    }),
    { name: "enamelroads-progress" }
  )
);
