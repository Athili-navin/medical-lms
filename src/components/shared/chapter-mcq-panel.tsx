"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, CircleHelp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProtectedContent } from "@/components/shared/protected-content";
import { FullscreenPanel } from "@/components/shared/fullscreen-panel";
import { apiClient } from "@/lib/api/client";
import type { MCQQuestion } from "@/types";
import { cn } from "@/lib/utils";

interface ChapterMcqPanelProps {
  chapterId: string;
}

export function ChapterMcqPanel({ chapterId }: ChapterMcqPanelProps) {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    setAnswers({});
    apiClient
      .getMcq(chapterId)
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [chapterId]);

  const answeredCount = Object.keys(answers).length;
  const score = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleRetake = () => setAnswers({});

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No quiz questions for this chapter yet. Your tutor can add them from the tutor portal.
      </p>
    );
  }

  return (
    <FullscreenPanel title="Chapter MCQ Quiz" contentClassName="pb-6">
      <ProtectedContent className="flex h-full flex-col">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Tap an option to see the correct answer instantly.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {answeredCount}/{questions.length} answered
              </Badge>
              {answeredCount > 0 && (
                <Badge variant={score === questions.length && allAnswered ? "default" : "outline"}>
                  Score: {score}/{questions.length}
                </Badge>
              )}
            </div>
          </div>
          {answeredCount > 0 && (
            <Button size="sm" variant="outline" onClick={handleRetake}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Retake Quiz
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px] pr-4">
          <div className="space-y-4">
            {questions.map((question, index) => {
              const selected = answers[question.id];
              const revealed = selected !== undefined;
              const isCorrect = revealed && selected === question.correctIndex;
              const isWrong = revealed && selected !== question.correctIndex;

              return (
                <Card
                  key={question.id}
                  className={cn(
                    "transition-colors",
                    revealed && isCorrect && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
                    revealed && isWrong && "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
                  )}
                >
                  <CardContent className="pt-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {index + 1}
                        </span>
                        <p className="font-medium leading-relaxed">{question.question}</p>
                      </div>
                      {revealed && (
                        <span className="shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" aria-label="Correct" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" aria-label="Incorrect" />
                          )}
                        </span>
                      )}
                    </div>

                    <div className="ml-10 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = selected === optionIndex;
                        const isCorrectOption = optionIndex === question.correctIndex;
                        const showAsCorrect = revealed && isCorrectOption;
                        const showAsWrong = revealed && isSelected && !isCorrectOption;

                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() => handleSelect(question.id, optionIndex)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                              !revealed && isSelected && "border-primary bg-primary/5",
                              !revealed && !isSelected && "hover:border-primary/40 hover:bg-muted/50",
                              showAsCorrect && "border-green-500 bg-green-100/60 dark:bg-green-950/40",
                              showAsWrong && "border-red-500 bg-red-100/60 dark:bg-red-950/40",
                              revealed && !showAsCorrect && !showAsWrong && "opacity-70"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                                isSelected && !revealed && "border-primary bg-primary text-primary-foreground",
                                showAsCorrect && "border-green-600 bg-green-600 text-white",
                                showAsWrong && "border-red-600 bg-red-600 text-white"
                              )}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showAsCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
                            {showAsWrong && <XCircle className="h-4 w-4 shrink-0 text-red-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {revealed && (
                      <div
                        className={cn(
                          "ml-10 mt-4 flex gap-2 rounded-lg border px-3 py-2 text-sm",
                          isCorrect
                            ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-100"
                            : "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100"
                        )}
                      >
                        <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </ProtectedContent>
    </FullscreenPanel>
  );
}
