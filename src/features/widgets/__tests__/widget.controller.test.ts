import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import { WidgetController } from '../controllers/widget.controller';
import type { WidgetService } from '../services/widget.service';
import type { Widget } from '../types/widget.types';
import { widgetIdParamSchema, createWidgetSchema, updateWidgetSchema } from '../types/widget.types';
import { onErrorHandler } from '@/shared/middleware/errorHandler';
import { WidgetNotFoundError } from '../errors/widget-errors';
import type { ApiResponse } from '@/shared/types/api.types';

const mockWidget: Widget = {
    id: '123e4567-e89b-12d3-a456-426614174010',
    name: 'Demo Widget',
    createdAt: new Date(),
    updatedAt: new Date(),
};

function createMockService(): WidgetService {
    return {
        getWidgetById: mock(() => Promise.resolve(mockWidget)),
        listWidgets: mock(() => Promise.resolve({ widgets: [mockWidget], page: 1, limit: 20, total: 1 })),
        createWidget: mock(() => Promise.resolve(mockWidget)),
        updateWidget: mock(() => Promise.resolve({ ...mockWidget, name: 'Updated Widget' })),
        deleteWidget: mock(() => Promise.resolve()),
    } as unknown as WidgetService;
}

function createTestApp(service: WidgetService) {
    const app = new Hono();
    const controller = new WidgetController(service);

    app.onError(onErrorHandler);

    app.get('/widgets', (c) => controller.listWidgets(c));
    app.get('/widgets/:id', (c) => controller.getWidget(c));
    app.post('/widgets', (c) => controller.createWidget(c));
    app.patch('/widgets/:id', (c) => controller.updateWidget(c));
    app.delete('/widgets/:id', (c) => controller.deleteWidget(c));

    return app;
}

describe('WidgetController', () => {
    let mockService: ReturnType<typeof createMockService>;
    let app: Hono;

    beforeEach(() => {
        mockService = createMockService();
        app = createTestApp(mockService);
    });

    describe('GET /widgets', () => {
        it('should return paginated widgets', async () => {
            const res = await app.request('/widgets');
            const json = (await res.json()) as ApiResponse<Widget[]>;

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.data).toHaveLength(1);
            expect(json.meta).toBeDefined();
        });

        it('should pass query parameters to service', async () => {
            await app.request('/widgets?page=2&limit=10&name=Demo');

            expect(mockService.listWidgets).toHaveBeenCalledWith({
                page: '2',
                limit: '10',
                name: 'Demo',
            });
        });
    });

    describe('GET /widgets/:id', () => {
        it('should return widget when found', async () => {
            const res = await app.request(`/widgets/${mockWidget.id}`);
            const json = (await res.json()) as ApiResponse<Widget>;

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.data?.id).toBe(mockWidget.id);
        });

        it('should return 404 when widget not found', async () => {
            (mockService.getWidgetById as any).mockRejectedValue(new WidgetNotFoundError('missing'));

            const res = await app.request('/widgets/123e4567-e89b-12d3-a456-426614174999');
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(404);
            expect(json.success).toBe(false);
            expect(json.error?.code).toBe('NOT_FOUND');
        });

        it('should return 400 for invalid UUID', async () => {
            let zodError: unknown;
            try {
                widgetIdParamSchema.parse({ id: 'invalid-uuid' });
            } catch (err) {
                zodError = err;
            }

            (mockService.getWidgetById as any).mockRejectedValue(zodError);

            const res = await app.request('/widgets/invalid-uuid');
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(400);
            expect(json.success).toBe(false);
            expect(json.error?.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('POST /widgets', () => {
        it('should create widget with valid data', async () => {
            const widgetData = { name: 'Demo Widget' };

            const res = await app.request('/widgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(widgetData),
            });
            const json = (await res.json()) as ApiResponse<Widget>;

            expect(res.status).toBe(201);
            expect(json.success).toBe(true);
        });

        it('should return 400 for invalid request body', async () => {
            let zodError: unknown;
            try {
                createWidgetSchema.parse({ bad: 'data' } as any);
            } catch (err) {
                zodError = err;
            }

            (mockService.createWidget as any).mockRejectedValue(zodError);

            const res = await app.request('/widgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bad: 'data' }),
            });
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(400);
            expect(json.success).toBe(false);
        });
    });

    describe('PATCH /widgets/:id', () => {
        it('should update widget with valid data', async () => {
            const widgetData = { name: 'Updated Widget' };

            const res = await app.request(`/widgets/${mockWidget.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(widgetData),
            });
            const json = (await res.json()) as ApiResponse<Widget>;

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.data?.name).toBe('Updated Widget');
        });

        it('should return 404 when widget not found', async () => {
            (mockService.updateWidget as any).mockRejectedValue(new WidgetNotFoundError('missing'));

            const res = await app.request(`/widgets/${mockWidget.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Updated Widget' }),
            });
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(404);
            expect(json.success).toBe(false);
            expect(json.error?.code).toBe('NOT_FOUND');
        });

        it('should return 400 for invalid request body', async () => {
            let zodError: unknown;
            try {
                updateWidgetSchema.parse({ bad: 'data' } as any);
            } catch (err) {
                zodError = err;
            }

            (mockService.updateWidget as any).mockRejectedValue(zodError);

            const res = await app.request(`/widgets/${mockWidget.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bad: 'data' }),
            });
            const json = (await res.json()) as ApiResponse<never>;

            expect(res.status).toBe(400);
            expect(json.success).toBe(false);
        });
    });
});
