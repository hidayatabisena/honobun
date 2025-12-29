import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { OrderService } from '../order.service';
import type { OrderRepository } from '../order.repository';
import type { Order, CreateOrderDto } from '../order.types';
import { NotFoundError, ValidationError } from '@/modules/shared/types/error.types';

/**
 * Unit tests for OrderService
 * Tests business logic in isolation with mocked repository
 */

// Mock order data
const mockOrder: Order = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    status: 'pending',
    total: 99.99,
    items: [{ productId: '123e4567-e89b-12d3-a456-426614174002', quantity: 2, price: 49.995 }],
    createdAt: new Date(),
    updatedAt: new Date(),
};

// Create mock repository
function createMockRepository(): OrderRepository {
    return {
        findById: mock(() => Promise.resolve(null)),
        findMany: mock(() => Promise.resolve({ orders: [], total: 0 })),
        create: mock(() => Promise.resolve(mockOrder)),
        updateStatus: mock(() => Promise.resolve(null)),
        delete: mock(() => Promise.resolve(false)),
    } as unknown as OrderRepository;
}

describe('OrderService', () => {
    let service: OrderService;
    let mockRepo: ReturnType<typeof createMockRepository>;

    beforeEach(() => {
        mockRepo = createMockRepository();
        service = new OrderService(mockRepo);
    });

    describe('getOrderById', () => {
        it('should return order when found', async () => {
            (mockRepo.findById as any).mockResolvedValue(mockOrder);

            const result = await service.getOrderById(mockOrder.id);

            expect(result).toEqual(mockOrder);
            expect(mockRepo.findById).toHaveBeenCalledWith(mockOrder.id);
        });

        it('should throw NotFoundError when order does not exist', async () => {
            (mockRepo.findById as any).mockResolvedValue(null);

            await expect(service.getOrderById('non-existent-id')).rejects.toThrow(NotFoundError);
        });
    });

    describe('createOrder', () => {
        const createOrderDto: CreateOrderDto = {
            userId: '123e4567-e89b-12d3-a456-426614174001',
            items: [
                { productId: '123e4567-e89b-12d3-a456-426614174002', quantity: 2, price: 25 },
                { productId: '123e4567-e89b-12d3-a456-426614174003', quantity: 1, price: 49.99 },
            ],
        };

        it('should calculate total and create order', async () => {
            await service.createOrder(createOrderDto);

            // Get the call args and check total with floating point tolerance
            const callArgs = (mockRepo.create as any).mock.calls[0];
            expect(callArgs[0]).toEqual(createOrderDto);
            expect(callArgs[1]).toBeCloseTo(99.99, 2); // 2*25 + 1*49.99
        });

        it('should reject orders with total less than $1', async () => {
            const lowValueOrder: CreateOrderDto = {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                items: [{ productId: '123e4567-e89b-12d3-a456-426614174002', quantity: 1, price: 0.5 }],
            };

            await expect(service.createOrder(lowValueOrder)).rejects.toThrow(ValidationError);
        });

        it('should reject orders with more than 100 items', async () => {
            const bulkOrder: CreateOrderDto = {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                items: [{ productId: '123e4567-e89b-12d3-a456-426614174002', quantity: 101, price: 10 }],
            };

            await expect(service.createOrder(bulkOrder)).rejects.toThrow(ValidationError);
        });
    });

    describe('updateOrderStatus', () => {
        it('should allow valid status transitions', async () => {
            const pendingOrder = { ...mockOrder, status: 'pending' as const };
            (mockRepo.findById as any).mockResolvedValue(pendingOrder);
            (mockRepo.updateStatus as any).mockResolvedValue({ ...pendingOrder, status: 'confirmed' });

            const result = await service.updateOrderStatus(mockOrder.id, { status: 'confirmed' });

            expect(result.status).toBe('confirmed');
        });

        it('should reject invalid status transitions', async () => {
            const deliveredOrder = { ...mockOrder, status: 'delivered' as const };
            (mockRepo.findById as any).mockResolvedValue(deliveredOrder);

            await expect(
                service.updateOrderStatus(mockOrder.id, { status: 'pending' })
            ).rejects.toThrow(ValidationError);
        });

        it('should throw NotFoundError for non-existent order', async () => {
            (mockRepo.findById as any).mockResolvedValue(null);

            await expect(
                service.updateOrderStatus('non-existent', { status: 'confirmed' })
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteOrder', () => {
        it('should allow deleting pending orders', async () => {
            const pendingOrder = { ...mockOrder, status: 'pending' as const };
            (mockRepo.findById as any).mockResolvedValue(pendingOrder);
            (mockRepo.delete as any).mockResolvedValue(true);

            // Should resolve without throwing
            await service.deleteOrder(mockOrder.id);
            expect(mockRepo.delete).toHaveBeenCalledWith(mockOrder.id);
        });

        it('should reject deleting non-pending orders', async () => {
            const shippedOrder = { ...mockOrder, status: 'shipped' as const };
            (mockRepo.findById as any).mockResolvedValue(shippedOrder);

            await expect(service.deleteOrder(mockOrder.id)).rejects.toThrow(ValidationError);
        });
    });
});
