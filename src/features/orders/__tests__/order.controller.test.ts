import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import { OrderController } from '../order.controller';
import type { OrderService } from '../order.service';
import type { Order } from '../order.types';
import { validateBody, validateParams, validateQuery } from '@/modules/shared/middleware/validator';
import { createOrderSchema, orderIdParamSchema, listOrdersQuerySchema } from '../order.types';
import { onErrorHandler } from '@/modules/shared/middleware/errorHandler';
import { NotFoundError } from '@/modules/shared/types/error.types';
import type { ApiResponse } from '@/modules/shared/types/api.types';

/**
 * Controller integration tests
 * Tests HTTP layer with mocked service
 */

const mockOrder: Order = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    status: 'pending',
    total: 99.99,
    items: [{ productId: '123e4567-e89b-12d3-a456-426614174002', quantity: 2, price: 49.995 }],
    createdAt: new Date(),
    updatedAt: new Date(),
};

function createMockService(): OrderService {
    return {
        getOrderById: mock(() => Promise.resolve(mockOrder)),
        listOrders: mock(() => Promise.resolve({ orders: [mockOrder], page: 1, limit: 20, total: 1 })),
        createOrder: mock(() => Promise.resolve(mockOrder)),
        updateOrderStatus: mock(() => Promise.resolve(mockOrder)),
        cancelOrder: mock(() => Promise.resolve(mockOrder)),
        deleteOrder: mock(() => Promise.resolve()),
    } as unknown as OrderService;
}

function createTestApp(service: OrderService) {
    const app = new Hono();
    const controller = new OrderController(service);

    app.onError(onErrorHandler);

    app.get('/orders', validateQuery(listOrdersQuerySchema), (c) => controller.listOrders(c));
    app.get('/orders/:id', validateParams(orderIdParamSchema), (c) => controller.getOrder(c));
    app.post('/orders', validateBody(createOrderSchema), (c) => controller.createOrder(c));

    return app;
}

describe('OrderController', () => {
    let mockService: ReturnType<typeof createMockService>;
    let app: Hono;

    beforeEach(() => {
        mockService = createMockService();
        app = createTestApp(mockService);
    });

    describe('GET /orders', () => {
        it('should return paginated orders', async () => {
            const res = await app.request('/orders');
            const json = (await res.json()) as ApiResponse<Order[]>;

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.data).toHaveLength(1);
            expect(json.meta).toBeDefined();
        });

        it('should pass query parameters to service', async () => {
            await app.request('/orders?page=2&limit=10');

            expect(mockService.listOrders).toHaveBeenCalledWith({
                page: 2,
                limit: 10,
            });
        });
    });

    describe('GET /orders/:id', () => {
        it('should return order when found', async () => {
            const res = await app.request(`/orders/${mockOrder.id}`);
            const json = (await res.json()) as ApiResponse<Order>;

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.data?.id).toBe(mockOrder.id);
        });

        it('should return 404 when order not found', async () => {
            (mockService.getOrderById as any).mockRejectedValue(
                new NotFoundError('Order', 'non-existent')
            );

            const res = await app.request('/orders/123e4567-e89b-12d3-a456-426614174999');
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(404);
            expect(json.success).toBe(false);
            expect(json.error?.code).toBe('NOT_FOUND');
        });

        it('should return 400 for invalid UUID', async () => {
            const res = await app.request('/orders/invalid-uuid');
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(400);
            expect(json.success).toBe(false);
            expect(json.error?.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('POST /orders', () => {
        it('should create order with valid data', async () => {
            const orderData = {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                items: [
                    { productId: '123e4567-e89b-12d3-a456-426614174002', quantity: 2, price: 25 },
                ],
            };

            const res = await app.request('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            const json = (await res.json()) as ApiResponse<Order>;

            expect(res.status).toBe(201);
            expect(json.success).toBe(true);
        });

        it('should return 400 for invalid request body', async () => {
            const res = await app.request('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invalid: 'data' }),
            });
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(400);
            expect(json.success).toBe(false);
        });
    });
});
