import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*                                1. TYPE ENUMS                               */
/* -------------------------------------------------------------------------- */

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say",
]);

export const chatStatusEnum = pgEnum("chat_status", [
  "pending",
  "accepted",
  "expired",
  "declined",
]);

export const messageKindEnum = pgEnum("message_kind", [
  "text",
  "image",
  "voice",
  "system",
]);

export const reportCategoryEnum = pgEnum("report_category", [
  "harassment",
  "fake_profile",
  "spam",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewed",
  "actioned",
]);

/* -------------------------------------------------------------------------- */
/*                        2. USERS & AUTHENTICATION                           */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    regId: varchar("reg_id", { length: 32 }).notNull().unique(),
    email: varchar("email", { length: 180 }).notNull().unique(),
    mobile: varchar("mobile", { length: 20 }).notNull().unique(),
    gender: genderEnum("gender").notNull(),
    course: varchar("course", { length: 80 }).notNull(),
    academicYear: integer("academic_year").notNull(),
    interests: jsonb("interests").$type<string[]>().notNull().default([]),
    lookingFor: varchar("looking_for", { length: 60 }),
    avatarHue: integer("avatar_hue").notNull().default(140),
    visible: boolean("visible").notNull().default(true),
    isDemo: boolean("is_demo").notNull().default(false),
    isRestricted: boolean("is_restricted").notNull().default(false),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)]
);

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: varchar("identifier", { length: 180 }).notNull(),
    kind: varchar("kind", { length: 10 }).notNull(), // "mobile" | "email"
    code: varchar("code", { length: 6 }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("otp_identifier_idx").on(t.identifier)]
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 64 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("auth_sessions_token_idx").on(t.token)]
);

/* -------------------------------------------------------------------------- */
/*                              3. CHAT SYSTEM                                */
/* -------------------------------------------------------------------------- */

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    initiatorId: uuid("initiator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: chatStatusEnum("status").notNull().default("pending"),
    mediaUnlocked: boolean("media_unlocked").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    timerEndsAt: timestamp("timer_ends_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    expiredAt: timestamp("expired_at", { withTimezone: true }),
    waivedAt: timestamp("waived_at", { withTimezone: true }),
    initiatorLastRead: timestamp("initiator_last_read", {
      withTimezone: true,
    }).defaultNow(),
    receiverLastRead: timestamp("receiver_last_read", {
      withTimezone: true,
    }).defaultNow(),
  },
  (t) => [
    index("chat_initiator_idx").on(t.initiatorId),
    index("chat_receiver_idx").on(t.receiverId),
    index("chat_status_idx").on(t.status),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").references(() => users.id, {
      onDelete: "set null",
    }),
    kind: messageKindEnum("kind").notNull().default("text"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("messages_session_idx").on(t.sessionId)]
);

/* -------------------------------------------------------------------------- */
/*                          4. CAMPUS LIFE & EVENTS                           */
/* -------------------------------------------------------------------------- */

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 140 }).notNull(),
  description: text("description").notNull().default(""),
  location: varchar("location", { length: 120 }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  tag: varchar("tag", { length: 40 }).notNull().default("meetup"),
  image: text("image").notNull().default(""),
});

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wantsBuddy: boolean("wants_buddy").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("rsvp_unique_idx").on(t.eventId, t.userId)]
);

/* -------------------------------------------------------------------------- */
/*                       5. VENDORS, FOOD & REVIEWS                           */
/* -------------------------------------------------------------------------- */

export const places = pgTable("places", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull(), // "food" | "academic" | "housing"
  x: real("x").notNull(),
  y: real("y").notNull(),
});

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id").references(() => places.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 120 }).notNull(),
  blurb: text("blurb").notNull().default(""),
  isOpen: boolean("is_open").notNull().default(true),
  image: text("image").notNull().default(""),
  topDish: varchar("top_dish", { length: 120 }),
  x: real("x").notNull().default(50),
  y: real("y").notNull().default(50),
  menu: jsonb("menu")
    .$type<{ item: string; price: string; veg: boolean }[]>()
    .notNull()
    .default([]),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("reviews_vendor_idx").on(t.vendorId)]
);

/* -------------------------------------------------------------------------- */
/*                     6. MODERATION, SAFETY & REPORTS                        */
/* -------------------------------------------------------------------------- */

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reportedId: uuid("reported_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: reportCategoryEnum("category").notNull(),
    details: text("details").notNull().default(""),
    evidenceUrl: text("evidence_url").notNull(),
    status: reportStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("reports_reporter_idx").on(t.reporterId)]
);

export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("block_pair_idx").on(t.blockerId, t.blockedId)]
);

/* -------------------------------------------------------------------------- */
/*                      7. BROADCASTS & ANNOUNCEMENTS                         */
/* -------------------------------------------------------------------------- */

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*                 8. SKILLS, BEACONS & INTERNSHIPS / GIGS                    */
/* -------------------------------------------------------------------------- */

// Global Skills Taxonomy
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // e.g. "Next.js", "AI Perception", "Robotics"
  category: text("category").notNull(), // "Frontend", "Hardware", "Design", "AI & Data"
});

// User Skills (Many-to-Many Junction)
export const userSkills = pgTable(
  "user_skills",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    proficiency: text("proficiency").notNull().default("Intermediate"), // "Beginner", "Intermediate", "Advanced"
  },
  (t) => [primaryKey({ columns: [t.userId, t.skillId] })]
);

// Live Map Beacons (Tied to Users)
export const mapBeacons = pgTable(
  "map_beacons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type").notNull(), // "Skill Offer" or "Gig/Opportunity"
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("map_beacons_creator_idx").on(t.creatorId),
    index("map_beacons_expires_at_idx").on(t.expiresAt),
  ]
);

// Permanent Internships & Career Opportunities
export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    posterId: uuid("poster_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    company: text("company").notNull(),
    type: text("type").notNull(), // "Final Year Internship", "Part-Time", "Summer Research"
    stipend: text("stipend").notNull().default("Unpaid / Credits"),
    category: text("category").notNull().default("For You"), // "For You", "Freshers", "All Campus"
    status: text("status").notNull().default("Open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("opportunities_status_idx").on(t.status),
    index("opportunities_category_idx").on(t.category),
    index("opportunities_poster_idx").on(t.posterId),
  ]
);

// Opportunity Requirements (Many-to-Many Junction)
export const opportunitySkills = pgTable(
  "opportunity_skills",
  {
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.opportunityId, t.skillId] }),
    index("opp_skills_skill_idx").on(t.skillId),
  ]
);

// Student Applications for Internships & Opportunities
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicantId: uuid("applicant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("Pending"), // "Pending", "Accepted", "Rejected"
    appliedAt: timestamp("applied_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("unique_applicant_opportunity_idx").on(t.applicantId, t.opportunityId),
    index("applications_applicant_idx").on(t.applicantId),
    index("applications_opportunity_idx").on(t.opportunityId),
  ]
);

/* -------------------------------------------------------------------------- */
/*                         9. RELATIONAL DEFINITIONS                          */
/* -------------------------------------------------------------------------- */

export const usersRelations = relations(users, ({ many }) => ({
  skills: many(userSkills),
  beacons: many(mapBeacons),
  applications: many(applications),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
  opportunitySkills: many(opportunitySkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const mapBeaconsRelations = relations(mapBeacons, ({ one }) => ({
  creator: one(users, {
    fields: [mapBeacons.creatorId],
    references: [users.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  poster: one(users, {
    fields: [opportunities.posterId],
    references: [users.id],
  }),
  requiredSkills: many(opportunitySkills),
  applications: many(applications),
}));

export const opportunitySkillsRelations = relations(opportunitySkills, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [opportunitySkills.opportunityId],
    references: [opportunities.id],
  }),
  skill: one(skills, {
    fields: [opportunitySkills.skillId],
    references: [skills.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
  }),
  opportunity: one(opportunities, {
    fields: [applications.opportunityId],
    references: [opportunities.id],
  }),
}));

/* -------------------------------------------------------------------------- */
/*                     10. INFERRED TYPESCRIPT INTERFACES                     */
/* -------------------------------------------------------------------------- */

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type OtpCode = InferSelectModel<typeof otpCodes>;
export type NewOtpCode = InferInsertModel<typeof otpCodes>;

export type AuthSession = InferSelectModel<typeof authSessions>;
export type NewAuthSession = InferInsertModel<typeof authSessions>;

export type ChatSession = InferSelectModel<typeof chatSessions>;
export type NewChatSession = InferInsertModel<typeof chatSessions>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

export type EventRsvp = InferSelectModel<typeof eventRsvps>;
export type NewEventRsvp = InferInsertModel<typeof eventRsvps>;

export type Place = InferSelectModel<typeof places>;
export type NewPlace = InferInsertModel<typeof places>;

export type Vendor = InferSelectModel<typeof vendors>;
export type NewVendor = InferInsertModel<typeof vendors>;

export type Review = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;

export type Report = InferSelectModel<typeof reports>;
export type NewReport = InferInsertModel<typeof reports>;

export type Block = InferSelectModel<typeof blocks>;
export type NewBlock = InferInsertModel<typeof blocks>;

export type Announcement = InferSelectModel<typeof announcements>;
export type NewAnnouncement = InferInsertModel<typeof announcements>;

export type Skill = InferSelectModel<typeof skills>;
export type NewSkill = InferInsertModel<typeof skills>;

export type UserSkill = InferSelectModel<typeof userSkills>;
export type NewUserSkill = InferInsertModel<typeof userSkills>;

export type MapBeacon = InferSelectModel<typeof mapBeacons>;
export type NewMapBeacon = InferInsertModel<typeof mapBeacons>;

export type Opportunity = InferSelectModel<typeof opportunities>;
export type NewOpportunity = InferInsertModel<typeof opportunities>;

export type OpportunitySkill = InferSelectModel<typeof opportunitySkills>;
export type NewOpportunitySkill = InferInsertModel<typeof opportunitySkills>;

export type Application = InferSelectModel<typeof applications>;
export type NewApplication = InferInsertModel<typeof applications>;
