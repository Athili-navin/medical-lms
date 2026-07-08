"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthStore, useUIStore } from "@/stores";

export function TutorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/tutor/login");
    } else if (user?.role !== "tutor") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || !isAuthenticated || user?.role !== "tutor") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar variant="tutor" />
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0" title="Tutor navigation">
          <Sidebar variant="tutor" onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
