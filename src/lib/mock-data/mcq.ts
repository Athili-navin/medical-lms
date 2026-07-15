import type { MCQQuestion } from "@/types";

const QUESTION_BANK: Omit<MCQQuestion, "id" | "chapterId">[] = [
  {
    questionType: "statement",
    question: "Which of the following statement(s) is/are correct regarding evidence-based dentistry?",
    statements: [
      "It relies only on textbook definitions without clinical judgment.",
      "It integrates research evidence, clinical expertise, and patient preferences.",
      "It excludes patient values from treatment planning.",
    ],
    options: ["(1) only", "(2) only", "(1) and (2) only", "(2) and (3) only"],
    optionImages: [],
    correctIndex: 1,
    explanation: "Statement 2 is correct. Evidence-based dentistry combines research, clinician judgment, and patient values.",
  },
  {
    questionType: "statement",
    question: "Which of the following statement(s) is/are correct about implant placement?",
    statements: [
      "Supracrestal placement may reduce crestal bone loss in some cases.",
      "Subcrestal placement always eliminates all bone remodeling.",
      "Platform switching can influence peri-implant bone levels.",
    ],
    options: ["(1) only", "(2) only", "(1) and (3) only", "All of the above"],
    optionImages: [],
    correctIndex: 2,
    explanation: "Statements 1 and 3 are correct. Statement 2 is incorrect because bone remodeling cannot be completely eliminated.",
  },
  {
    questionType: "statement",
    question: "Which of the following statement(s) is/are correct about enamel?",
    statements: [
      "Enamel is the hardest tissue in the human body.",
      "Enamel contains a high proportion of hydroxyapatite crystals.",
      "Enamel has the same capacity for repair as dentin.",
    ],
    options: ["(1) only", "(1) and (2) only", "(2) and (3) only", "All of the above"],
    optionImages: [],
    correctIndex: 1,
    explanation: "Statements 1 and 2 are correct. Enamel cannot regenerate like dentin, so statement 3 is false.",
  },
  {
    questionType: "statement",
    question: "Which of the following statement(s) is/are correct about periodontal disease?",
    statements: [
      "Plaque biofilm is a primary etiologic factor.",
      "Smoking is a significant risk modifier.",
      "Healthy gingiva always bleeds on probing.",
    ],
    options: ["(1) only", "(2) only", "(1) and (2) only", "All of the above"],
    optionImages: [],
    correctIndex: 2,
    explanation: "Statements 1 and 2 are correct. Bleeding on probing is not normal in healthy gingiva.",
  },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getMcqByChapterId(chapterId: string): MCQQuestion[] {
  const start = hashString(chapterId) % QUESTION_BANK.length;
  const count = 5;

  return Array.from({ length: count }, (_, i) => {
    const template = QUESTION_BANK[(start + i) % QUESTION_BANK.length];
    return {
      ...template,
      id: `${chapterId}-mcq-${i + 1}`,
      chapterId,
    };
  });
}

/** Standard combination options for statement-wise MCQs. */
export function defaultStatementOptions(statementCount: number): string[] {
  if (statementCount >= 3) {
    return ["(1) only", "(2) only", "(1) and (2) only", "(1), (2) and (3) only"];
  }
  return ["(1) only", "(2) only", "(1) and (2) only", "All of the above"];
}

export const DEFAULT_MCQ_STEM = "Which of the following statement(s) is/are correct?";

export const EMPTY_STATEMENTS = ["", "", ""];
