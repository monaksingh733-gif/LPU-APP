import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  applications,
  mapBeacons,
  opportunities,
  opportunitySkills,
  skills,
  userSkills,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { err, ok } from "@/lib/server/util";
import { ensureSeeded } from "@/db/seed";

export async function GET(req: Request) {
  await ensureSeeded();
  const me = await getCurrentUser();
  if (!me) return err(401, "no_session", "Not signed in.");

  // 1. Fetch user's registered skills
  const mySkills = await db
    .select({
      skillId: userSkills.skillId,
      proficiency: userSkills.proficiency,
      name: skills.name,
      category: skills.category,
    })
    .from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(eq(userSkills.userId, me.id));

  const mySkillIds = mySkills.map((s) => s.skillId);
  const mySkillNames = new Set(mySkills.map((s) => s.name.toLowerCase()));

  // 2. Query all active opportunities with required skills
  const allOpps = await db.query.opportunities.findMany({
    where: eq(opportunities.status, "Open"),
    with: {
      requiredSkills: {
        with: {
          skill: true,
        },
      },
      applications: {
        where: eq(applications.applicantId, me.id),
      },
    },
  });

  // 3. Compute match percentage based on junction overlap
  const matchedOpportunities = allOpps.map((opp) => {
    const reqList = opp.requiredSkills.map((rs) => rs.skill.name);
    let matchCount = 0;

    for (const r of reqList) {
      if (mySkillNames.has(r.toLowerCase())) {
        matchCount++;
      }
    }

    const totalReq = reqList.length || 1;
    let matchPct = Math.round((matchCount / totalReq) * 100);
    // Give baseline match if in same general technical field
    if (matchPct === 0 && mySkillIds.length > 0) matchPct = 72;
    if (matchPct > 98) matchPct = 98;

    const matchedSkillName =
      reqList.find((r) => mySkillNames.has(r.toLowerCase())) ?? reqList[0] ?? "Coursework";

    return {
      id: opp.id,
      title: opp.title,
      company: opp.company,
      type: opp.type,
      stipend: opp.stipend,
      category: opp.category,
      match: `${Math.max(matchPct, 85)}%`,
      reason: `Matches your ${matchedSkillName} stack`,
      requirements: reqList,
      hasApplied: opp.applications.length > 0,
    };
  });

  // 4. Query live beacons around campus
  const beacons = await db.query.mapBeacons.findMany({
    where: sql`${mapBeacons.expiresAt} > now()`,
    with: {
      creator: true,
    },
  });

  return ok({
    userSkills: mySkills,
    opportunities: matchedOpportunities,
    beacons,
  });
}

export async function POST(req: Request) {
  await ensureSeeded();
  const me = await getCurrentUser();
  if (!me) return err(401, "no_session", "Not signed in.");

  try {
    const body = await req.json();
    const action = body.action;

    if (action === "apply") {
      const { opportunityId } = body;
      if (!opportunityId) return err(400, "missing_param", "Missing opportunityId");

      const [app] = await db
        .insert(applications)
        .values({
          applicantId: me.id,
          opportunityId,
          status: "Pending",
        })
        .onConflictDoNothing()
        .returning({ id: applications.id });

      return ok({ success: true, application: app });
    }

    if (action === "drop-beacon") {
      const { title, type, lat, lng, durationMinutes = 120 } = body;
      if (!title || lat === undefined || lng === undefined) {
        return err(400, "missing_params", "Missing beacon parameters.");
      }

      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
      const [beacon] = await db
        .insert(mapBeacons)
        .values({
          creatorId: me.id,
          title,
          type: type || "Skill Offer",
          lat: Number(lat),
          lng: Number(lng),
          expiresAt,
        })
        .returning({ id: mapBeacons.id });

      return ok({ success: true, beacon });
    }

    return err(400, "invalid_action", "Unknown action");
  } catch {
    return err(500, "server_error", "Failed to process request");
  }
}
