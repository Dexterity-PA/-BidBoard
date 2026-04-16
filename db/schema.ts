import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// pgvector custom type — 1536-dimensional embeddings (Voyage AI voyage-3-lite)
// ---------------------------------------------------------------------------
const vector1536 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    if (typeof value === "string") return JSON.parse(value);
    return value as unknown as number[];
  },
});

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id:                     text("id").primaryKey(),
  email:                  text("email").unique().notNull(),
  firstName:              text("first_name"),
  lastName:               text("last_name"),
  tier:                   text("tier").default("free"),
  stripeCustomerId:       text("stripe_customer_id"),
  stripeSubscriptionId:   text("stripe_subscription_id"),
  applicationGoal:        integer("application_goal").default(50000),
  createdAt:              timestamp("created_at").defaultNow(),
  updatedAt:              timestamp("updated_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// student_profiles
// ---------------------------------------------------------------------------
export const studentProfiles = pgTable(
  "student_profiles",
  {
    id:                   serial("id").primaryKey(),
    userId:               text("user_id").references(() => users.id, { onDelete: "cascade" }),
    zipCode:              text("zip_code"),
    state:                text("state"),
    city:                 text("city"),
    gpa:                  decimal("gpa", { precision: 3, scale: 2 }),
    satScore:             integer("sat_score"),
    actScore:             integer("act_score"),
    gradeLevel:           text("grade_level"),
    intendedMajor:        text("intended_major"),
    careerInterest:       text("career_interest"),
    ethnicity:            text("ethnicity").array(),
    gender:               text("gender"),
    citizenship:          text("citizenship"),
    firstGeneration:      boolean("first_generation").default(false),
    familyIncomeBracket:  text("family_income_bracket"),
    extracurriculars:     text("extracurriculars").array(),
    interests:            text("interests").array(),
    disabilities:         boolean("disabilities").default(false),
    militaryFamily:       boolean("military_family").default(false),
    createdAt:            timestamp("created_at").defaultNow(),
    updatedAt:            timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("student_profiles_user_id_unique").on(t.userId)]
);

// ---------------------------------------------------------------------------
// scholarships
// ---------------------------------------------------------------------------
export const scholarships = pgTable(
  "scholarships",
  {
    id:                       serial("id").primaryKey(),
    name:                     text("name").notNull(),
    provider:                 text("provider").notNull(),
    providerUrl:              text("provider_url"),
    description:              text("description"),
    amountMin:                integer("amount_min"),
    amountMax:                integer("amount_max"),
    amountType:               text("amount_type"),
    deadline:                 date("deadline"),
    isRecurring:              boolean("is_recurring").default(false),
    recurringMonth:           integer("recurring_month"),
    applicationUrl:           text("application_url"),
    eligibleStates:           text("eligible_states").array(),
    eligibleGpaMin:           decimal("eligible_gpa_min", { precision: 3, scale: 2 }),
    eligibleMajors:           text("eligible_majors").array(),
    eligibleEthnicities:      text("eligible_ethnicities").array(),
    eligibleGenders:          text("eligible_genders").array(),
    eligibleGradeLevels:      text("eligible_grade_levels").array(),
    eligibleCitizenship:      text("eligible_citizenship").array(),
    eligibleFirstGen:         boolean("eligible_first_gen"),
    eligibleMilitaryFamily:   boolean("eligible_military_family"),
    eligibleIncomeMax:        text("eligible_income_max"),
    eligibleExtracurriculars: text("eligible_extracurriculars").array(),
    requiresEssay:            boolean("requires_essay").default(false),
    essayPrompt:              text("essay_prompt"),
    essayWordLimit:           integer("essay_word_limit"),
    estimatedApplicants:      integer("estimated_applicants"),
    competitivenessScore:     decimal("competitiveness_score", { precision: 3, scale: 2 }),
    localityLevel:            text("locality_level"),
    essayArchetype:           text("essay_archetype"),
    essayEmbedding:           vector1536("essay_embedding"),
    source:                   text("source"),
    sourceUrl:                text("source_url"),
    isVerified:               boolean("is_verified").default(false),
    lastVerified:             timestamp("last_verified"),
    isActive:                 boolean("is_active").default(true),
    createdAt:                timestamp("created_at").defaultNow(),
    updatedAt:                timestamp("updated_at").defaultNow(),
    essayPrompts:             jsonb("essay_prompts").$type<Array<{ prompt: string; word_limit: number | null }>>(),
    applicationRequirements:  jsonb("application_requirements").$type<string[]>(),
    whatTheyWant:             text("what_they_want"),
    tips:                     jsonb("tips").$type<string[]>(),
    opensDate:                date("opens_date"),
    winnersAnnouncedDate:     date("winners_announced_date"),
    category:                 text("category"),
  },
  (t) => [
    // idx_scholarships_deadline — partial index on active scholarships
    index("idx_scholarships_deadline")
      .on(t.deadline)
      .where(sql`${t.isActive} = TRUE`),
    // GIN indexes for array columns
    index("idx_scholarships_state").using("gin", t.eligibleStates),
    index("idx_scholarships_majors").using("gin", t.eligibleMajors),
    index("idx_scholarships_archetype").on(t.essayArchetype),
  ]
);

// ---------------------------------------------------------------------------
// scholarship_matches
// ---------------------------------------------------------------------------
export const scholarshipMatches = pgTable(
  "scholarship_matches",
  {
    id:             serial("id").primaryKey(),
    userId:         text("user_id").references(() => users.id, { onDelete: "cascade" }),
    scholarshipId:  integer("scholarship_id").references(() => scholarships.id, { onDelete: "cascade" }),
    matchScore:     decimal("match_score", { precision: 5, scale: 2 }),
    evScore:        decimal("ev_score", { precision: 10, scale: 2 }),
    evPerHour:      decimal("ev_per_hour", { precision: 8, scale: 2 }),
    estimatedHours: decimal("estimated_hours", { precision: 4, scale: 1 }),
    isSaved:        boolean("is_saved").default(false),
    isApplied:      boolean("is_applied").default(false),
    isDismissed:    boolean("is_dismissed").default(false),
    createdAt:      timestamp("created_at").defaultNow(),
    updatedAt:      timestamp("updated_at").defaultNow(),
  },
  (t) => [
    uniqueIndex("scholarship_matches_user_scholarship_unique").on(t.userId, t.scholarshipId),
    index("idx_matches_user").on(t.userId),
    index("idx_matches_ev").on(t.userId, t.evPerHour),
  ]
);

// ---------------------------------------------------------------------------
// student_essays
// ---------------------------------------------------------------------------
export const studentEssays = pgTable(
  "student_essays",
  {
    id:           serial("id").primaryKey(),
    userId:       text("user_id").references(() => users.id, { onDelete: "cascade" }),
    title:        text("title"),
    content:      text("content").notNull(),
    prompt:       text("prompt"),
    archetype:    text("archetype"),
    wordCount:    integer("word_count"),
    embedding:    vector1536("embedding"),
    scholarshipId: integer("scholarship_id").references(() => scholarships.id),
    createdAt:    timestamp("created_at").defaultNow(),
    updatedAt:    timestamp("updated_at").defaultNow(),
  },
  (t) => [
    index("idx_essays_user").on(t.userId),
  ]
);

// ---------------------------------------------------------------------------
// essay_clusters
// ---------------------------------------------------------------------------
export const essayClusters = pgTable("essay_clusters", {
  id:             serial("id").primaryKey(),
  archetype:      text("archetype").notNull(),
  label:          text("label").notNull(),
  description:    text("description"),
  examplePrompts: text("example_prompts").array(),
});

// ---------------------------------------------------------------------------
// scraping_sources
// ---------------------------------------------------------------------------
export const scrapingSources = pgTable("scraping_sources", {
  id:              serial("id").primaryKey(),
  name:            text("name").notNull(),
  url:             text("url").notNull(),
  sourceType:      text("source_type"),
  state:           text("state"),
  region:          text("region"),
  scrapeFrequency: text("scrape_frequency").default("weekly"),
  lastScraped:     timestamp("last_scraped"),
  isActive:        boolean("is_active").default(true),
  cssSelectors:    jsonb("css_selectors"),
  notes:           text("notes"),
  createdAt:       timestamp("created_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// deadline_reminders
// ---------------------------------------------------------------------------
export const deadlineReminders = pgTable("deadline_reminders", {
  id:           serial("id").primaryKey(),
  userId:       text("user_id").references(() => users.id, { onDelete: "cascade" }),
  scholarshipId: integer("scholarship_id").references(() => scholarships.id, { onDelete: "cascade" }),
  remindAt:     timestamp("remind_at").notNull(),
  reminderType: text("reminder_type"),
  isSent:       boolean("is_sent").default(false),
  createdAt:    timestamp("created_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// applications  (tracker feature)
// ---------------------------------------------------------------------------
export type StatusHistoryEntry = {
  status: string;
  at: string;   // ISO timestamp
  label: string;
};

export const applications = pgTable(
  "applications",
  {
    id:            serial("id").primaryKey(),
    userId:        text("user_id").notNull(),
    scholarshipId: integer("scholarship_id").notNull().references(() => scholarships.id, { onDelete: "cascade" }),
    status:        text("status").notNull().default("saved"),
    appliedAt:     timestamp("applied_at"),
    deadline:      date("deadline"),
    awardAmount:   integer("award_amount"),
    notes:         text("notes"),
    essayDraftIds: text("essay_draft_ids").array(),
    reminderSent:  boolean("reminder_sent").notNull().default(false),
    statusHistory: jsonb("status_history").notNull().default(sql`'[]'::jsonb`),
    createdAt:     timestamp("created_at").notNull().defaultNow(),
    updatedAt:     timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("applications_user_scholarship_unique").on(t.userId, t.scholarshipId),
    index("idx_applications_user_id").on(t.userId),
  ]
);

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
