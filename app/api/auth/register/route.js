import { NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { username, displayName, password } = await request.json();
    const user = await createUser({ username, displayName, password });
    await createSession(user.username);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Could not create account." },
      { status: 400 }
    );
  }
}
