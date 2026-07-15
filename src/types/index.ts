export type UserRole = "student" | "tutor";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  subscriptionPlan: "yearly" | "monthly" | "none";
  subscriptionExpiry?: string;
  /** Testing/demo accounts — bypass subscription paywall */
  subscriptionExempt?: boolean;
  joinedAt: string;
}

export interface Chapter {
  id: string;
  lessonId: string;
  title: string;
  order: number;
  content: string;
  videoId?: string;
  pdfId?: string;
  duration: number;
  isCompleted?: boolean;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  chapters: Chapter[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: "dental" | "general";
  instructor: string;
  totalLessons: number;
  totalChapters: number;
  progress: number;
  lessons: Lesson[];
}

export interface Video {
  id: string;
  title: string;
  chapterId: string;
  duration: number;
  thumbnail: string;
  url: string;
}

export interface Announcement {
  id: string;
  message: string;
  type: "live" | "update" | "exam" | "general";
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "lesson" | "chapter" | "note" | "subscription";
  title: string;
  description: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: "INR";
  interval: "yearly";
  features: string[];
  popular?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PersonalNote {
  chapterId: string;
  content: string;
  updatedAt: string;
  isSaving?: boolean;
  lastSaved?: string;
}

export type McqQuestionType = "normal" | "statement" | "image";

export interface MCQQuestion {
  id: string;
  chapterId: string;
  questionType: McqQuestionType;
  question: string;
  /** Numbered statements for statement-wise MCQs (e.g. 1, 2, 3). */
  statements: string[];
  /** Storage path for image MCQs (glossary-images bucket). */
  imagePath?: string;
  options: string[];
  /** Storage paths for option images (same index as options). */
  optionImages: string[];
  correctIndex: number;
  explanation: string;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  image_url?: string | null;
  image_preview_url?: string | null;
  chapter_id?: string | null;
  course_id?: string | null;
}

export interface GlossaryTooltip {
  definition: string;
  imageUrl?: string;
}

export interface ChapterPdf {
  id: string;
  chapterId: string;
  title: string;
  url: string;
  fileName: string;
}

export interface TutorAnalytics {
  totalStudents: number;
  activeCourses: number;
  totalLessons: number;
  completionRate: number;
  monthlyRevenue: number;
  studentGrowth: number;
  popularCourses: { name: string; enrollments: number }[];
  recentEnrollments: { student: string; course: string; date: string }[];
}
