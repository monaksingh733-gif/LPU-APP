import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { authSessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ensureSeeded, seedStarterChats } from "@/db/seed";
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

    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!fullName || !email || !password) {
      return NextResponse.json({ ok: false, error: "All fields are required" }, { status: 400 });
    }

    if (fullName.length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your full name" }, { status: 400 });
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ ok: false, error: "Please provide a valid email address" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ ok: false, error: "Password must be at least 4 characters long" }, { status: 400 });
    }

    // 1. Check if email is already registered
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ ok: false, error: "Email already in use. Please sign in instead." }, { status: 400 });
    }

    // 2. Encrypt password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique regId and mobile placeholder if registering via email
    const regId = "REG" + Math.floor(100000 + Math.random() * 900000);
    const mobile = "+91" + Math.floor(6000000000 + Math.random() * 3999999999);

    // 3. Save user with passwordHash
    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        email,
        regId,
        mobile,
        gender: "prefer_not_to_say",
        course: "B.Tech Computer Science",
        academicYear: 2,
        interests: ["Study", "Hangout"],
        avatarHue: Math.floor(Math.random() * 360),
        visible: true,
        isDemo: false,
        passwordHash: hashedPassword,
      })
      .returning();

    // 4. Seed initial welcome chats and buddy requests
    try {
      await seedStarterChats(newUser.id);
    } catch (e) {
      console.warn("Could not seed starter chats for new user:", e);
    }

    // 5. Create active session token
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(authSessions).values({
      token,
      userId: newUser.id,
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
      user: publicUser(newUser),
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
    console.error("Registration error:", error);
    return NextResponse.json({ ok: false, error: "Server error during registration" }, { status: 500 });
  }
}
