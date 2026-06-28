import { NextResponse } from "next/server";
import { getSessionUser, listUsers } from "@/lib/auth";
import { getStatus, setStatus } from "@/lib/vibes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — everyone's current vibe (you + your crew).
export async function GET() {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  const users = await listUsers();
  const people = await Promise.all(
    users.map(async (u) => ({
      username: u.username,
      displayName: u.displayName,
      isMe: u.username === me.username,
      status: await getStatus(u.username),
    }))
  );
  // Me first, then everyone else by most recently updated.
  people.sort((a, b) => {
    if (a.isMe) return -1;
    if (b.isMe) return 1;
    return (b.status.updatedAt || 0) - (a.status.updatedAt || 0);
  });
  return NextResponse.json({ me: me.username, people });
}

// PUT — update my vibe.
export async function PUT(request) {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  const body = await request.json();
  const status = await setStatus(me.username, body);
  return NextResponse.json({ status });
}
