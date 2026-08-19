import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull().default("تقنية"),
    location: text("location").notNull().default(""),
    city: text("city").notNull().default(""),
    price: text("price").notNull().default("مجاني"),
    url: text("url").notNull().default(""),
    urlKey: text("url_key").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    // Group/community hosting the event (e.g. "UXawya", "GDG Cairo").
    community: text("community").notNull().default(""),
    // "u:<userId>" for logged-in users, device id for guests.
    ownerDevice: text("owner_device").notNull().default(""),
    merges: integer("merges").notNull().default(0),
    attendeesCount: integer("attendees_count").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    agenda: text("agenda").notNull().default("[]"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("events_starts_at_idx").on(t.startsAt)],
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    // owner key: "u:<userId>" or device id
    device: text("device").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("reservations_event_device_uq").on(t.eventId, t.device)],
);

export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    // owner key: "u:<userId>" or device id
    device: text("device").notNull(),
    beforeMinutes: integer("before_minutes").notNull().default(1440),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("reminders_event_device_uq").on(t.eventId, t.device)],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull().default(""),
    picture: text("picture").notNull().default(""),
    googleId: text("google_id"),
    provider: text("provider").notNull().default("demo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_uq").on(t.email),
    uniqueIndex("users_google_uq").on(t.googleId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    token: text("token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);
