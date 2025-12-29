import { Hono } from 'hono';
import type { OrderController } from '../controllers/order.controller';

/**
 * Creates order routes with injected controller
 */
export function createOrderRoutes(controller: OrderController): Hono {
    const router = new Hono();

    // GET /orders - List orders with pagination and filters
    router.get('/', (c) => controller.listOrders(c));

    // GET /orders/:id - Get single order by ID
    router.get('/:id', (c) => controller.getOrder(c));

    // POST /orders - Create new order
    router.post('/', (c) => controller.createOrder(c));

    // PATCH /orders/:id/status - Update order status
    router.patch('/:id/status', (c) => controller.updateOrderStatus(c));

    // POST /orders/:id/cancel - Cancel order
    router.post('/:id/cancel', (c) => controller.cancelOrder(c));

    // DELETE /orders/:id - Delete order (only pending)
    router.delete('/:id', (c) => controller.deleteOrder(c));

    return router;
}
