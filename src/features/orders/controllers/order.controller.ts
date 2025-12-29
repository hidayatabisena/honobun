import type { Context } from 'hono';
import type { OrderService } from '../services/order.service';
import { successResponse, paginatedResponse } from '@/shared/types/api.types';
import { parseJsonBody } from '@/shared/http/parseJsonBody';

/**
 * Order Controller
 * HTTP concerns ONLY - no business logic
 */
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    async getOrder(c: Context): Promise<Response> {
        const id = c.req.param('id');
        const order = await this.orderService.getOrderById({ id });
        return c.json(successResponse(order));
    }

    async listOrders(c: Context): Promise<Response> {
        const query = c.req.query();
        const result = await this.orderService.listOrders(query);

        return c.json(
            paginatedResponse(
                result.orders,
                result.page,
                result.limit,
                result.total
            )
        );
    }

    async createOrder(c: Context): Promise<Response> {
        const body = await parseJsonBody(c);
        const order = await this.orderService.createOrder(body);
        return c.json(successResponse(order), 201);
    }

    async updateOrderStatus(c: Context): Promise<Response> {
        const id = c.req.param('id');
        const body = await parseJsonBody(c);
        const order = await this.orderService.updateOrderStatus({ id }, body);
        return c.json(successResponse(order));
    }

    async cancelOrder(c: Context): Promise<Response> {
        const id = c.req.param('id');
        const order = await this.orderService.cancelOrder({ id });
        return c.json(successResponse(order));
    }

    async deleteOrder(c: Context): Promise<Response> {
        const id = c.req.param('id');
        await this.orderService.deleteOrder({ id });
        return c.json(successResponse({ deleted: true }));
    }
}
