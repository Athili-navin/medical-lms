/** Register this browser as the only active login for the account. */
export async function registerActiveSessionClient() {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Could not start session" }));
    throw new Error(typeof body.error === "string" ? body.error : "Could not start session");
  }
}
