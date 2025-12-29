import type { Context } from 'hono';
import type { WidgetService } from '../services/widget.service';
import { successResponse, paginatedResponse } from '@/shared/types/api.types';
import { parseJsonBody } from '@/shared/http/parseJsonBody';

export class WidgetController {
    constructor(private readonly widgetService: WidgetService) { }

    async getWidget(c: Context): Promise<Response> {
        const id = c.req.param('id');
        const widget = await this.widgetService.getWidgetById({ id });
        return c.json(successResponse(widget));
    }

    async listWidgets(c: Context): Promise<Response> {
        const query = c.req.query();
        const result = await this.widgetService.listWidgets(query);

        return c.json(
            paginatedResponse(
                result.widgets,
                result.page,
                result.limit,
                result.total
            )
        );
    }

    async createWidget(c: Context): Promise<Response> {
        const body = await parseJsonBody(c);
        const widget = await this.widgetService.createWidget(body);
        return c.json(successResponse(widget), 201);
    }

    async updateWidget(c: Context): Promise<Response> {
        const id = c.req.param('id');
        const body = await parseJsonBody(c);
        const widget = await this.widgetService.updateWidget({ id }, body);
        return c.json(successResponse(widget));
    }

    async deleteWidget(c: Context): Promise<Response> {
        const id = c.req.param('id');
        await this.widgetService.deleteWidget({ id });
        return c.json(successResponse({ deleted: true }));
    }
}
