import type { McqQuestionType } from "@/types";
import { DEFAULT_MCQ_STEM, EMPTY_STATEMENTS, defaultStatementOptions } from "@/lib/mock-data/mcq";

export const MCQ_TYPE_LABELS: Record<McqQuestionType, string> = {
  normal: "Normal MCQ",
  statement: "Statement-wise MCQ",
  image: "Image MCQ",
};

export const EMPTY_OPTIONS = ["", "", "", ""];
export const EMPTY_OPTION_IMAGES = ["", "", "", ""];

export interface McqFormState {
  question_type: McqQuestionType;
  question: string;
  statements: string[];
  image_path: string;
  options: string[];
  option_images: string[];
  correct_index: number;
  explanation: string;
}

function padOptionImages(options: string[], images?: string[]): string[] {
  const padded = [...(images ?? []), ...EMPTY_OPTION_IMAGES].slice(0, options.length);
  while (padded.length < options.length) padded.push("");
  return padded;
}

export function optionHasContent(text: string, imagePath?: string): boolean {
  return Boolean(text.trim() || imagePath?.trim());
}

export function createMcqForm(type: McqQuestionType = "normal"): McqFormState {
  const options = type === "statement" ? defaultStatementOptions(3) : [...EMPTY_OPTIONS];

  if (type === "statement") {
    return {
      question_type: "statement",
      question: DEFAULT_MCQ_STEM,
      statements: [...EMPTY_STATEMENTS],
      image_path: "",
      options,
      option_images: [...EMPTY_OPTION_IMAGES],
      correct_index: 0,
      explanation: "",
    };
  }

  return {
    question_type: type,
    question: "",
    statements: [],
    image_path: "",
    options,
    option_images: [...EMPTY_OPTION_IMAGES],
    correct_index: 0,
    explanation: "",
  };
}

export function mcqFormFromQuestion(mcq: {
  questionType?: McqQuestionType;
  question: string;
  statements?: string[];
  imagePath?: string;
  options: string[];
  optionImages?: string[];
  correctIndex: number;
  explanation: string;
}): McqFormState {
  const type =
    mcq.questionType ??
    (mcq.imagePath ? "image" : mcq.statements?.length ? "statement" : "normal");

  const statements =
    type === "statement" && mcq.statements?.length
      ? [...mcq.statements, "", ""].slice(0, Math.max(3, mcq.statements.length))
      : [...EMPTY_STATEMENTS];

  const options = [...mcq.options, "", "", ""].slice(0, Math.max(4, mcq.options.length));
  const option_images = padOptionImages(options, mcq.optionImages);

  return {
    question_type: type,
    question: mcq.question,
    statements: type === "statement" ? statements : [],
    image_path: mcq.imagePath ?? "",
    options,
    option_images,
    correct_index: mcq.correctIndex,
    explanation: mcq.explanation,
  };
}

export function validateMcqForm(form: McqFormState): string | null {
  if (!form.question.trim()) return "Question text is required.";

  const filledCount = form.options.filter((o, i) =>
    optionHasContent(o, form.option_images[i])
  ).length;
  if (filledCount < 2) return "Add at least 2 options (text and/or image).";

  if (form.question_type === "statement") {
    const statements = form.statements.map((s) => s.trim()).filter(Boolean);
    if (statements.length < 2) return "Add at least 2 statements.";
  }

  if (
    form.question_type === "image" &&
    !form.image_path.trim() &&
    !form.option_images.some((p) => p.trim())
  ) {
    return "Add a question image or at least one option image.";
  }

  const correct = form.options[form.correct_index];
  const correctImage = form.option_images[form.correct_index];
  if (!optionHasContent(correct ?? "", correctImage)) {
    return "The correct answer option must have text or an image.";
  }

  return null;
}

export function mcqFormToPayload(form: McqFormState) {
  const statements =
    form.question_type === "statement" ? form.statements.map((s) => s.trim()).filter(Boolean) : [];

  return {
    question_type: form.question_type,
    question: form.question.trim(),
    statements,
    image_path: form.image_path.trim(),
    options: form.options.map((o) => o.trim()),
    option_images: form.option_images.map((p) => p.trim()),
    correct_index: form.correct_index,
    explanation: form.explanation.trim(),
  };
}
