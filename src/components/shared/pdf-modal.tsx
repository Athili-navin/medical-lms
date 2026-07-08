"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProtectedPdfViewer } from "@/components/shared/protected-pdf-viewer";

interface PdfModalProps {
  chapterId: string | null;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfModal({ chapterId, title, open, onOpenChange }: PdfModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex h-[92vh] w-[min(1200px,96vw)] max-w-[96vw] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 pb-2 pt-6">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
          {chapterId && open ? (
            <ProtectedPdfViewer chapterId={chapterId} title={title} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function usePdfModal() {
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [title, setTitle] = useState("PDF Notes");
  const [open, setOpen] = useState(false);

  const openPdf = (id: string, pdfTitle = "PDF Notes") => {
    setChapterId(id);
    setTitle(pdfTitle);
    setOpen(true);
  };

  return { open, chapterId, title, openPdf, setOpen };
}
