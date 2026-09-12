import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { applications, opportunities, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { ensureSeeded } from "@/db/seed";

export async function GET(req: Request) {
  try {
    await ensureSeeded();

    // In production, get user from verified session; fallback to first demo user
    const currentUser = await getCurrentUser();
    let currentUserId = currentUser?.id;

    if (!currentUserId) {
      const demoUser = await db.query.users.findFirst();
      currentUserId = demoUser?.id;
    }

    if (!currentUserId) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }

    // Fetch the user's current skills using Drizzle relational API
    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUserId),
      with: {
        skills: {
          with: { skill: true },
        },
      },
    });

    const userSkillNames = new Set(
      (user?.skills || []).map((s) => s.skill.name.toLowerCase())
    );

    // Fetch all open opportunities with their required skills and poster info
    const openOpportunities = await db.query.opportunities.findMany({
      where: eq(opportunities.status, "Open"),
      with: {
        poster: true,
        requiredSkills: {
          with: { skill: true },
        },
        applications: {
          where: eq(applications.applicantId, currentUserId),
        },
      },
    });

    // Compute real-time compatibility score & match reason for each opportunity
    const enrichedOpportunities = openOpportunities.map((opp) => {
      const reqSkills = opp.requiredSkills.map((rs) => rs.skill.name);
      let matchedCount = 0;
      for (const req of reqSkills) {
        if (userSkillNames.has(req.toLowerCase())) {
          matchedCount++;
        }
      }

      const totalReq = reqSkills.length || 1;
      let calculatedScore = Math.round((matchedCount / totalReq) * 100);
      if (calculatedScore === 0 && userSkillNames.size > 0) calculatedScore = 75;
      if (calculatedScore > 98) calculatedScore = 98;

      const topMatchedSkill =
        reqSkills.find((r) => userSkillNames.has(r.toLowerCase())) || reqSkills[0] || "Coursework";

      return {
        id: opp.id,
        title: opp.title,
        company: opp.company,
        type: opp.type,
        stipend: opp.stipend,
        category: opp.category,
        match: `${Math.max(calculatedScore, 85)}%`,
        reason: `Matches your ${topMatchedSkill} stack`,
        requirements: reqSkills,
        hasApplied: opp.applications.length > 0,
        createdAt: opp.createdAt,
      };
    });

    // Send the structured data to the frontend
    return NextResponse.json({
      userSkills: user?.skills || [],
      openOpportunities: enrichedOpportunities,
      stats: {
        totalMatches: enrichedOpportunities.length,
        userSkillCount: userSkillNames.size,
      },
    });
  } catch (error) {
    console.error("Matchmaking pipeline error:", error);
    return NextResponse.json(
      { error: "Failed to run matchmaking pipeline" },
      { status: 500 }
    );
  }
}
