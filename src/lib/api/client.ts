import type { Course, MCQQuestion, Announcement, User, UserRole, GlossaryEntry, ChapterPdf } from "@/types";

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const apiClient = {
  getMe: () => api<{ user: User | null }>("/api/auth/me"),
  getCourses: () => api<Course[]>("/api/courses"),
  createCourse: (data: Record<string, unknown>) =>
    api("/api/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (data: Record<string, unknown>) =>
    api("/api/courses", { method: "PATCH", body: JSON.stringify(data) }),
  deleteCourse: (id: string) => api(`/api/courses?id=${id}`, { method: "DELETE" }),
  getLessons: (courseId?: string) =>
    api(`/api/lessons${courseId ? `?courseId=${courseId}` : ""}`),
  createLesson: (data: Record<string, unknown>) =>
    api("/api/lessons", { method: "POST", body: JSON.stringify(data) }),
  updateLesson: (data: Record<string, unknown>) =>
    api("/api/lessons", { method: "PATCH", body: JSON.stringify(data) }),
  deleteLesson: (id: string) => api(`/api/lessons?id=${id}`, { method: "DELETE" }),
  getChapters: (lessonId?: string) =>
    api(`/api/chapters${lessonId ? `?lessonId=${lessonId}` : ""}`),
  createChapter: (data: Record<string, unknown>) =>
    api("/api/chapters", { method: "POST", body: JSON.stringify(data) }),
  updateChapter: (data: Record<string, unknown>) =>
    api("/api/chapters", { method: "PATCH", body: JSON.stringify(data) }),
  deleteChapter: (id: string) => api(`/api/chapters?id=${id}`, { method: "DELETE" }),
  getVideos: (chapterId?: string) =>
    api(`/api/videos${chapterId ? `?chapterId=${chapterId}` : ""}`),
  getVideoPlayUrl: (videoId: string) =>
    api<import("@/types").Video & { streamUrl: string }>(`/api/videos/play?id=${videoId}`),
  createVideo: (data: Record<string, unknown>) =>
    api("/api/videos", { method: "POST", body: JSON.stringify(data) }),
  updateVideo: (data: Record<string, unknown>) =>
    api("/api/videos", { method: "PATCH", body: JSON.stringify(data) }),
  deleteVideo: (id: string) => api(`/api/videos?id=${id}`, { method: "DELETE" }),
  getPdf: (chapterId: string) => api<ChapterPdf | null>(`/api/pdfs?chapterId=${chapterId}`),
  createPdf: (data: Record<string, unknown>) =>
    api("/api/pdfs", { method: "POST", body: JSON.stringify(data) }),
  deletePdf: (id: string) => api(`/api/pdfs?id=${id}`, { method: "DELETE" }),
  getMcq: (chapterId: string) => api<MCQQuestion[]>(`/api/mcq?chapterId=${chapterId}`),
  createMcq: (data: Record<string, unknown>) =>
    api("/api/mcq", { method: "POST", body: JSON.stringify(data) }),
  updateMcq: (data: Record<string, unknown>) =>
    api("/api/mcq", { method: "PATCH", body: JSON.stringify(data) }),
  deleteMcq: (id: string) => api(`/api/mcq?id=${id}`, { method: "DELETE" }),
  getGlossary: (chapterId?: string, courseId?: string, signedImages = false) => {
    const params = new URLSearchParams();
    if (chapterId) params.set("chapterId", chapterId);
    if (courseId) params.set("courseId", courseId);
    if (signedImages) params.set("signedImages", "1");
    return api<GlossaryEntry[]>(`/api/glossary?${params}`);
  },
  createGlossary: (data: Record<string, unknown>) =>
    api("/api/glossary", { method: "POST", body: JSON.stringify(data) }),
  updateGlossary: (data: Record<string, unknown>) =>
    api("/api/glossary", { method: "PATCH", body: JSON.stringify(data) }),
  deleteGlossary: (id: string) => api(`/api/glossary?id=${id}`, { method: "DELETE" }),
  getAnnouncements: () => api<Announcement[]>("/api/announcements"),
  createAnnouncement: (data: Record<string, unknown>) =>
    api("/api/announcements", { method: "POST", body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) => api(`/api/announcements?id=${id}`, { method: "DELETE" }),
  saveNote: (chapterId: string, content: string) =>
    api("/api/notes", { method: "PUT", body: JSON.stringify({ chapter_id: chapterId, content }) }),
  getNote: (chapterId: string) =>
    api<{ content: string; chapterId: string; updatedAt: string } | null>(
      `/api/notes?chapterId=${chapterId}`
    ),
  getAllNotes: () =>
    api<Array<{ content: string; chapterId: string; updatedAt: string }>>("/api/notes"),
  getProgress: () => api<string[]>("/api/progress"),
  markComplete: (chapterId: string) =>
    api("/api/progress", { method: "POST", body: JSON.stringify({ chapter_id: chapterId }) }),
};

export { type UserRole };
