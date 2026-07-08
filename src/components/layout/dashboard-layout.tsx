"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { AnnouncementTicker } from "@/components/shared/announcement-ticker";
import { VideoModal } from "@/components/shared/video-modal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthStore, useUIStore } from "@/stores";
import { apiClient } from "@/lib/api/client";
import { hasActiveSubscription } from "@/lib/subscription/access";
import type { Announcement } from "@/types";

const OPEN_WITHOUT_SUBSCRIPTION = ["/dashboard/subscription", "/dashboard/settings"];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    apiClient.getAnnouncements().then(setAnnouncements).catch(() => setAnnouncements([]));
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role === "tutor") {
      router.push("/tutor");
      return;
    }
    if (!hasActiveSubscription(user) && !OPEN_WITHOUT_SUBSCRIPTION.some((p) => pathname.startsWith(p))) {
      router.push("/dashboard/subscription");
    }
  }, [isAuthenticated, user, router, isLoading, pathname]);

  if (isLoading || !isAuthenticated || user?.role === "tutor") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar variant="student" />
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0" title="Student navigation">
          <Sidebar variant="student" onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col overflow-hidden">
        <AnnouncementTicker announcements={announcements} />
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
      <VideoModal />
    </div>
  );
}
