import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', { id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(), emailVerified: boolean('emailVerified').notNull().default(false), image: text('image'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow() })
export const session = pgTable('session', { id: text('id').primaryKey(), expiresAt: timestamp('expiresAt').notNull(), token: text('token').notNull().unique(), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(), ipAddress: text('ipAddress'), userAgent: text('userAgent'), userId: text('userId').notNull() })
export const account = pgTable('account', { id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(), userId: text('userId').notNull(), accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt'), refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'), scope: text('scope'), password: text('password'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow() })
export const verification = pgTable('verification', { id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: timestamp('expiresAt').notNull(), createdAt: timestamp('createdAt').defaultNow(), updatedAt: timestamp('updatedAt').defaultNow() })
export const scripts = pgTable('scripts', { id: text('id').primaryKey(), ownerId: text('ownerId').notNull(), title: text('title').notNull(), slug: text('slug').notNull().unique(), source: text('source').notNull(), visibility: text('visibility').notNull(), version: text('version').notNull().default('v1.0.0'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(), loadstring: text('loadstring').notNull(), image: text('image'), obfuscated: text('obfuscated'), obfStatus: text('obf_status'), obfJobId: text('obf_job_id'), obfError: text('obf_error') })
export const vaultFolders = pgTable('vault_folders', { id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), title: text('title').notNull(), description: text('description'), createdAt: timestamp('created_at').notNull().defaultNow() })
export const vaultFiles = pgTable('vault_files', { id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), folderId: text('folder_id'), title: text('title').notNull(), description: text('description'), content: text('content').notNull(), ext: text('ext').notNull(), createdAt: timestamp('created_at').notNull().defaultNow() })

export type Script = typeof scripts.$inferSelect
export type NewScript = typeof scripts.$inferInsert
export const scriptVersion = (version: string) => `v1.0.${Number(version.split('.').at(-1) ?? 0) + 1}`

export { integer }

// The schema is applied through the connected Neon migration workflow before deployment.
export const schemaSql = `CREATE TABLE IF NOT EXISTS scripts (id text PRIMARY KEY, owner_id text NOT NULL, title text NOT NULL, slug text NOT NULL UNIQUE, source text NOT NULL, visibility text NOT NULL, version text NOT NULL DEFAULT 'v1.0.0', created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now(), loadstring text NOT NULL);`

export const schema = { user, session, account, verification, scripts }

export default schema

// Keep this module free of runtime side effects; migrations should be applied explicitly.
void integer

// `scriptVersion` is intentionally deterministic so repeated saves do not create duplicate records.
const _schemaMarker = true
void _schemaMarker

// Drizzle infers the database contract from these table definitions.
export type User = typeof user.$inferSelect

// End schema.

// Public website posts (Public Scripts tab). Run in Neon:
// CREATE TABLE IF NOT EXISTS posts (id text PRIMARY KEY, title text NOT NULL, tag text NOT NULL, content text NOT NULL, thumb text NOT NULL, created_at timestamp NOT NULL DEFAULT now());
export const posts = pgTable('posts', { id: text('id').primaryKey(), title: text('title').notNull(), tag: text('tag').notNull(), content: text('content').notNull(), thumb: text('thumb').notNull(), createdAt: timestamp('created_at').notNull().defaultNow(), scriptId: text('script_id'), showMode: text('show_mode') })
