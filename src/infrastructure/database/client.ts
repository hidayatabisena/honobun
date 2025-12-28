import postgres from 'postgres';
import { databaseConfig } from '@/config/database';

/**
 * PostgreSQL database client using postgres.js
 * No ORM - direct SQL queries for maximum control
 */
export const db = postgres(databaseConfig.connectionString, {
    max: databaseConfig.max,
    idle_timeout: databaseConfig.idle_timeout,
    connect_timeout: databaseConfig.connect_timeout,
});

/**
 * Type alias for transaction context
 */
export type TransactionSql = typeof db;

/**
 * Helper to run operations within a transaction
 */
export async function withTransaction<T>(
    callback: (sql: TransactionSql) => T | Promise<T>
): Promise<T> {
    return db.begin(callback) as Promise<T>;
}

/**
 * Gracefully close database connections
 */
export async function closeDatabase(): Promise<void> {
    await db.end();
}
