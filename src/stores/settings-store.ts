import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  courseUpdates: boolean;
  examReminders: boolean;
  setEmailNotifications: (value: boolean) => void;
  setPushNotifications: (value: boolean) => void;
  setCourseUpdates: (value: boolean) => void;
  setExamReminders: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      emailNotifications: true,
      pushNotifications: true,
      courseUpdates: true,
      examReminders: true,
      setEmailNotifications: (value) => set({ emailNotifications: value }),
      setPushNotifications: (value) => set({ pushNotifications: value }),
      setCourseUpdates: (value) => set({ courseUpdates: value }),
      setExamReminders: (value) => set({ examReminders: value }),
    }),
    { name: "enamelroads-settings" }
  )
);

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

interface VideoModalState {
  isOpen: boolean;
  videoId: string | null;
  openVideo: (videoId: string) => void;
  closeVideo: () => void;
}

export const useVideoModalStore = create<VideoModalState>((set) => ({
  isOpen: false,
  videoId: null,
  openVideo: (videoId) => set({ isOpen: true, videoId }),
  closeVideo: () => set({ isOpen: false, videoId: null }),
}));
