import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersonalNote } from "@/types";

interface NotesState {
  notes: Record<string, PersonalNote>;
  getNote: (chapterId: string) => PersonalNote | undefined;
  saveNote: (chapterId: string, content: string) => void;
  setSaving: (chapterId: string, isSaving: boolean) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      getNote: (chapterId) => get().notes[chapterId],
      saveNote: (chapterId, content) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [chapterId]: {
              chapterId,
              content,
              updatedAt: new Date().toISOString(),
              isSaving: false,
              lastSaved: new Date().toLocaleTimeString(),
            },
          },
        })),
      setSaving: (chapterId, isSaving) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [chapterId]: {
              ...state.notes[chapterId],
              chapterId,
              content: state.notes[chapterId]?.content ?? "",
              updatedAt: state.notes[chapterId]?.updatedAt ?? new Date().toISOString(),
              isSaving,
            },
          },
        })),
    }),
    { name: "enamelroads-notes" }
  )
);
