import "server-only";

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Sql } from "postgres";
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

let sqliteDb: SqliteDatabase | null = null;
let sqliteInitialized = false;
let pg: Sql | null = null;
let pgInitialized = false;

const seedPosts: PostInput[] = [
  {
    title: "고요한 화면을 오래 바라보는 일",
    slug: "quiet-screen",
    excerpt: "블로그를 다시 만든다는 것은 결국 내가 오래 머물 수 있는 방을 짓는 일에 가깝다.",
    body: [
      "새 블로그를 만든다는 말은 조금 거창하지만, 실제로는 책상 위를 비우는 일과 닮았다.",
      "읽히기 위해 쓰는 글과, 잊지 않기 위해 쓰는 글 사이에는 아주 얇은 선이 있다. 나는 그 선을 자주 오간다. 너무 설명적인 글은 금방 지치고, 너무 닫힌 글은 오래 남지 않는다.",
      "그래서 이곳은 조금 느리게 운영하려고 한다. 단정한 화면, 긴 호흡의 문장, 그리고 필요할 때만 드러나는 기능들. 조용한 도구가 오래 쓰인다는 믿음으로."
    ].join("\n\n"),
    tags: ["에세이", "기록"],
    status: "published",
    publishedAt: "2026-04-21T09:00:00.000Z",
    seoTitle: "고요한 화면을 오래 바라보는 일",
    seoDescription: "개인 블로그를 다시 만들며 생각한 글쓰기, 화면, 기록의 감각.",
    ogImage: "/og-default.svg"
  },
  {
    title: "사소한 루틴이 하루의 모양을 바꿀 때",
    slug: "small-routines",
    excerpt: "큰 결심보다 작은 반복이 더 오래 남는다는 사실을 자주 배운다.",
    body: [
      "하루를 크게 바꾸는 일은 드물다. 대신 사소한 루틴이 조금씩 방향을 바꾼다.",
      "아침에 물을 마시는 일, 오늘 할 일을 세 줄로만 적는 일, 잠들기 전 화면 밝기를 낮추는 일. 이런 것들은 성취라고 부르기엔 작지만, 무너진 리듬을 되돌리는 데에는 꽤 강하다.",
      "나는 생산성이라는 단어보다 리듬이라는 단어를 더 믿는다. 리듬은 사람을 몰아붙이지 않는다. 다만 다시 돌아올 자리를 만들어준다."
    ].join("\n\n"),
    tags: ["에세이", "생활"],
    status: "published",
    publishedAt: "2026-04-14T09:00:00.000Z",
    seoTitle: "사소한 루틴이 하루의 모양을 바꿀 때",
    seoDescription: "작은 반복과 생활의 리듬에 관한 개인 에세이.",
    ogImage: "/og-default.svg"
  },
  {
    title: "기록은 나중의 나에게 보내는 메모",
    slug: "notes-to-later-self",
    excerpt: "지금의 감각은 생각보다 빨리 사라진다. 그래서 적어둔다.",
    body: [
      "기록은 대단한 아카이브가 아니라, 나중의 나에게 보내는 짧은 메모에 가깝다.",
      "그때 왜 그런 선택을 했는지, 무엇이 마음에 걸렸는지, 어떤 문장이 오래 남았는지. 시간이 지나면 결과만 남고 맥락은 사라진다.",
      "글은 그 사라지는 맥락을 조금 붙잡아준다. 완벽하지 않아도 된다. 정확하지 않은 기록보다 없는 기록이 더 쉽게 잊힌다."
    ].join("\n\n"),
    tags: ["기록", "생각"],
    status: "published",
    publishedAt: "2026-04-02T09:00:00.000Z",
    seoTitle: "기록은 나중의 나에게 보내는 메모",
    seoDescription: "기록의 쓸모와 시간이 지나 사라지는 맥락에 관한 글.",
    ogImage: "/og-default.svg"
  },
  {
    title: "아직 발행하지 않은 문장",
    slug: "draft-sentence",
    excerpt: "초안은 공개되지 않지만 관리자 CMS 확인을 위해 남겨둔 글입니다.",
    body: "초안 상태의 글입니다. 관리자 화면에서 수정하거나 발행할 수 있습니다.",
    tags: ["초안"],
    status: "draft",
    publishedAt: null,
    seoTitle: "아직 발행하지 않은 문장",
    seoDescription: "관리자 CMS 확인용 초안입니다.",
    ogImage: "/og-default.svg"
  }
];

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
    `);
    await seedSqliteIfEmpty(sqliteDb);
    await seedSqlitePagesIfEmpty(sqliteDb);
  }

  return sqliteDb;
}

async function getPostgres() {
  if (!pg) {
    const postgres = (await import("postgres")).default;
    pg = postgres(process.env.DATABASE_URL!, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10
    });
  }

  if (!pgInitialized) {
    pgInitialized = true;
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
    await seedPostgresIfEmpty(pg);
    await seedPostgresPagesIfEmpty(pg);
  }

  return pg;
}

async function seedSqliteIfEmpty(database: SqliteDatabase) {
  const count = database.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
  if (count.count > 0 || process.env.DISABLE_BLOG_SEED === "true") return;

  for (const post of seedPosts) {
    await upsertSqlitePost(post, database);
  }
}

async function seedPostgresIfEmpty(sql: Sql) {
  const [count] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM posts`;
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

async function seedPostgresPagesIfEmpty(sql: Sql) {
  const [count] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM pages`;
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

async function ensureUniqueSlug(base: string, currentId?: string) {
  let candidate = base;
  let index = 2;

  while (true) {
    const row = usePostgres()
      ? ((await (await getPostgres())`SELECT id FROM posts WHERE slug = ${candidate} LIMIT 1`)[0] as { id: string } | undefined)
      : ((await getSqliteDb()).prepare("SELECT id FROM posts WHERE slug = ? LIMIT 1").get(candidate) as
          | { id: string }
          | undefined);

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

async function upsertPostgresPost(input: PostInput, sql?: Sql) {
  const db = sql || (await getPostgres());
  const post = await cleanInput(input);

  const [row] = await db<Row[]>`
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
  `;

  return normalizeRow(row);
}

export async function upsertPost(input: PostInput) {
  return usePostgres() ? upsertPostgresPost(input) : upsertSqlitePost(input);
}

export async function getAllPosts() {
  const rows = usePostgres()
    ? ((await (await getPostgres())`SELECT * FROM posts ORDER BY COALESCE(published_at, updated_at) DESC`) as Row[])
    : ((await getSqliteDb())
        .prepare("SELECT * FROM posts ORDER BY COALESCE(published_at, updated_at) DESC")
        .all() as Row[]);
  return rows.map(normalizeRow);
}

export async function getPublishedPosts() {
  const rows = usePostgres()
    ? ((await (await getPostgres())`SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC`) as Row[])
    : ((await getSqliteDb())
        .prepare("SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC")
        .all() as Row[]);
  return rows.map(normalizeRow);
}

export async function getPostBySlug(slug: string) {
  const row = usePostgres()
    ? ((await (await getPostgres())`SELECT * FROM posts WHERE slug = ${slug} AND status = 'published' LIMIT 1`)[0] as
        | Row
        | undefined)
    : ((await getSqliteDb())
        .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published' LIMIT 1")
        .get(slug) as Row | undefined);
  return row ? normalizeRow(row) : null;
}

export async function getPostById(id: string) {
  const row = usePostgres()
    ? ((await (await getPostgres())`SELECT * FROM posts WHERE id = ${id} LIMIT 1`)[0] as Row | undefined)
    : ((await getSqliteDb()).prepare("SELECT * FROM posts WHERE id = ? LIMIT 1").get(id) as Row | undefined);
  return row ? normalizeRow(row) : null;
}

export async function deletePost(id: string) {
  if (usePostgres()) {
    await (await getPostgres())`DELETE FROM posts WHERE id = ${id}`;
  } else {
    (await getSqliteDb()).prepare("DELETE FROM posts WHERE id = ?").run(id);
  }
}

export async function getPublishedTags() {
  const counts = new Map<string, number>();
  for (const post of await getPublishedPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag, "ko"));
}

export async function getAllCategories() {
  const counts = new Map<string, number>();
  for (const post of await getAllPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag, "ko"));
}

export async function getPostsByTag(tag: string) {
  return (await getPublishedPosts()).filter((post) => post.tags.includes(decodeURIComponent(tag)));
}

export async function getArchives(category?: string | null) {
  const groups = new Map<string, Post[]>();
  const posts = category
    ? (await getPublishedPosts()).filter((post) => post.tags.includes(decodeURIComponent(category)))
    : await getPublishedPosts();

  for (const post of posts) {
    const key = (post.publishedAt || post.updatedAt).slice(0, 7);
    groups.set(key, [...(groups.get(key) || []), post]);
  }
  return Array.from(groups.entries()).map(([month, posts]) => ({ month, posts }));
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

async function upsertPostgresPage(input: PageContentInput, sql?: Sql) {
  const db = sql || (await getPostgres());
  const now = new Date().toISOString();
  const title = input.title.trim() || "Untitled";
  const lede = input.lede.trim();
  const [row] = await db<PageRow[]>`
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
  `;

  return normalizePageRow(row);
}

export async function getPageContent(slug: string) {
  const row = usePostgres()
    ? ((await (await getPostgres())`SELECT * FROM pages WHERE slug = ${slug} LIMIT 1`)[0] as PageRow | undefined)
    : ((await getSqliteDb()).prepare("SELECT * FROM pages WHERE slug = ? LIMIT 1").get(slug) as PageRow | undefined);

  return row ? normalizePageRow(row) : null;
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
