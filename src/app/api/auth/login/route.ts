import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { authSessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ensureSeeded } from "@/db/seed";
import { publicUser } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON request" }, { status: 400 });
    }

    const email = String(body.email ?? body.identifier ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
    }

    // 1. Find user in database
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }

    // 2. Verify encrypted password hash
    let isValid = false;
    if (user.passwordHash) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } else if (user.isDemo) {
      // Demo accounts allow login with default password "password123" or demo password
      isValid = password === "password123" || password.length >= 4;
    }

    if (!isValid) {
      return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }

    // 3. Issue active session token
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(authSessions).values({
      token,
      userId: user.id,
    });

    const cookieStore = await cookies();
    cookieStore.set("quad_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    const res = NextResponse.json({
      ok: true,
      success: true,
      user: publicUser(user),
    });

    res.cookies.set("quad_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ ok: false, error: "Server error during login" }, { status: 500 });
  }
}
