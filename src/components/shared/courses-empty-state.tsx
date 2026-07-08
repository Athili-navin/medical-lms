import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CoursesEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="font-semibold">No courses available yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your tutor hasn&apos;t published any courses yet. Check back soon or browse the courses page.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/courses">View courses</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
