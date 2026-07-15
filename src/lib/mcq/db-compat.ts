const MCQ_MIGRATION_HINT =
  "Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/wjsbjpnhiankhbxbbpit/sql/new):\n\n" +
  "alter table public.mcq_questions add column if not exists question_type text not null default 'normal';\n" +
  "alter table public.mcq_questions add column if not exists statements jsonb not null default '[]';\n" +
  "alter table public.mcq_questions add column if not exists image_path text default '';\n" +
  "alter table public.mcq_questions add column if not exists option_images jsonb not null default '[]';\n" +
  "notify pgrst, 'reload schema';";

export function isOutdatedMcqSchemaError(message: string): boolean {
  return (
    message.includes("question_type") ||
    message.includes("option_images") ||
    message.includes("statements") ||
    message.includes("image_path") ||
    (message.includes("mcq_questions") && message.includes("does not exist"))
  );
}

export function formatMcqDbError(message: string): string {
  if (isOutdatedMcqSchemaError(message)) {
    return `MCQ database is outdated. ${MCQ_MIGRATION_HINT}`;
  }
  return message;
}

export function needsMcqMigrationForPayload(payload: {
  question_type?: string;
  statements?: string[];
  image_path?: string;
  option_images?: string[];
}): string | null {
  const type = payload.question_type || "normal";
  if (type !== "normal") {
    return "Statement-wise and image MCQs require the database migration. " + MCQ_MIGRATION_HINT;
  }
  if (payload.image_path?.trim()) {
    return "Image MCQs require the database migration. " + MCQ_MIGRATION_HINT;
  }
  if (payload.option_images?.some((p) => p?.trim())) {
    return "Option images require the database migration. " + MCQ_MIGRATION_HINT;
  }
  if (payload.statements?.some((s) => s?.trim())) {
    return "Statement MCQs require the database migration. " + MCQ_MIGRATION_HINT;
  }
  return null;
}

export function legacyMcqInsertRow(payload: {
  chapter_id: string;
  question: string;
  options: string[];
  correct_index?: number;
  explanation?: string;
  order_index?: number;
}) {
  return {
    chapter_id: payload.chapter_id,
    question: payload.question,
    options: payload.options,
    correct_index: payload.correct_index ?? 0,
    explanation: payload.explanation || "",
    order_index: payload.order_index ?? 1,
  };
}

export function legacyMcqUpdateFields(updates: Record<string, unknown>) {
  const allowed = ["question", "options", "correct_index", "explanation", "order_index", "chapter_id"];
  return Object.fromEntries(Object.entries(updates).filter(([key]) => allowed.includes(key)));
}
