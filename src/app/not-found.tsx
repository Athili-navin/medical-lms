import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        This page doesn&apos;t exist. If you clicked an email confirmation link, make sure the app is
        running and Supabase redirect URLs include your localhost address.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Student login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tutor/login">Tutor login</Link>
        </Button>
      </div>
    </div>
  );
}
