import type { User, Course, Video, Announcement, Activity } from "@/types";
import { subscriptionPlansList } from "@/lib/subscription/plans";

export const mockUser: User = {
  id: "user-1",
  name: "Dr. Sarah Mitchell",
  email: "sarah.mitchell@email.com",
  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
  role: "student",
  subscriptionPlan: "none",
  joinedAt: "2025-09-15",
};

export const mockTutor: User = {
  id: "tutor-1",
  name: "Prof. James Chen",
  email: "james.chen@enamelroads.edu",
  avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
  role: "tutor",
  subscriptionPlan: "yearly",
  joinedAt: "2024-01-10",
};

export const mockCourses: Course[] = [];
export const mockVideos: Video[] = [];

export const mockAnnouncements: Announcement[] = [];

export const mockActivities: Activity[] = [];

export { subscriptionPlansList as mockSubscriptionPlans };

export const mockTutorAnalytics: import("@/types").TutorAnalytics = {
  totalStudents: 0,
  activeCourses: 0,
  totalLessons: 0,
  completionRate: 0,
  monthlyRevenue: 0,
  studentGrowth: 0,
  popularCourses: [],
  recentEnrollments: [],
};

export function getCourseById(id: string): Course | undefined {
  return mockCourses.find((c) => c.id === id);
}

export function getLessonById(courseId: string, lessonId: string) {
  const course = getCourseById(courseId);
  return course?.lessons.find((l) => l.id === lessonId);
}

export function getChapterById(courseId: string, lessonId: string, chapterId: string) {
  const lesson = getLessonById(courseId, lessonId);
  return lesson?.chapters.find((c) => c.id === chapterId);
}

export function getVideoByChapterId(chapterId: string): Video | undefined {
  return mockVideos.find((v) => v.chapterId === chapterId);
}
