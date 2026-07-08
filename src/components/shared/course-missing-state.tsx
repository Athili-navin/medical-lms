import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CourseMissingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Course not found</h1>
      <p className="max-w-md text-muted-foreground">
        This course may have been removed or the link is outdated. Open a course from your dashboard
        or ask your tutor to publish content.
      </p>
      <Button asChild>
        <Link href="/dashboard/courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to courses
        </Link>
      </Button>
    </div>
  );
}
