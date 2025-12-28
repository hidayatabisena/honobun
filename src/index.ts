import { createApp } from './app';
import { env } from '@/config/env';
import { closeDatabase } from '@/infrastructure/database/client';

const app = createApp();

// Graceful shutdown handling
const shutdown = async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await closeDatabase();
    console.log('✅ Database connections closed');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
console.log(`🚀 Server starting on port ${env.PORT}`);
console.log(`📍 Environment: ${env.NODE_ENV}`);

export default {
    port: env.PORT,
    fetch: app.fetch,
};
