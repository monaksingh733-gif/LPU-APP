import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { announcements, eventRsvps, events, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { err, ok, pulseCount } from "@/lib/server/util";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return err(401, "no_session", "Not signed in.");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const pulse = {
    total: pulseCount("total", 340, 120),
    buddies: pulseCount("buddy_finder", 90, 60),
    food: pulseCount("food", 60, 50),
    events: pulseCount("events", 40, 40),
  };

  const notices = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.pinned), desc(announcements.createdAt));

  const lookingToday = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(users)
    .where(sql`${users.visible} = true and ${users.lookingFor} is not null and ${users.isDemo} = true`);

  const topEvents = await db
    .select()
    .from(events)
    .orderBy(events.startsAt)
    .limit(3);

  const topEventIds = topEvents.map((e) => e.id);
  const topRsvps =
    topEventIds.length > 0
      ? await db.select().from(eventRsvps)
      : [];

  return ok({
    greeting,
    pulse,
    lookingToday: lookingToday[0]?.n ?? 0,
    announcements: notices.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      pinned: a.pinned,
      createdAt: a.createdAt,
    })),
    trending: topEvents.map((t) => {
      const eRsvps = topRsvps.filter((r) => r.eventId === t.id);
      return {
        id: t.id,
        title: t.title,
        location: t.location,
        tag: t.tag,
        image: t.image || "",
        startsAt: t.startsAt,
        going: eRsvps.length,
        buddySeekers: eRsvps.filter((r) => r.wantsBuddy).length,
      };
    }),
  });
}
