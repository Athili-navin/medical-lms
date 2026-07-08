import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export async function handleAuthCallback(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  const authError =
    searchParams.get("error_description") ??
    searchParams.get("error_code") ??
    searchParams.get("error");

  if (authError && !code && !tokenHash) {
    const target = next.includes("reset-password") ? "/reset-password" : next;
    return NextResponse.redirect(
      `${origin}${target}?error=${encodeURIComponent(authError.replace(/\+/g, " "))}`
    );
  }

  const redirectUrl = `${origin}${next}`;

  if (!code && !(tokenHash && type === "recovery")) {
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/reset-password?error=${encodeURIComponent(error.message)}`
      );
    }
  } else if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    if (error) {
      return NextResponse.redirect(
        `${origin}/reset-password?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  return response;
}
