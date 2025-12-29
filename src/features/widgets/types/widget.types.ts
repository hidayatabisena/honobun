import { z } from 'zod';

export interface Widget {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export const createWidgetSchema = z.object({
    name: z.string().min(1).max(200),
});

export const updateWidgetSchema = z.object({
    name: z.string().min(1).max(200),
});

export const widgetIdParamSchema = z.object({
    id: z.string().uuid(),
});

export const listWidgetsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    name: z.string().min(1).max(200).optional(),
});

export type CreateWidgetDto = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetDto = z.infer<typeof updateWidgetSchema>;
export type ListWidgetsQuery = z.infer<typeof listWidgetsQuerySchema>;
