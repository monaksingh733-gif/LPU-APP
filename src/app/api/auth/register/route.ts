import { NextResponse } from "next/server";
import { db } from "@/db";
import { authSessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ensureSeeded } from "@/db/seed";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if email is already registered
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
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
        fullName: fullName.trim(),
        email: cleanEmail,
        regId,
        mobile,
        gender: "prefer_not_to_say",
        course: "B.Tech Computer Science",
        academicYear: 3,
        interests: ["Study", "Hangout"],
        avatarHue: Math.floor(Math.random() * 360),
        visible: true,
        isDemo: false,
        passwordHash: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      });

    // 4. Create active session token
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(authSessions).values({
      token,
      userId: newUser.id,
    });

    const res = NextResponse.json({
      success: true,
      user: newUser,
    });

    // Set secure auth cookie
    res.cookies.set("quad_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Server error during registration" }, { status: 500 });
  }
}
