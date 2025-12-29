import { Hono } from 'hono';
import type { OrderController } from '../controllers/order.controller';
import { validateBody, validateParams, validateQuery } from '@/shared/middleware/validator';
import {
    createOrderSchema,
    updateOrderStatusSchema,
    orderIdParamSchema,
    listOrdersQuerySchema,
} from '../types/order.types';

/**
 * Creates order routes with injected controller
 */
export function createOrderRoutes(controller: OrderController): Hono {
    const router = new Hono();

    // GET /orders - List orders with pagination and filters
    router.get(
        '/',
        validateQuery(listOrdersQuerySchema),
        (c) => controller.listOrders(c)
    );

    // GET /orders/:id - Get single order by ID
    router.get(
        '/:id',
        validateParams(orderIdParamSchema),
        (c) => controller.getOrder(c)
    );

    // POST /orders - Create new order
    router.post(
        '/',
        validateBody(createOrderSchema),
        (c) => controller.createOrder(c)
    );

    // PATCH /orders/:id/status - Update order status
    router.patch(
        '/:id/status',
        validateParams(orderIdParamSchema),
        validateBody(updateOrderStatusSchema),
        (c) => controller.updateOrderStatus(c)
    );

    // POST /orders/:id/cancel - Cancel order
    router.post(
        '/:id/cancel',
        validateParams(orderIdParamSchema),
        (c) => controller.cancelOrder(c)
    );

    // DELETE /orders/:id - Delete order (only pending)
    router.delete(
        '/:id',
        validateParams(orderIdParamSchema),
        (c) => controller.deleteOrder(c)
    );

    return router;
}
