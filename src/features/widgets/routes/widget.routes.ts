import { Hono } from 'hono';
import type { WidgetController } from '../controllers/widget.controller';

export function createWidgetRoutes(controller: WidgetController): Hono {
    const router = new Hono();

    router.get('/', (c) => controller.listWidgets(c));
    router.get('/:id', (c) => controller.getWidget(c));
    router.post('/', (c) => controller.createWidget(c));
    router.patch('/:id', (c) => controller.updateWidget(c));
    router.delete('/:id', (c) => controller.deleteWidget(c));

    return router;
}
