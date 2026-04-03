import { pgTable, serial, text, timestamp, varchar, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("users_username_idx").on(table.username),
  ]
);

// 博客文章表
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    content: text("content").notNull(),
    author: varchar("author", { length: 50 }).notNull().default("恋爱研究所"),
    tags: varchar("tags", { length: 200 }),
    read_time: varchar("read_time", { length: 10 }).default("3分钟"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("blog_posts_created_at_idx").on(table.created_at),
  ]
);
