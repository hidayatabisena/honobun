import { z } from 'zod';

/**
 * Order status enum
 */
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Order entity type (from database)
 */
export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    total: number;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

/**
 * Zod schemas for validation
 */
export const createOrderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
});

export const createOrderSchema = z.object({
    userId: z.string().uuid(),
    items: z.array(createOrderItemSchema).min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

export const orderIdParamSchema = z.object({
    id: z.string().uuid(),
});

export const listOrdersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    userId: z.string().uuid().optional(),
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
});

/**
 * DTO types inferred from schemas
 */
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
