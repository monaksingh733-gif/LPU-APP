import { and, desc, eq, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { ensureSeeded, seedStarterChats } from "@/db/seed";
import {
  createSessionCookie,
  destroySessionCookie,
  publicUser,
} from "@/lib/server/auth";
import { err, ok, readBody } from "@/lib/server/util";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(edu|ac\.in)$/i;
const MOBILE_RE = /^\+?[0-9][0-9 -]{8,14}$/;
const OTP_TTL_MS = 5 * 60_000;

async function latestOtp(identifier: string) {
  const rows = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.identifier, identifier))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function GET() {
  await ensureSeeded();
  const demos = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      course: users.course,
      academicYear: users.academicYear,
      avatarHue: users.avatarHue,
      gender: users.gender,
      lookingFor: users.lookingFor,
      interests: users.interests,
    })
    .from(users)
    .where(and(eq(users.isDemo, true), sql`${users.fullName} != 'Quad Team'`))
    .limit(8);

  return ok({ demoUsers: demos });
}

export async function POST(req: Request) {
  await ensureSeeded();
  const body = await readBody(req);
  const action = String(body.action ?? "");

  /* ------------------------------ DEMO LOGIN ------------------------------ */
  if (action === "demo-login") {
    const userId = String(body.userId ?? "");
    let user;
    if (userId) {
      const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      user = rows[0];
    } else {
      const rows = await db
        .select()
        .from(users)
        .where(and(eq(users.isDemo, true), sql`${users.fullName} != 'Quad Team'`))
        .limit(1);
      user = rows[0];
    }
    if (!user) return err(404, "no_user", "Demo user not found.");
    await createSessionCookie(user.id);
    return ok({ user: publicUser(user) });
  }

  /* ------------------------------ REQUEST OTP ------------------------------ */
  if (action === "request-otp") {
    const identifier = String(body.identifier ?? "").trim().toLowerCase();
    const kind = body.kind === "mobile" ? "mobile" : "email";

    if (kind === "email" && !EMAIL_RE.test(identifier)) {
      return err(422, "bad_email", "Use your institutional email (.edu or .ac.in).");
    }
    if (kind === "mobile" && !MOBILE_RE.test(identifier)) {
      return err(422, "bad_mobile", "Enter a valid mobile number.");
    }

    // Rate limit: reuse the most recent code if requested within 30 seconds.
    const recent = await latestOtp(identifier);
    if (
      recent &&
      !recent.usedAt &&
      recent.expiresAt.getTime() > Date.now() &&
      Date.now() - recent.createdAt.getTime() < 30_000
    ) {
      return ok({ sent: true, demoCode: recent.code, throttled: true });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await db.insert(otpCodes).values({
      identifier,
      kind,
      code,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    return ok({ sent: true, demoCode: code });
  }

  /* ------------------------------- VERIFY OTP ------------------------------ */
  if (action === "verify-otp") {
    const identifier = String(body.identifier ?? "").trim().toLowerCase();
    const code = String(body.otp ?? "").trim();
    const otp = await latestOtp(identifier);
    if (!otp || otp.usedAt || otp.expiresAt.getTime() < Date.now()) {
      return err(410, "otp_expired", "That code expired. Request a new one.");
    }
    if (otp.code !== code) {
      return err(401, "otp_wrong", "Incorrect code. Check and try again.");
    }
    await db
      .update(otpCodes)
      .set({ usedAt: new Date() })
      .where(eq(otpCodes.id, otp.id));

    // Returning user? Sign them straight in.
    const col = otp.kind === "email" ? users.email : users.mobile;
    const existing = await db
      .select()
      .from(users)
      .where(eq(col, identifier))
      .limit(1);
    if (existing[0]) {
      await createSessionCookie(existing[0].id);
      return ok({ verified: true, returning: true, user: publicUser(existing[0]) });
    }
    return ok({ verified: true, returning: false });
  }

  /* ---------------------------- COMPLETE PROFILE --------------------------- */
  if (action === "complete-profile") {
    const mobile = String(body.mobile ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim().toLowerCase();

    const verifiedMobile = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.identifier, mobile),
          eq(otpCodes.kind, "mobile"),
          isNotNull(otpCodes.usedAt)
        )
      )
      .limit(1);
    const verifiedEmail = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.identifier, email),
          eq(otpCodes.kind, "email"),
          isNotNull(otpCodes.usedAt)
        )
      )
      .limit(1);
    if (!verifiedMobile[0] || !verifiedEmail[0]) {
      return err(401, "unverified", "Both mobile and email must be OTP-verified first.");
    }

    const dup = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.mobile, mobile)))
      .limit(1);
    if (dup[0]) {
      await createSessionCookie(dup[0].id);
      return err(409, "exists", "An account already exists for these credentials — signed you in.");
    }

    const fullName = String(body.fullName ?? "").trim();
    const gender = String(body.gender ?? "");
    const course = String(body.course ?? "").trim();
    const academicYear = Number(body.academicYear ?? 0);
    const interests = Array.isArray(body.interests)
      ? body.interests.map(String).slice(0, 6)
      : [];
    if (fullName.length < 3) return err(422, "bad_name", "Enter your full name (as on your ID card).");
    if (!["male", "female", "non_binary", "prefer_not_to_say"].includes(gender))
      return err(422, "bad_gender", "Select a gender option.");
    if (!course) return err(422, "bad_course", "Select your course.");
    if (academicYear < 1 || academicYear > 4)
      return err(422, "bad_year", "Academic year must be between 1 and 4.");

    const regId = `REG-2026-${String(Math.floor(10000 + Math.random() * 89999))}`;
    const [user] = await db
      .insert(users)
      .values({
        fullName,
        regId,
        email,
        mobile,
        gender: gender as "male" | "female" | "non_binary",
        course,
        academicYear,
        interests,
        lookingFor: String(body.lookingFor ?? "").trim().slice(0, 60) || null,
        avatarHue: Number(body.avatarHue ?? Math.floor(Math.random() * 360)),
        visible: body.visible !== false,
      })
      .returning();

    await seedStarterChats(user.id);
    await createSessionCookie(user.id);
    return ok({ user: publicUser(user) }, 201);
  }

  /* --------------------------------- LOGOUT -------------------------------- */
  if (action === "logout") {
    await destroySessionCookie();
    return ok({ loggedOut: true });
  }

  return err(400, "bad_action", "Unknown auth action.");
}
