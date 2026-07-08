import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";

export async function GET() {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { data, error } = await auth.supabase!
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return apiError(error.message);
  return NextResponse.json(
    data?.map((a) => ({
      id: a.id,
      message: a.message,
      type: a.type,
      createdAt: a.created_at,
    })) ?? []
  );
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { message, type } = await request.json();
  if (!message) return apiError("message required", 400);

  const { data, error } = await auth.supabase!
    .from("announcements")
    .insert({ message, type: type || "general", tutor_id: auth.user.id })
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(
    { id: data.id, message: data.message, type: data.type, createdAt: data.created_at },
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("id required", 400);

  const { error } = await auth.supabase!.from("announcements").delete().eq("id", id);
  if (error) return apiError(error.message);
  return NextResponse.json({ success: true });
}
