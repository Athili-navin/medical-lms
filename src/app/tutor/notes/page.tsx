"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TutorNotesPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">PDF Notes</h1>
        <p className="text-muted-foreground">
          Upload PDF chapter notes. Students read in-app with copy protection and watermarks.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Chapter PDF upload</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Open <strong>PDF Notes</strong> to create chapters and upload PDF files. Students cannot copy or download
            notes — pages are watermarked with ENAMEL ROADS.
          </p>
          <Button asChild>
            <Link href="/tutor/chapters">
              Go to PDF Notes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
