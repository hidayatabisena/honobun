import type { Widget, CreateWidgetDto, ListWidgetsQuery, UpdateWidgetDto } from '../types/widget.types';
import { createWidgetSchema, listWidgetsQuerySchema, updateWidgetSchema, widgetIdParamSchema } from '../types/widget.types';
import type { WidgetRepository, WidgetRow } from '../repositories/widget.repository';
import { ValidationError } from '@/core/errors/base/validation-error';
import { WidgetNotFoundError } from '../errors/widget-errors';

function toWidget(row: WidgetRow): Widget {
    return {
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class WidgetService {
    constructor(private readonly widgetRepository: WidgetRepository) { }

    async getWidgetById(params: unknown): Promise<Widget> {
        const { id } = widgetIdParamSchema.parse(params);
        const row = await this.widgetRepository.findById(id);

        if (!row) {
            throw new WidgetNotFoundError(id);
        }

        return toWidget(row);
    }

    async listWidgets(query: unknown): Promise<{
        widgets: Widget[];
        page: number;
        limit: number;
        total: number;
    }> {
        const parsedQuery: ListWidgetsQuery = listWidgetsQuerySchema.parse(query);
        const { widgets: rows, total } = await this.widgetRepository.findMany({
            page: parsedQuery.page,
            limit: parsedQuery.limit,
            name: parsedQuery.name,
        });

        return {
            widgets: rows.map(toWidget),
            page: parsedQuery.page,
            limit: parsedQuery.limit,
            total,
        };
    }

    async createWidget(body: unknown): Promise<Widget> {
        const data: CreateWidgetDto = createWidgetSchema.parse(body);

        if (data.name.trim().length === 0) {
            throw new ValidationError('Widget name cannot be empty');
        }

        const created = await this.widgetRepository.create({ name: data.name.trim() });
        return toWidget(created);
    }

    async updateWidget(params: unknown, body: unknown): Promise<Widget> {
        const { id } = widgetIdParamSchema.parse(params);
        const data: UpdateWidgetDto = updateWidgetSchema.parse(body);

        if (data.name.trim().length === 0) {
            throw new ValidationError('Widget name cannot be empty');
        }

        const updated = await this.widgetRepository.update(id, { name: data.name.trim() });
        if (!updated) {
            throw new WidgetNotFoundError(id);
        }

        return toWidget(updated);
    }

    async deleteWidget(params: unknown): Promise<void> {
        const { id } = widgetIdParamSchema.parse(params);
        const deleted = await this.widgetRepository.delete(id);

        if (!deleted) {
            throw new WidgetNotFoundError(id);
        }
    }
}
