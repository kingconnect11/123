import { NextResponse } from "next/server";
import { verifyUser, createSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const user = await verifyUser({ username, password });
    if (!user) {
      return NextResponse.json(
        { error: "Wrong username or password." },
        { status: 401 }
      );
    }
    await createSession(user.username);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Could not log in." }, { status: 400 });
  }
}
