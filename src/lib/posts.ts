import "server-only";

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { unstable_cache } from "next/cache";
import { readingMinutes } from "@/lib/date";
import { slugify } from "@/lib/slug";

export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
};

export type PostInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  body: string;
  tags: string[];
  status: PostStatus;
  publishedAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
};

type Row = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
};

export type PageContent = {
  slug: string;
  kicker: string;
  title: string;
  lede: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

export type PageContentInput = {
  slug: string;
  kicker: string;
  title: string;
  lede: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
};

type PageRow = {
  slug: string;
  kicker: string;
  title: string;
  lede: string;
  body: string;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

type SqliteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): {
    all(...params: unknown[]): Row[] | PageRow[];
    get(...params: unknown[]): unknown;
    run(...params: unknown[]): unknown;
  };
};

type PostgresClient = NeonQueryFunction<false, false>;

let sqliteDb: SqliteDatabase | null = null;
let sqliteInitialized = false;
let pg: PostgresClient | null = null;
let pgInitialized = false;

const clearLaunchPostsMigrationId = "2026-04-30-clear-launch-posts";

const seedPosts: PostInput[] = [];

const seedPages: PageContentInput[] = [
  {
    slug: "about",
    kicker: "About · Hyunmin",
    title: "조용한 화면에 느린 글을 둡니다.",
    lede:
      "hmmhmm은 생활의 리듬, 생각의 변화, 오래 남기고 싶은 문장을 기록하는 개인 블로그입니다. 빠르게 소비되는 글보다 다시 읽을 수 있는 글을 지향합니다.",
    body: [
      "## 쓰는 것",
      "이곳에는 개인 에세이, 일상의 관찰, 도구와 작업 방식에 대한 짧은 기록이 올라옵니다. 검색 유입을 의식하되, 검색을 위해 문장을 과하게 부풀리지 않는 것을 원칙으로 삼습니다.",
      "## 운영 원칙",
      "발행된 글은 필요할 때 고쳐 씁니다. 오래된 글도 맥락이 바뀌면 수정일을 남기고, 더 이상 유효하지 않은 내용은 아카이브하거나 삭제합니다."
    ].join("\n\n"),
    seoTitle: "About",
    seoDescription: "hmmhmm과 글쓴이 Hyunmin에 대하여."
  }
];

const publicDbTimeoutMs = Number(process.env.PUBLIC_DB_TIMEOUT_MS || 1200);

function usePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function databasePath() {
  if (process.env.DATABASE_PATH) {
    return resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH);
  }

  return join(process.cwd(), "data", "blog.sqlite");
}

async function getSqliteDb() {
  if (!sqliteDb) {
    const { DatabaseSync } = await import("node:sqlite");
    const path = databasePath();
    mkdirSync(dirname(path), { recursive: true });
    sqliteDb = new DatabaseSync(path) as unknown as SqliteDatabase;
  }

  if (!sqliteInitialized) {
    sqliteInitialized = true;
    sqliteDb.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL CHECK(status IN ('draft', 'published')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        published_at TEXT,
        seo_title TEXT,
        seo_description TEXT,
        og_image TEXT
      );
      CREATE INDEX IF NOT EXISTS posts_status_published_idx
        ON posts(status, published_at DESC);
      CREATE INDEX IF NOT EXISTS posts_slug_idx
        ON posts(slug);
      CREATE TABLE IF NOT EXISTS pages (
        slug TEXT PRIMARY KEY,
        kicker TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL,
        lede TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        seo_title TEXT,
        seo_description TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_migrations (
        id TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);
    clearLaunchPostsOnceSqlite(sqliteDb);
    await seedSqliteIfEmpty(sqliteDb);
    await seedSqlitePagesIfEmpty(sqliteDb);
  }

  return sqliteDb;
}

async function getPostgres() {
  if (!pg) {
    const { neon } = await import("@neondatabase/serverless");
    pg = neon(process.env.DATABASE_URL!, {
      fetchOptions: {
        cache: "no-store"
      }
    });
  }

  if (!pgInitialized) {
    try {
      await pg`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          excerpt TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          tags TEXT NOT NULL DEFAULT '[]',
          status TEXT NOT NULL CHECK(status IN ('draft', 'published')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          published_at TEXT,
          seo_title TEXT,
          seo_description TEXT,
          og_image TEXT
        )
      `;
      await pg`CREATE INDEX IF NOT EXISTS posts_status_published_idx ON posts(status, published_at DESC)`;
      await pg`CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug)`;
      await pg`
        CREATE TABLE IF NOT EXISTS pages (
          slug TEXT PRIMARY KEY,
          kicker TEXT NOT NULL DEFAULT '',
          title TEXT NOT NULL,
          lede TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          seo_title TEXT,
          seo_description TEXT,
          updated_at TEXT NOT NULL
        )
      `;
      await pg`
        CREATE TABLE IF NOT EXISTS app_migrations (
          id TEXT PRIMARY KEY,
          applied_at TEXT NOT NULL
        )
      `;
      await clearLaunchPostsOncePostgres(pg);
      await seedPostgresIfEmpty(pg);
      await seedPostgresPagesIfEmpty(pg);
      pgInitialized = true;
    } catch (error) {
      pgInitialized = false;
      throw error;
    }
  }

  return pg;
}

function clearLaunchPostsOnceSqlite(database: SqliteDatabase) {
  const applied = database
    .prepare("SELECT id FROM app_migrations WHERE id = ? LIMIT 1")
    .get(clearLaunchPostsMigrationId);
  if (applied) return;

  database.prepare("DELETE FROM posts").run();
  database
    .prepare("INSERT INTO app_migrations (id, applied_at) VALUES (?, ?)")
    .run(clearLaunchPostsMigrationId, new Date().toISOString());
}

async function clearLaunchPostsOncePostgres(sql: PostgresClient) {
  const [applied] = (await sql`SELECT id FROM app_migrations WHERE id = ${clearLaunchPostsMigrationId} LIMIT 1`) as {
    id: string;
  }[];
  if (applied) return;

  await sql`DELETE FROM posts`;
  await sql`INSERT INTO app_migrations (id, applied_at) VALUES (${clearLaunchPostsMigrationId}, ${new Date().toISOString()})`;
}

async function seedSqliteIfEmpty(database: SqliteDatabase) {
  const count = database.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
  if (count.count > 0 || process.env.DISABLE_BLOG_SEED === "true") return;

  for (const post of seedPosts) {
    await upsertSqlitePost(post, database);
  }
}

async function seedPostgresIfEmpty(sql: PostgresClient) {
  const [count] = (await sql`SELECT COUNT(*) as count FROM posts`) as { count: string }[];
  if (Number(count.count) > 0 || process.env.DISABLE_BLOG_SEED === "true") return;

  for (const post of seedPosts) {
    await upsertPostgresPost(post, sql);
  }
}

async function seedSqlitePagesIfEmpty(database: SqliteDatabase) {
  const count = database.prepare("SELECT COUNT(*) as count FROM pages").get() as { count: number };
  if (count.count > 0 || process.env.DISABLE_BLOG_SEED === "true") return;

  for (const page of seedPages) {
    await upsertSqlitePage(page, database);
  }
}

async function seedPostgresPagesIfEmpty(sql: PostgresClient) {
  const [count] = (await sql`SELECT COUNT(*) as count FROM pages`) as { count: string }[];
  if (Number(count.count) > 0 || process.env.DISABLE_BLOG_SEED === "true") return;

  for (const page of seedPages) {
    await upsertPostgresPage(page, sql);
  }
}

function normalizeRow(row: Row): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    tags: JSON.parse(row.tags || "[]"),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    seoTitle: row.seo_title || row.title,
    seoDescription: row.seo_description || row.excerpt,
    ogImage: row.og_image || "/og-default.svg"
  };
}

function normalizePageRow(row: PageRow): PageContent {
  return {
    slug: row.slug,
    kicker: row.kicker,
    title: row.title,
    lede: row.lede,
    body: row.body,
    seoTitle: row.seo_title || row.title,
    seoDescription: row.seo_description || row.lede,
    updatedAt: row.updated_at
  };
}

function fallbackPost(input: PostInput): Post {
  const timestamp = input.publishedAt || new Date().toISOString();
  return {
    id: input.id || input.slug || input.title,
    title: input.title,
    slug: input.slug || slugify(input.title),
    excerpt: input.excerpt,
    body: input.body,
    tags: input.tags,
    status: input.status,
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: input.publishedAt || timestamp,
    seoTitle: input.seoTitle || input.title,
    seoDescription: input.seoDescription || input.excerpt,
    ogImage: input.ogImage || "/og-default.svg"
  };
}

function fallbackPublishedPosts() {
  return seedPosts.filter((post) => post.status === "published").map(fallbackPost);
}

function fallbackPageContent(slug: string) {
  const page = seedPages.find((page) => page.slug === slug);
  if (!page) return null;
  return {
    ...page,
    seoTitle: page.seoTitle || page.title,
    seoDescription: page.seoDescription || page.lede,
    updatedAt: new Date().toISOString()
  };
}

export function getTagCounts(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag, "ko"));
}

export function getArchivesFromPosts(posts: Post[], category?: string | null) {
  const groups = new Map<string, Post[]>();
  const filtered = category ? posts.filter((post) => post.tags.includes(decodeURIComponent(category))) : posts;

  for (const post of filtered) {
    const key = (post.publishedAt || post.updatedAt).slice(0, 7);
    groups.set(key, [...(groups.get(key) || []), post]);
  }
  return Array.from(groups.entries()).map(([month, posts]) => ({ month, posts }));
}

async function publicFallback<T>(label: string, fallback: T, load: () => Promise<T>) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      load(),
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => resolve(fallback), publicDbTimeoutMs);
      })
    ]);
  } catch (error) {
    console.error(`Public content fallback used for ${label}`, error);
    pgInitialized = false;
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function ensureUniqueSlug(base: string, currentId?: string) {
  let candidate = base;
  let index = 2;

  while (true) {
    let row: { id: string } | undefined;

    if (usePostgres()) {
      const db = await getPostgres();
      row = (await db`SELECT id FROM posts WHERE slug = ${candidate} LIMIT 1`)[0] as { id: string } | undefined;
    } else {
      row = (await getSqliteDb()).prepare("SELECT id FROM posts WHERE slug = ? LIMIT 1").get(candidate) as
        | { id: string }
        | undefined;
    }

    if (!row || row.id === currentId) return candidate;
    candidate = `${base}-${index}`;
    index += 1;
  }
}

async function cleanInput(input: PostInput) {
  const now = new Date().toISOString();
  const title = input.title.trim() || "제목 없는 글";
  const baseSlug = slugify(input.slug?.trim() || title);
  const id = input.id || randomUUID();
  const status = input.status === "published" ? "published" : "draft";
  const tags = input.tags.map((tag) => tag.trim()).filter(Boolean);
  const publishedAt = status === "published" ? input.publishedAt || now : null;

  return {
    id,
    title,
    slug: await ensureUniqueSlug(baseSlug, id),
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    tags,
    status,
    publishedAt,
    seoTitle: input.seoTitle?.trim() || title,
    seoDescription: input.seoDescription?.trim() || input.excerpt.trim(),
    ogImage: input.ogImage?.trim() || "/og-default.svg",
    now
  };
}

async function upsertSqlitePost(input: PostInput, database?: SqliteDatabase) {
  const db = database || (await getSqliteDb());
  const post = await cleanInput(input);
  const existing = db.prepare("SELECT created_at FROM posts WHERE id = ? LIMIT 1").get(post.id) as
    | { created_at: string }
    | undefined;

  db.prepare(`
    INSERT INTO posts (
      id, title, slug, excerpt, body, tags, status,
      created_at, updated_at, published_at, seo_title, seo_description, og_image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      slug = excluded.slug,
      excerpt = excluded.excerpt,
      body = excluded.body,
      tags = excluded.tags,
      status = excluded.status,
      updated_at = excluded.updated_at,
      published_at = excluded.published_at,
      seo_title = excluded.seo_title,
      seo_description = excluded.seo_description,
      og_image = excluded.og_image
  `).run(
    post.id,
    post.title,
    post.slug,
    post.excerpt,
    post.body,
    JSON.stringify(post.tags),
    post.status,
    existing?.created_at || post.now,
    post.now,
    post.publishedAt,
    post.seoTitle,
    post.seoDescription,
    post.ogImage
  );

  return (await getPostById(post.id))!;
}

async function upsertPostgresPost(input: PostInput, sql?: PostgresClient) {
  const db = sql || (await getPostgres());
  const post = await cleanInput(input);

  const [row] = (await db`
    INSERT INTO posts (
      id, title, slug, excerpt, body, tags, status,
      created_at, updated_at, published_at, seo_title, seo_description, og_image
    ) VALUES (
      ${post.id}, ${post.title}, ${post.slug}, ${post.excerpt}, ${post.body},
      ${JSON.stringify(post.tags)}, ${post.status}, ${post.now}, ${post.now},
      ${post.publishedAt}, ${post.seoTitle}, ${post.seoDescription}, ${post.ogImage}
    )
    ON CONFLICT(id) DO UPDATE SET
      title = EXCLUDED.title,
      slug = EXCLUDED.slug,
      excerpt = EXCLUDED.excerpt,
      body = EXCLUDED.body,
      tags = EXCLUDED.tags,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at,
      published_at = EXCLUDED.published_at,
      seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description,
      og_image = EXCLUDED.og_image
    RETURNING *
  `) as Row[];

  return normalizeRow(row);
}

export async function upsertPost(input: PostInput) {
  return usePostgres() ? upsertPostgresPost(input) : upsertSqlitePost(input);
}

export async function getAllPosts() {
  let rows: Row[];
  if (usePostgres()) {
    const db = await getPostgres();
    rows = (await db`SELECT * FROM posts ORDER BY COALESCE(published_at, updated_at) DESC`) as Row[];
  } else {
    rows = (await getSqliteDb())
      .prepare("SELECT * FROM posts ORDER BY COALESCE(published_at, updated_at) DESC")
      .all() as Row[];
  }
  return rows.map(normalizeRow);
}

export async function getPublishedPosts() {
  let rows: Row[];
  if (usePostgres()) {
    const db = await getPostgres();
    rows = (await db`SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC`) as Row[];
  } else {
    rows = (await getSqliteDb())
      .prepare("SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC")
      .all() as Row[];
  }
  return rows.map(normalizeRow);
}

export async function getPostBySlug(slug: string) {
  let row: Row | undefined;
  if (usePostgres()) {
    const db = await getPostgres();
    row = (await db`SELECT * FROM posts WHERE slug = ${slug} AND status = 'published' LIMIT 1`)[0] as
      | Row
      | undefined;
  } else {
    row = (await getSqliteDb())
      .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published' LIMIT 1")
      .get(slug) as Row | undefined;
  }
  return row ? normalizeRow(row) : null;
}

export async function getPostById(id: string) {
  let row: Row | undefined;
  if (usePostgres()) {
    const db = await getPostgres();
    row = (await db`SELECT * FROM posts WHERE id = ${id} LIMIT 1`)[0] as Row | undefined;
  } else {
    row = (await getSqliteDb()).prepare("SELECT * FROM posts WHERE id = ? LIMIT 1").get(id) as Row | undefined;
  }
  return row ? normalizeRow(row) : null;
}

export async function deletePost(id: string) {
  if (usePostgres()) {
    const db = await getPostgres();
    await db`DELETE FROM posts WHERE id = ${id}`;
  } else {
    (await getSqliteDb()).prepare("DELETE FROM posts WHERE id = ?").run(id);
  }
}

export async function getPublishedTags() {
  return getTagCounts(await getPublishedPosts());
}

export async function getAllCategories() {
  return getTagCounts(await getAllPosts());
}

export async function getPostsByTag(tag: string) {
  return (await getPublishedPosts()).filter((post) => post.tags.includes(decodeURIComponent(tag)));
}

export async function getArchives(category?: string | null) {
  return getArchivesFromPosts(await getPublishedPosts(), category);
}

const getCachedPublishedPosts = unstable_cache(
  async () => getPublishedPosts(),
  ["public-published-posts", clearLaunchPostsMigrationId],
  {
    revalidate: 300,
    tags: ["public-posts"]
  }
);

const getCachedPageContent = unstable_cache(async (slug: string) => getPageContent(slug), ["public-page-content"], {
  revalidate: 300,
  tags: ["public-pages"]
});

export async function getPublicPublishedPosts() {
  return publicFallback("published posts", fallbackPublishedPosts(), getCachedPublishedPosts);
}

export async function getPublicPublishedTags() {
  return getTagCounts(await getPublicPublishedPosts());
}

export async function getPublicPostsByTag(tag: string) {
  const fallback = fallbackPublishedPosts().filter((post) => post.tags.includes(decodeURIComponent(tag)));
  const posts = await getPublicPublishedPosts();
  return posts.filter((post) => post.tags.includes(decodeURIComponent(tag))) || fallback;
}

export async function getPublicPostBySlug(slug: string) {
  const fallback = fallbackPublishedPosts().find((post) => post.slug === decodeURIComponent(slug)) || null;
  const posts = await getPublicPublishedPosts();
  return posts.find((post) => post.slug === decodeURIComponent(slug)) || fallback;
}

export async function getPublicArchives(category?: string | null) {
  return getArchivesFromPosts(await getPublicPublishedPosts(), category);
}

async function upsertSqlitePage(input: PageContentInput, database?: SqliteDatabase) {
  const db = database || (await getSqliteDb());
  const now = new Date().toISOString();
  const title = input.title.trim() || "Untitled";
  const lede = input.lede.trim();

  db.prepare(`
    INSERT INTO pages (
      slug, kicker, title, lede, body, seo_title, seo_description, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      kicker = excluded.kicker,
      title = excluded.title,
      lede = excluded.lede,
      body = excluded.body,
      seo_title = excluded.seo_title,
      seo_description = excluded.seo_description,
      updated_at = excluded.updated_at
  `).run(
    input.slug,
    input.kicker.trim(),
    title,
    lede,
    input.body.trim(),
    input.seoTitle?.trim() || title,
    input.seoDescription?.trim() || lede,
    now
  );

  return (await getPageContent(input.slug))!;
}

async function upsertPostgresPage(input: PageContentInput, sql?: PostgresClient) {
  const db = sql || (await getPostgres());
  const now = new Date().toISOString();
  const title = input.title.trim() || "Untitled";
  const lede = input.lede.trim();
  const [row] = (await db`
    INSERT INTO pages (
      slug, kicker, title, lede, body, seo_title, seo_description, updated_at
    ) VALUES (
      ${input.slug}, ${input.kicker.trim()}, ${title}, ${lede}, ${input.body.trim()},
      ${input.seoTitle?.trim() || title}, ${input.seoDescription?.trim() || lede}, ${now}
    )
    ON CONFLICT(slug) DO UPDATE SET
      kicker = EXCLUDED.kicker,
      title = EXCLUDED.title,
      lede = EXCLUDED.lede,
      body = EXCLUDED.body,
      seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `) as PageRow[];

  return normalizePageRow(row);
}

export async function getPageContent(slug: string) {
  let row: PageRow | undefined;
  if (usePostgres()) {
    const db = await getPostgres();
    row = (await db`SELECT * FROM pages WHERE slug = ${slug} LIMIT 1`)[0] as PageRow | undefined;
  } else {
    row = (await getSqliteDb()).prepare("SELECT * FROM pages WHERE slug = ? LIMIT 1").get(slug) as
      | PageRow
      | undefined;
  }

  return row ? normalizePageRow(row) : null;
}

export async function getPublicPageContent(slug: string) {
  return publicFallback("page content", fallbackPageContent(slug), () => getCachedPageContent(slug));
}

export async function upsertPageContent(input: PageContentInput) {
  return usePostgres() ? upsertPostgresPage(input) : upsertSqlitePage(input);
}

export function pageToFormInput(formData: FormData): PageContentInput {
  return {
    slug: String(formData.get("slug") || "about"),
    kicker: String(formData.get("kicker") || ""),
    title: String(formData.get("title") || ""),
    lede: String(formData.get("lede") || ""),
    body: String(formData.get("body") || ""),
    seoTitle: String(formData.get("seoTitle") || ""),
    seoDescription: String(formData.get("seoDescription") || "")
  };
}

export function postToFormInput(formData: FormData): PostInput {
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const intent = String(formData.get("intent") || "save");
  const status = intent === "publish" ? "published" : String(formData.get("status") || "draft");
  const publishedAtRaw = String(formData.get("publishedAt") || "").trim();

  return {
    id: String(formData.get("id") || "") || undefined,
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    tags,
    status: status === "published" ? "published" : "draft",
    publishedAt: publishedAtRaw ? new Date(publishedAtRaw).toISOString() : null,
    seoTitle: String(formData.get("seoTitle") || ""),
    seoDescription: String(formData.get("seoDescription") || ""),
    ogImage: String(formData.get("ogImage") || "")
  };
}

export function postMetrics(posts: Post[]) {
  return {
    published: posts.filter((post) => post.status === "published").length,
    draft: posts.filter((post) => post.status === "draft").length,
    total: posts.length,
    chars: posts.reduce((sum, post) => sum + post.body.length, 0),
    readMinutes: posts.reduce((sum, post) => sum + readingMinutes(post.body), 0)
  };
}
