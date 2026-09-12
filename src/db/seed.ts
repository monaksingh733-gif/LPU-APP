import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import {
  announcements,
  chatSessions,
  eventRsvps,
  events,
  messages,
  opportunities,
  opportunitySkills,
  places,
  reviews,
  skills,
  userSkills,
  users,
  vendors,
} from "@/db/schema";

const IMG = {
  thali:
    "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
  pavbhaji:
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
  chai:
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
  salad:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  momos:
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  dahi:
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  rolls:
    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  waffles:
    "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80",
  kulcha:
    "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
  dosa:
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
  shakes:
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
};

const DEMO_USERS = [
  { fullName: "Anya Sharma", gender: "female", course: "B.Des Communication", academicYear: 2, interests: ["Study", "Hangout"], lookingFor: "Creative sketching & cozy chai chats", avatarHue: 155 },
  { fullName: "Aarav Mehta", gender: "male", course: "B.Tech CSE", academicYear: 2, interests: ["Gym", "Gaming"], lookingFor: "Gym buddy for 6am sessions", avatarHue: 18 },
  { fullName: "Ishita Rao", gender: "female", course: "B.Des", academicYear: 3, interests: ["Study", "Hangout"], lookingFor: "Study buddy for design history", avatarHue: 330 },
  { fullName: "Kabir Anand", gender: "male", course: "BBA", academicYear: 1, interests: ["Hangout", "Movies"], lookingFor: "Movie night squad", avatarHue: 210 },
  { fullName: "Meera Pillai", gender: "female", course: "B.Tech ECE", academicYear: 2, interests: ["Study", "Music"], lookingFor: "Notes exchange + chai", avatarHue: 262 },
  { fullName: "Dev Sharma", gender: "male", course: "B.Tech Mechanical", academicYear: 4, interests: ["Gym", "Hangout"], lookingFor: "Basketball evenings", avatarHue: 96 },
  { fullName: "Sana Sheikh", gender: "female", course: "B.Sc Psychology", academicYear: 1, interests: ["Hangout", "Music"], lookingFor: "Campus walk + playlist swap", avatarHue: 44 },
  { fullName: "Rohan Iyer", gender: "male", course: "B.Tech CSE", academicYear: 3, interests: ["Study", "Gaming"], lookingFor: "LeetCode partner", avatarHue: 142 },
  { fullName: "Tara Kulkarni", gender: "female", course: "BBA", academicYear: 2, interests: ["Gym", "Hangout"], lookingFor: "Morning run partner", avatarHue: 300 },
  { fullName: "Advait Nair", gender: "male", course: "B.Des", academicYear: 2, interests: ["Movies", "Hangout"], lookingFor: "Film club co-founder search", avatarHue: 60 },
  { fullName: "Niki Joshi", gender: "non_binary", course: "B.Sc Physics", academicYear: 3, interests: ["Study", "Hangout"], lookingFor: "Astronomy club stargazing", avatarHue: 174 },
  { fullName: "Priya Menon", gender: "female", course: "B.Tech CSE", academicYear: 4, interests: ["Study", "Hangout"], lookingFor: "Placement prep partner", avatarHue: 20 },
  { fullName: "Arjun Bhatt", gender: "male", course: "BBA", academicYear: 3, interests: ["Gaming", "Movies"], lookingFor: "Valorant ranked team", avatarHue: 240 },
] as const;

const day = 86_400_000;

export const vendorDefs = [
  {
    name: "Main Canteen",
    blurb: "The legendary thali spot. Peak rush 12:30–1:30.",
    isOpen: true,
    image: IMG.thali,
    topDish: "Misal Pav Thali",
    x: 44, y: 38,
    menu: [
      { item: "Misal Pav Thali", price: "₹80", veg: true },
      { item: "Veg Biryani", price: "₹95", veg: true },
      { item: "Chicken Curry Meal", price: "₹120", veg: false },
      { item: "Curd Rice", price: "₹60", veg: true },
    ],
  },
  {
    name: "Night Canteen",
    blurb: "Open till 1am during exams. Hostel-side favourite.",
    isOpen: true,
    image: IMG.pavbhaji,
    topDish: "Butter Pav Bhaji",
    x: 22, y: 61,
    menu: [
      { item: "Butter Pav Bhaji", price: "₹70", veg: true },
      { item: "Cheese Omelette Pav", price: "₹65", veg: false },
      { item: "Maggi (2 min, 20 min actual)", price: "₹45", veg: true },
    ],
  },
  {
    name: "Chai Tapri",
    blurb: "Cutting chai, vada, and unlimited gossip.",
    isOpen: true,
    image: IMG.chai,
    topDish: "Masala Chai + Vada",
    x: 68, y: 44,
    menu: [
      { item: "Masala Chai", price: "₹15", veg: true },
      { item: "Medu Vada (2pc)", price: "₹30", veg: true },
      { item: "Bun Maska", price: "₹25", veg: true },
    ],
  },
  {
    name: "Green Bowl Café",
    blurb: "Salads & meal-prep bowls near the sports complex.",
    isOpen: false,
    image: IMG.salad,
    topDish: "Protein Meal-Prep Bowl",
    x: 78, y: 30,
    menu: [
      { item: "Protein Meal-Prep Bowl", price: "₹150", veg: false },
      { item: "Falafel Salad", price: "₹130", veg: true },
      { item: "Cold Coffee", price: "₹70", veg: true },
    ],
  },
  {
    name: "Momos Corner",
    blurb: "Steamed, fried, or tandoori — the queue says it all.",
    isOpen: true,
    image: IMG.momos,
    topDish: "Steamed Chicken Momos",
    x: 34, y: 50,
    menu: [
      { item: "Steamed Chicken Momos", price: "₹60", veg: false },
      { item: "Veg Fried Momos", price: "₹70", veg: true },
      { item: "Thukpa", price: "₹80", veg: true },
    ],
  },
  {
    name: "Dahi House",
    blurb: "Chaat, lassi and everything curd.",
    isOpen: true,
    image: IMG.dahi,
    topDish: "Dahi Vada Chaat",
    x: 58, y: 58,
    menu: [
      { item: "Dahi Vada Chaat", price: "₹55", veg: true },
      { item: "Sweet Lassi", price: "₹40", veg: true },
      { item: "Pani Puri (6pc)", price: "₹35", veg: true },
    ],
  },
  {
    name: "Rolls Mania & Kathi Point",
    blurb: "Kolkata style kathi rolls & cheesy frankies outside UniMall.",
    isOpen: true,
    image: IMG.rolls,
    topDish: "Paneer Tikka Kathi Roll",
    x: 59, y: 32,
    menu: [
      { item: "Paneer Tikka Kathi Roll", price: "₹85", veg: true },
      { item: "Double Egg Chicken Roll", price: "₹110", veg: false },
      { item: "Peri Peri French Fries", price: "₹65", veg: true },
    ],
  },
  {
    name: "UniMall Waffle & Cafe Express",
    blurb: "Warm Belgian waffles, iced caramel frappes, and dessert treats.",
    isOpen: true,
    image: IMG.waffles,
    topDish: "Belgian Chocolate Waffle",
    x: 76, y: 46,
    menu: [
      { item: "Belgian Dark Chocolate Waffle", price: "₹120", veg: true },
      { item: "Iced Caramel Macchiato", price: "₹95", veg: true },
      { item: "Warm Brownie with Fudge", price: "₹80", veg: true },
    ],
  },
  {
    name: "Amritsari Kulcha Dhaba",
    blurb: "Tandoori chur chur kulchas straight from the earthen clay pot.",
    isOpen: true,
    image: IMG.kulcha,
    topDish: "Chur Chur Aloo Kulcha Thali",
    x: 37, y: 55,
    menu: [
      { item: "Chur Chur Aloo Kulcha Thali", price: "₹90", veg: true },
      { item: "Chole Bhature (2pc)", price: "₹85", veg: true },
      { item: "Patiala Sweet Lassi", price: "₹50", veg: true },
    ],
  },
  {
    name: "Madras Dosa Corner",
    blurb: "Sizzling ghee roast dosas, idlis and authentic filter kaapi.",
    isOpen: true,
    image: IMG.dosa,
    topDish: "Mysore Masala Dosa",
    x: 55, y: 45,
    menu: [
      { item: "Mysore Masala Dosa", price: "₹75", veg: true },
      { item: "Ghee Podi Mini Idli (10pc)", price: "₹65", veg: true },
      { item: "Madras Filter Kaapi", price: "₹30", veg: true },
    ],
  },
  {
    name: "Fresh Juice & Shake Oasis",
    blurb: "Fresh cold-pressed juices, protein smoothies and thick shakes.",
    isOpen: true,
    image: IMG.shakes,
    topDish: "Alphonso Mango Mastani",
    x: 74, y: 28,
    menu: [
      { item: "Alphonso Mango Mastani", price: "₹80", veg: true },
      { item: "Avocado Honey Protein Shake", price: "₹110", veg: true },
      { item: "Mosambi Mint Fresh Juice", price: "₹50", veg: true },
    ],
  },
];

export async function syncVendors() {
  try {
    const existing = await db.select({ name: vendors.name }).from(vendors);
    const names = new Set(existing.map((e) => e.name));
    const userRows = await db.select({ id: users.id }).from(users).limit(10);
    const uids = userRows.map((u) => u.id);

    for (const v of vendorDefs) {
      if (!names.has(v.name)) {
        const [newV] = await db.insert(vendors).values(v).returning({ id: vendors.id });
        if (newV && uids.length > 0) {
          await db.insert(reviews).values({
            vendorId: newV.id,
            userId: uids[Math.floor(Math.random() * uids.length)],
            rating: 5,
            body: `Love ${v.name}! The ${v.topDish} is absolute fire 🔥`,
          });
        }
      }
    }
  } catch {
    // Graceful fallback
  }
}

let seeding: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seeding) seeding = doSeed().catch((e) => { seeding = null; throw e; });
  await seeding;
  await syncVendors();
}

async function doSeed() {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(users)
    .where(sql`${users.isDemo} = true`);
  if (Number(n) > 0) return;

  /* ------------------------------ demo users ------------------------------ */
  const defaultHash = await bcrypt.hash("password123", 10);
  const userIds: string[] = [];
  for (let i = 0; i < DEMO_USERS.length; i++) {
    const u = DEMO_USERS[i];
    const first = u.fullName.split(" ")[0].toLowerCase();
    const [row] = await db
      .insert(users)
      .values({
        fullName: u.fullName,
        regId: `REG-D-${String(1001 + i)}`,
        email: `${first}@demo.campus.ac.in`,
        mobile: `900000${String(1000 + i)}`,
        gender: u.gender as "male" | "female" | "non_binary",
        course: u.course,
        academicYear: u.academicYear,
        interests: [...u.interests],
        lookingFor: u.lookingFor,
        avatarHue: u.avatarHue,
        isDemo: true,
        passwordHash: defaultHash,
      })
      .returning({ id: users.id });
    userIds.push(row.id);
  }

  const [team] = await db
    .insert(users)
    .values({
      fullName: "Quad Team",
      regId: "REG-D-TEAM",
      email: "team@demo.campus.ac.in",
      mobile: "9000009999",
      gender: "non_binary",
      course: "Campus Staff",
      academicYear: 4,
      interests: [],
      lookingFor: null,
      avatarHue: 152,
      isDemo: true,
    })
    .returning({ id: users.id });
  const teamId = team.id;

  /* --------------------------------- places -------------------------------- */
  const placeDefs = [
    { name: "Block 34 (School of Design & Architecture)", kind: "academic", x: 18, y: 24 },
    { name: "Main Academic Block", kind: "academic", x: 22, y: 20 },
    { name: "Central Library", kind: "academic", x: 42, y: 14 },
    { name: "Auditorium", kind: "academic", x: 64, y: 14 },
    { name: "Admin Block", kind: "academic", x: 50, y: 28 },
    { name: "Sports Complex", kind: "academic", x: 84, y: 22 },
    { name: "Hostel A", kind: "housing", x: 14, y: 56 },
    { name: "Hostel B", kind: "housing", x: 28, y: 66 },
    { name: "Hostel C (PG)", kind: "housing", x: 88, y: 62 },
  ] as const;
  for (const p of placeDefs) {
    await db.insert(places).values({ ...p });
  }

  /* -------------------------------- vendors -------------------------------- */
  const vendorIds: string[] = [];
  for (const v of vendorDefs) {
    const [row] = await db.insert(vendors).values(v).returning({ id: vendors.id });
    vendorIds.push(row.id);
  }


  /* -------------------------------- reviews -------------------------------- */
  const reviewSeed: [number, number, number, string][] = [
    [0, 0, 5, "Best thali on campus, the misal is properly spicy."],
    [0, 3, 4, "Crowded at lunch but worth it. Curd rice is underrated."],
    [0, 10, 5, "My daily lunch spot since first year."],
    [1, 1, 5, "Butter pav bhaji at midnight during finals = lifesaver."],
    [1, 7, 4, "Omelette pav is solid. Seating is tight."],
    [2, 2, 5, "₹15 chai that fixes everything. Nuff said."],
    [2, 5, 4, "Vada is crispy, chai is strong. Perfect combo."],
    [3, 4, 4, "Finally healthy options near the gym."],
    [4, 6, 5, "Tandoori momos with extra chutney. Elite."],
    [4, 9, 4, "Queue moves fast, portions are generous."],
    [5, 8, 5, "Dahi vada here tastes like home."],
    [6, 1, 5, "Kolkata kathi rolls here are unbeatable after lectures."],
    [7, 2, 5, "Warm Belgian waffle with hot dark chocolate is perfection."],
    [8, 5, 5, "Chur chur kulcha with spicy chole and pickled onions!"],
    [9, 4, 5, "Ghee podi idli and the hot filter coffee hit different."],
    [10, 7, 5, "Mango Mastani shake is the ultimate campus refresher."],
  ];
  for (const [v, u, rating, body] of reviewSeed) {
    if (vendorIds[v] && userIds[u]) {
      await db.insert(reviews).values({
        vendorId: vendorIds[v],
        userId: userIds[u],
        rating,
        body,
      });
    }
  }

  /* --------------------------------- events -------------------------------- */
  const eventDefs = [
    {
      title: "One World: Global Cultural Fest 2026",
      description: "LPU's flagship cultural extravaganza! Vibrant folk dances, musical bands, street play, traditional costume walk, and food stalls from 40+ countries.",
      location: "Shanti Devi Mittal Auditorium",
      startsAt: new Date(Date.now() + 1 * day),
      tag: "Cultural",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "HackNight 2026: 24-Hour Code Clash",
      description: "Flagship overnight hackathon! Build web3, AI, and campus utility apps with free Red Bull, midnight pizza, mentors from Google & Microsoft, and ₹2L bounty pool.",
      location: "Innovation Lab & Block 34",
      startsAt: new Date(Date.now() + 3 * day),
      tag: "Coding",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Friday Starlight Cinema: 3 Idiots",
      description: "Under-the-stars open-air screening on the Central Quad lawn. Free buttery popcorn, beanbags, and laser projector under the night sky.",
      location: "Central Quad Lawn",
      startsAt: new Date(Date.now() + 2 * day),
      tag: "Movies",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Indie Beats & Acoustic Sunset",
      description: "Live unplugged music session by student bands and acoustic singer-songwriters. Chai and coffee by the amphitheatre stairs.",
      location: "Amphitheatre Steps",
      startsAt: new Date(Date.now() + 4 * day),
      tag: "Music",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Campus 5K Sunset Run & Fitness Blitz",
      description: "Annual loop around the university boulevard. All paces welcome, with hydration zones, energy bars, and post-run smoothie social.",
      location: "Baldev Raj Mittal Sports Complex",
      startsAt: new Date(Date.now() + 5 * day),
      tag: "Gym",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "CyberPulse: Capture The Flag & DevFest",
      description: "Deep dive into ethical hacking, web exploits, binary analysis, and developer tooling showdown. Beginners track available!",
      location: "Uni-Tech Tower Lab 4",
      startsAt: new Date(Date.now() + 7 * day),
      tag: "Coding",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    },
  ];
  const eventIds: string[] = [];
  for (const e of eventDefs) {
    const [row] = await db.insert(events).values(e).returning({ id: events.id });
    eventIds.push(row.id);
  }
  // Seed demo RSVPs so "looking for buddies" counts feel alive.
  const rsvpSeed: [number, number][] = [
    [0, 2], [0, 5], [0, 9], [0, 11], [0, 1], [0, 4], [0, 7],
    [1, 0], [1, 4], [1, 7], [1, 6], [1, 8],
    [2, 6], [2, 10], [2, 3], [2, 9],
    [3, 5], [3, 8], [3, 1],
    [4, 10], [4, 3],
    [5, 0], [5, 2], [5, 6],
  ];
  for (const [e, u] of rsvpSeed) {
    await db.insert(eventRsvps).values({
      eventId: eventIds[e],
      userId: userIds[u],
      wantsBuddy: true,
    });
  }

  /* ------------------------------ announcements ---------------------------- */
  await db.insert(announcements).values([
    {
      title: "Mid-sem exam timetable released",
      body: "Timetable is live on the notice board and student portal. Seating plans publish 48 hours before each paper.",
      pinned: true,
      createdAt: new Date(Date.now() - 5 * 3600_000),
    },
    {
      title: "Hostel B water maintenance",
      body: "Water supply paused Thursday 10:00–13:00 for tank cleaning. Fill buckets in advance.",
      pinned: false,
      createdAt: new Date(Date.now() - 26 * 3600_000),
    },
    {
      title: "Library late-night reading room",
      body: "Reading Room 3 now open until 2:00 AM during exam season. Student ID required after 10 PM.",
      pinned: false,
      createdAt: new Date(Date.now() - 50 * 3600_000),
    },
  ]);

  /* ------------------- skills & matchmaking dictionary -------------------- */
  const skillEntries = [
    { name: "Next.js", category: "Frontend" },
    { name: "React", category: "Frontend" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "PostgreSQL", category: "Backend" },
    { name: "Drizzle ORM", category: "Backend" },
    { name: "HTML5 Canvas", category: "Game Dev" },
    { name: "Game Physics", category: "Game Dev" },
    { name: "JavaScript", category: "Frontend" },
    { name: "Python", category: "AI & Data" },
    { name: "OpenCV", category: "AI & Data" },
    { name: "Robotics / ROS", category: "Hardware" },
    { name: "Figma", category: "Design" },
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillEntries) {
    const [inserted] = await db
      .insert(skills)
      .values(s)
      .onConflictDoNothing()
      .returning({ id: skills.id });
    if (inserted) {
      skillMap.set(s.name, inserted.id);
    } else {
      const existing = await db.select({ id: skills.id }).from(skills).where(sql`${skills.name} = ${s.name}`).limit(1);
      if (existing[0]) skillMap.set(s.name, existing[0].id);
    }
  }

  // Link demo users to their skills
  if (userIds.length > 0) {
    const defaultUser = userIds[0]; // Anya
    const techUser = userIds[1]; // Aarav
    const toLink = [
      { uid: defaultUser, sName: "Next.js", prof: "Advanced" },
      { uid: defaultUser, sName: "React", prof: "Advanced" },
      { uid: defaultUser, sName: "Tailwind CSS", prof: "Advanced" },
      { uid: defaultUser, sName: "HTML5 Canvas", prof: "Intermediate" },
      { uid: techUser, sName: "Python", prof: "Advanced" },
      { uid: techUser, sName: "Robotics / ROS", prof: "Intermediate" },
    ];
    for (const l of toLink) {
      const sid = skillMap.get(l.sName);
      if (sid) {
        await db.insert(userSkills).values({
          userId: l.uid,
          skillId: sid,
          proficiency: l.prof,
        }).onConflictDoNothing();
      }
    }

    // Seed permanent opportunities & opportunitySkills
    const oppDefs = [
      {
        title: "Front-End Developer Intern",
        company: "Campus Innovation Labs · Block 34",
        type: "Final Year Internship",
        category: "For You",
        stipend: "₹18,000 / mo",
        reqSkills: ["Next.js", "React", "Tailwind CSS"],
      },
      {
        title: "Interactive Web Game Dev",
        company: "Student Tech Hub · Uni-Mall",
        type: "Part-time Gig",
        category: "For You",
        stipend: "₹12,000 / mo",
        reqSkills: ["HTML5 Canvas", "Game Physics", "JavaScript"],
      },
      {
        title: "AI Perception & Robotics Intern",
        company: "Advanced Credit Program · Block 32",
        type: "Summer Research",
        category: "Freshers",
        stipend: "Academic Credits + ₹10,000",
        reqSkills: ["Python", "OpenCV", "Robotics / ROS"],
      },
    ];

    for (const opp of oppDefs) {
      const [newOpp] = await db
        .insert(opportunities)
        .values({
          posterId: teamId,
          title: opp.title,
          company: opp.company,
          type: opp.type,
          stipend: opp.stipend,
          category: opp.category,
          status: "Open",
        })
        .returning({ id: opportunities.id });

      if (newOpp) {
        for (const reqSkillName of opp.reqSkills) {
          const sid = skillMap.get(reqSkillName);
          if (sid) {
            await db.insert(opportunitySkills).values({
              opportunityId: newOpp.id,
              skillId: sid,
            }).onConflictDoNothing();
          }
        }
      }
    }
  }

  void teamId;
}

/** Seed starter conversations for a freshly onboarded student. */
export async function seedStarterChats(newUserId: string) {
  const demos = await db
    .select({ id: users.id, fullName: users.fullName })
    .from(users)
    .where(sql`${users.isDemo} = true`)
    .limit(20);
  if (demos.length < 4) return;

  const team = demos.find((d) => d.fullName === "Quad Team");
  const incomingA = demos.find((d) => d.fullName.startsWith("Aarav"));
  const incomingB = demos.find((d) => d.fullName.startsWith("Meera"));
  const active = demos.find((d) => d.fullName.startsWith("Ishita"));

  if (team) {
    const [s] = await db
      .insert(chatSessions)
      .values({
        initiatorId: team.id,
        receiverId: newUserId,
        status: "accepted",
        mediaUnlocked: true,
        acceptedAt: new Date(),
        timerEndsAt: new Date(Date.now() + 48 * 3600_000),
      })
      .returning({ id: chatSessions.id });
    await db.insert(messages).values([
      {
        sessionId: s.id,
        senderId: team.id,
        kind: "text",
        body: `Welcome to Quad 🎓 Your student status is verified. A few tips: buddy requests stay text-only until the other person accepts, and your Reg ID + phone number are always hidden from others.`,
      },
      {
        sessionId: s.id,
        senderId: team.id,
        kind: "text",
        body: "Tap Campus to find canteens near you, or Buddies to find your people. See you on the quad!",
      },
    ]);
  }

  const mkIncoming = async (fromId: string, intro: string, minsAgo: number) => {
    const [s] = await db
      .insert(chatSessions)
      .values({
        initiatorId: fromId,
        receiverId: newUserId,
        status: "pending",
        timerEndsAt: new Date(Date.now() + 48 * 3600_000 - minsAgo * 60_000),
        createdAt: new Date(Date.now() - minsAgo * 60_000),
      })
      .returning({ id: chatSessions.id });
    await db.insert(messages).values({
      sessionId: s.id,
      senderId: fromId,
      kind: "text",
      body: intro,
    });
  };

  if (incomingA)
    await mkIncoming(
      incomingA.id,
      "Hey! Saw you on the buddy finder — want to join the 6am gym crew this week?",
      42
    );
  if (incomingB)
    await mkIncoming(
      incomingB.id,
      "Hi! We share a few classes right? Happy to exchange notes before the mid-sems 🙂",
      12
    );

  if (active) {
    const [s] = await db
      .insert(chatSessions)
      .values({
        initiatorId: newUserId,
        receiverId: active.id,
        status: "accepted",
        mediaUnlocked: true,
        acceptedAt: new Date(Date.now() - 3600_000),
        timerEndsAt: new Date(Date.now() + 47 * 3600_000),
        createdAt: new Date(Date.now() - 2 * 3600_000),
      })
      .returning({ id: chatSessions.id });
    await db.insert(messages).values([
      {
        sessionId: s.id,
        senderId: newUserId,
        kind: "text",
        body: "Hey! Looking for a study buddy for design history 👋",
      },
      {
        sessionId: s.id,
        senderId: active.id,
        kind: "text",
        body: "Accepted! Yes — library at 5? I have last year's question papers too.",
      },
    ]);
  }
}
