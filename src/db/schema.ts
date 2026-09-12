import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ---------------------------------- enums --------------------------------- */

export const genderEnum = pgEnum("gender", ["male", "female", "non_binary"]);
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

/* ---------------------------------- users --------------------------------- */

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
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)]
);

/* ------------------------------- auth tables ------------------------------ */

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

/* ------------------------------- chat system ------------------------------ */

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

/* --------------------------------- events --------------------------------- */

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

/* --------------------------- vendors & directory -------------------------- */

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

/* ------------------------------ moderation -------------------------------- */

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

/* ------------------------------ announcements ----------------------------- */

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
