import type { TransactionSql } from '@/infrastructure/database/client';
import type { CreateWidgetDto, UpdateWidgetDto } from '../types/widget.types';

export interface WidgetRow {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export class WidgetRepository {
    constructor(private readonly db: TransactionSql) { }

    async findById(id: string): Promise<WidgetRow | null> {
        const [row] = await this.db<WidgetRow[]>`
      SELECT
        id,
        name,
        created_at,
        updated_at
      FROM widgets
      WHERE id = ${id}
    `;
        return row ?? null;
    }

    async findMany(options: {
        page: number;
        limit: number;
        name?: string;
    }): Promise<{ widgets: WidgetRow[]; total: number }> {
        const { page, limit, name } = options;
        const offset = (page - 1) * limit;

        const whereClause = this.db`
      WHERE 1=1
      ${name ? this.db`AND name ILIKE ${`%${name}%`}` : this.db``}
    `;

        const widgets = await this.db<WidgetRow[]>`
      SELECT
        id,
        name,
        created_at,
        updated_at
      FROM widgets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

        const [{ count }] = await this.db<[{ count: string }]>`
      SELECT COUNT(*) as count FROM widgets ${whereClause}
    `;

        return { widgets, total: parseInt(count, 10) };
    }

    async create(data: CreateWidgetDto): Promise<WidgetRow> {
        const [row] = await this.db<WidgetRow[]>`
      INSERT INTO widgets (name)
      VALUES (${data.name})
      RETURNING
        id,
        name,
        created_at,
        updated_at
    `;
        return row;
    }

    async update(id: string, data: UpdateWidgetDto): Promise<WidgetRow | null> {
        const [row] = await this.db<WidgetRow[]>`
      UPDATE widgets
      SET name = ${data.name}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING
        id,
        name,
        created_at,
        updated_at
    `;
        return row ?? null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db`
      DELETE FROM widgets WHERE id = ${id}
    `;
        return result.count > 0;
    }
}
