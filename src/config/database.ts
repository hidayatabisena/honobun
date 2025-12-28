import { env } from './env';

export const databaseConfig = {
    connectionString: env.DATABASE_URL,
    max: 20, // Maximum connections in pool
    idle_timeout: 30, // Close idle connections after 30 seconds
    connect_timeout: 10, // Connection timeout in seconds
};
