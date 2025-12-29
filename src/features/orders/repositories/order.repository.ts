import type { TransactionSql } from '@/infrastructure/database/client';
import type { Order, CreateOrderDto, OrderStatus } from '../types/order.types';

/**
 * Order Repository
 * Handles database operations ONLY - no business logic
 */
export class OrderRepository {
  constructor(private readonly db: TransactionSql) { }

  async findById(id: string): Promise<Order | null> {
    const [order] = await this.db<Order[]>`
      SELECT 
        id,
        user_id as "userId",
        status,
        total,
        items,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM orders 
      WHERE id = ${id}
    `;
    return order ?? null;
  }

  async findMany(options: {
    page: number;
    limit: number;
    userId?: string;
    status?: OrderStatus;
  }): Promise<{ orders: Order[]; total: number }> {
    const { page, limit, userId, status } = options;
    const offset = (page - 1) * limit;

    // Build dynamic where clause
    const whereClause = this.db`
      WHERE 1=1
      ${userId ? this.db`AND user_id = ${userId}` : this.db``}
      ${status ? this.db`AND status = ${status}` : this.db``}
    `;

    const orders = await this.db<Order[]>`
      SELECT 
        id,
        user_id as "userId",
        status,
        total,
        items,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM orders 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await this.db<[{ count: string }]>`
      SELECT COUNT(*) as count FROM orders ${whereClause}
    `;

    return { orders, total: parseInt(count, 10) };
  }

  async create(data: CreateOrderDto, total: number): Promise<Order> {
    const [order] = await this.db<Order[]>`
      INSERT INTO orders (user_id, status, total, items)
      VALUES (
        ${data.userId},
        'pending',
        ${total},
        ${JSON.stringify(data.items)}
      )
      RETURNING 
        id,
        user_id as "userId",
        status,
        total,
        items,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const [order] = await this.db<Order[]>`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id,
        user_id as "userId",
        status,
        total,
        items,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return order ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db`
      DELETE FROM orders WHERE id = ${id}
    `;
    return result.count > 0;
  }
}
