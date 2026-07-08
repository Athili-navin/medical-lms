"use client";

import { motion } from "framer-motion";
import { GlossaryVisualEditor } from "@/components/shared/glossary-visual-editor";

export default function TutorGlossaryPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">Keyword Tooltips</h1>
        <p className="text-muted-foreground">
          Load your chapter notes, highlight a word, and add hover text plus an optional image.
        </p>
      </motion.div>
      <GlossaryVisualEditor />
    </div>
  );
}
