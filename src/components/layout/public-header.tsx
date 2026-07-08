"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-medical">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            ENAMEL <span className="text-primary">ROADS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72" title="Site navigation">
            <nav className="mt-8 flex flex-col gap-4">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="text-lg font-medium">
                  {item.label}
                </Link>
              ))}
              <Link href="/login" className="text-lg font-medium">Log in</Link>
              <Link href="/signup" className="text-lg font-medium text-primary">Get Started</Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
