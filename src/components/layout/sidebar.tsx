"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  StickyNote,
  CreditCard,
  User,
  Settings,
  LogOut,
  GraduationCap,
  X,
  ListChecks,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNavItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "Notes", href: "/dashboard/notes", icon: StickyNote },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const tutorNavItems: SidebarItem[] = [
  { label: "Dashboard", href: "/tutor", icon: LayoutDashboard },
  { label: "Courses", href: "/tutor/courses", icon: BookOpen },
  { label: "Lessons", href: "/tutor/lessons", icon: GraduationCap },
  { label: "PDF Notes", href: "/tutor/chapters", icon: FileText },
  { label: "Videos", href: "/tutor/videos", icon: BookOpen },
  { label: "MCQ Questions", href: "/tutor/mcq", icon: ListChecks },
  { label: "Announcements", href: "/tutor/announcements", icon: CreditCard },
];

interface SidebarProps {
  variant?: "student" | "tutor";
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ variant = "student", onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const navItems = variant === "tutor" ? tutorNavItems : studentNavItems;

  const handleLogout = async () => {
    await logout();
    router.push(variant === "tutor" ? "/tutor/login" : "/login");
    onNavigate?.();
  };

  return (
    <aside className={cn("flex h-full w-64 flex-col border-r bg-card", className)}>
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-medical">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg">
          ENAMEL <span className="text-primary">ROADS</span>
        </span>
        {onNavigate && (
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onNavigate}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && item.href !== "/tutor" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-3">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
