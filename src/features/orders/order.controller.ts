import type { Context } from 'hono';
import type { OrderService } from './order.service';
import { successResponse, paginatedResponse } from '@/modules/shared/types/api.types';
import type { CreateOrderDto, UpdateOrderStatusDto, ListOrdersQuery } from './order.types';

/**
 * Order Controller
 * HTTP concerns ONLY - no business logic
 */
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    async getOrder(c: Context): Promise<Response> {
        const { id } = c.get('validatedParams');
        const order = await this.orderService.getOrderById(id);
        return c.json(successResponse(order));
    }

    async listOrders(c: Context): Promise<Response> {
        const query: ListOrdersQuery = c.get('validatedQuery');
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
        const data: CreateOrderDto = c.get('validatedBody');
        const order = await this.orderService.createOrder(data);
        return c.json(successResponse(order), 201);
    }

    async updateOrderStatus(c: Context): Promise<Response> {
        const { id } = c.get('validatedParams');
        const data: UpdateOrderStatusDto = c.get('validatedBody');
        const order = await this.orderService.updateOrderStatus(id, data);
        return c.json(successResponse(order));
    }

    async cancelOrder(c: Context): Promise<Response> {
        const { id } = c.get('validatedParams');
        const order = await this.orderService.cancelOrder(id);
        return c.json(successResponse(order));
    }

    async deleteOrder(c: Context): Promise<Response> {
        const { id } = c.get('validatedParams');
        await this.orderService.deleteOrder(id);
        return c.json(successResponse({ deleted: true }));
    }
}
