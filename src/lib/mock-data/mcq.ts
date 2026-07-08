import type { MCQQuestion } from "@/types";

const QUESTION_BANK: Omit<MCQQuestion, "id" | "chapterId">[] = [
  {
    question: "What best describes evidence-based medicine?",
    options: [
      "Care based solely on tradition and senior opinion",
      "Integrating research evidence, clinical expertise, and patient values",
      "Using only the newest experimental treatments",
      "Relying exclusively on textbook definitions",
    ],
    correctIndex: 1,
    explanation: "Evidence-based medicine combines the best research, clinician judgment, and patient preferences.",
  },
  {
    question: "Which approach reflects clinical best practices?",
    options: [
      "Skipping protocols to save time",
      "Following standardized, proven care guidelines",
      "Avoiding documentation of patient decisions",
      "Treating every patient with the same drug dose",
    ],
    correctIndex: 1,
    explanation: "Best practices use validated protocols to deliver consistent, safe patient care.",
  },
  {
    question: "Why is clinical relevance important in medical education?",
    options: [
      "It reduces the need for exams",
      "It connects theory to real patient scenarios",
      "It replaces the need for anatomy study",
      "It focuses only on research publications",
    ],
    correctIndex: 1,
    explanation: "Clinical relevance helps students apply knowledge during diagnosis and treatment.",
  },
  {
    question: "What is the primary goal of patient care?",
    options: [
      "Maximizing hospital revenue",
      "Preventing, treating, and supporting patient well-being",
      "Limiting follow-up appointments",
      "Standardizing all patients to one treatment plan",
    ],
    correctIndex: 1,
    explanation: "Patient care focuses on improving health outcomes and quality of life.",
  },
  {
    question: "Which skill is essential for sound medical decision-making?",
    options: [
      "Memorization without analysis",
      "Critical thinking and objective evaluation",
      "Avoiding second opinions",
      "Ignoring conflicting lab results",
    ],
    correctIndex: 1,
    explanation: "Critical thinking allows clinicians to interpret data and choose appropriate actions.",
  },
  {
    question: "What role do clinical guidelines play?",
    options: [
      "They remove the need for professional judgment",
      "They provide evidence-based recommendations for care",
      "They apply only to emergency departments",
      "They are optional suggestions with no research support",
    ],
    correctIndex: 1,
    explanation: "Guidelines summarize evidence to support consistent, high-quality clinical decisions.",
  },
  {
    question: "Which statement about medical professionals is most accurate?",
    options: [
      "They need clinical training but not ongoing education",
      "They provide licensed care and continue learning throughout their careers",
      "They work independently without ethical standards",
      "They focus only on administrative tasks",
    ],
    correctIndex: 1,
    explanation: "Licensed professionals deliver care and maintain competence through lifelong learning.",
  },
  {
    question: "What do assessment criteria typically evaluate?",
    options: [
      "Only attendance records",
      "Required knowledge and clinical competencies",
      "Social media activity",
      "Hospital cafeteria preferences",
    ],
    correctIndex: 1,
    explanation: "Exams and evaluations measure mastery of essential knowledge and skills.",
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
