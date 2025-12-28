import { createServer } from '@/infrastructure/http/server';
import { createContainer } from './container';

/**
 * Application Factory
 * Assembles all modules and returns configured Hono app
 */
export function createApp() {
    const app = createServer();
    const container = createContainer();

    // Register module routes
    app.route('/api/orders', container.orderRoutes);

    // Add more module routes here:
    // app.route('/api/users', container.userRoutes);
    // app.route('/api/products', container.productRoutes);

    return app;
}
