"use client";

import { usePathname } from "next/navigation";
import { TutorLayout } from "@/components/layout/tutor-layout";

export default function TutorRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/tutor/login") return <>{children}</>;
  return <TutorLayout>{children}</TutorLayout>;
}
