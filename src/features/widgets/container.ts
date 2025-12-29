import type { TransactionSql } from '@/infrastructure/database/client';
import { WidgetRepository } from './repositories/widget.repository';
import { WidgetService } from './services/widget.service';
import { WidgetController } from './controllers/widget.controller';
import { createWidgetRoutes } from './routes/widget.routes';
import type { Hono } from 'hono';

export interface WidgetsContainer {
    widgetRepository: WidgetRepository;
    widgetService: WidgetService;
    widgetController: WidgetController;
    widgetRoutes: Hono;
}

export interface WidgetsInfrastructureDeps {
    db: TransactionSql;
}

export function createWidgetsContainer(deps: WidgetsInfrastructureDeps): WidgetsContainer {
    const widgetRepository = new WidgetRepository(deps.db);
    const widgetService = new WidgetService(widgetRepository);
    const widgetController = new WidgetController(widgetService);
    const widgetRoutes = createWidgetRoutes(widgetController);

    return {
        widgetRepository,
        widgetService,
        widgetController,
        widgetRoutes,
    };
}

export type WidgetsContainerOverrides = Partial<WidgetsContainer>;

export function createTestWidgetsContainer(
    deps: WidgetsInfrastructureDeps,
    overrides: WidgetsContainerOverrides = {}
): WidgetsContainer {
    const container = createWidgetsContainer(deps);
    return { ...container, ...overrides };
}

