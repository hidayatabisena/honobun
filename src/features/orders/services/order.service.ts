import { OrderRepository, type OrderRow } from '../repositories/order.repository';
import type { Order, CreateOrderDto, UpdateOrderStatusDto, ListOrdersQuery, OrderStatus } from '../types/order.types';
import { ValidationError } from '../../../core/errors/base/validation-error';
import { OrderNotFoundError } from '../errors/order-errors';

function toOrder(row: OrderRow): Order {
    return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        total: row.total,
        items: row.items as any,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/**
 * Order Service
 * Contains ALL business logic and orchestration
 */
export class OrderService {
    constructor(private readonly orderRepository: OrderRepository) { }

    async getOrderById(id: string): Promise<Order> {
        const orderRow = await this.orderRepository.findById(id);

        if (!orderRow) {
            throw new OrderNotFoundError(id);
        }

        return toOrder(orderRow);
    }

    async listOrders(query: ListOrdersQuery): Promise<{
        orders: Order[];
        page: number;
        limit: number;
        total: number;
    }> {
        const { orders: orderRows, total } = await this.orderRepository.findMany({
            page: query.page,
            limit: query.limit,
            userId: query.userId,
            status: query.status,
        });

        return {
            orders: orderRows.map(toOrder),
            page: query.page,
            limit: query.limit,
            total,
        };
    }

    async createOrder(data: CreateOrderDto): Promise<Order> {
        // Business logic: Calculate total from items
        const total = data.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const initialStatus: OrderStatus = 'pending';

        // Business logic: Validate minimum order value
        if (total < 1) {
            throw new ValidationError('Order total must be at least $1');
        }

        // Business logic: Validate maximum items per order
        const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 100) {
            throw new ValidationError('Maximum 100 items per order');
        }

        const createdRow = await this.orderRepository.create(data, total, initialStatus);
        return toOrder(createdRow);
    }

    async updateOrderStatus(id: string, data: UpdateOrderStatusDto): Promise<Order> {
        // Business logic: Get current order to validate transition
        const currentOrder = await this.orderRepository.findById(id);

        if (!currentOrder) {
            throw new OrderNotFoundError(id);
        }

        // Business logic: Validate status transitions
        const validTransitions: Record<string, string[]> = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: [],
        };

        const allowedTransitions = validTransitions[currentOrder.status] || [];

        if (!allowedTransitions.includes(data.status)) {
            throw new ValidationError(
                `Cannot transition from '${currentOrder.status}' to '${data.status}'`
            );
        }

        const updatedOrder = await this.orderRepository.updateStatus(id, data.status);

        if (!updatedOrder) {
            throw new OrderNotFoundError(id);
        }

        return toOrder(updatedOrder);
    }

    async cancelOrder(id: string): Promise<Order> {
        return this.updateOrderStatus(id, { status: 'cancelled' });
    }

    async deleteOrder(id: string): Promise<void> {
        const order = await this.orderRepository.findById(id);

        if (!order) {
            throw new OrderNotFoundError(id);
        }

        // Business logic: Only pending orders can be deleted
        if (order.status !== 'pending') {
            throw new ValidationError('Only pending orders can be deleted');
        }

        await this.orderRepository.delete(id);
    }
}
