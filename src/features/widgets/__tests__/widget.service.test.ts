import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { WidgetService } from '../services/widget.service';
import type { WidgetRepository } from '../repositories/widget.repository';
import type { Widget } from '../types/widget.types';
import { ValidationError } from '@/core/errors/base/validation-error';
import { WidgetNotFoundError } from '../errors/widget-errors';

const mockWidget: Widget = {
    id: '123e4567-e89b-12d3-a456-426614174010',
    name: 'Demo Widget',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockWidgetRow = {
    id: mockWidget.id,
    name: mockWidget.name,
    created_at: mockWidget.createdAt,
    updated_at: mockWidget.updatedAt,
};

function createMockRepository(): WidgetRepository {
    return {
        findById: mock(() => Promise.resolve(null)),
        findMany: mock(() => Promise.resolve({ widgets: [], total: 0 })),
        create: mock(() => Promise.resolve(mockWidgetRow)),
        update: mock(() => Promise.resolve(null)),
        delete: mock(() => Promise.resolve(false)),
    } as unknown as WidgetRepository;
}

describe('WidgetService', () => {
    let service: WidgetService;
    let mockRepo: ReturnType<typeof createMockRepository>;

    beforeEach(() => {
        mockRepo = createMockRepository();
        service = new WidgetService(mockRepo);
    });

    describe('getWidgetById', () => {
        it('should return widget when found', async () => {
            (mockRepo.findById as any).mockResolvedValue(mockWidgetRow);

            const result = await service.getWidgetById({ id: mockWidget.id });

            expect(result).toEqual(mockWidget);
            expect(mockRepo.findById).toHaveBeenCalledWith(mockWidget.id);
        });

        it('should throw NotFoundError when widget does not exist', async () => {
            (mockRepo.findById as any).mockResolvedValue(null);

            await expect(
                service.getWidgetById({ id: '123e4567-e89b-12d3-a456-426614174999' })
            ).rejects.toThrow(WidgetNotFoundError);
        });
    });

    describe('createWidget', () => {
        it('should trim name and create widget', async () => {
            await service.createWidget({ name: '  Demo Widget  ' });

            const callArgs = (mockRepo.create as any).mock.calls[0];
            expect(callArgs[0]).toEqual({ name: 'Demo Widget' });
        });

        it('should reject empty trimmed name', async () => {
            await expect(service.createWidget({ name: '   ' })).rejects.toThrow(ValidationError);
        });
    });

    describe('listWidgets', () => {
        it('should parse query and call repository', async () => {
            (mockRepo.findMany as any).mockResolvedValue({ widgets: [mockWidgetRow], total: 1 });

            const result = await service.listWidgets({ page: '2', limit: '10', name: 'Demo' });

            expect(mockRepo.findMany).toHaveBeenCalledWith({ page: 2, limit: 10, name: 'Demo' });
            expect(result.widgets).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.page).toBe(2);
            expect(result.limit).toBe(10);
        });
    });

    describe('updateWidget', () => {
        it('should update widget and return result', async () => {
            const updatedRow = { ...mockWidgetRow, name: 'Updated Widget' };
            (mockRepo.update as any).mockResolvedValue(updatedRow);

            const result = await service.updateWidget({ id: mockWidget.id }, { name: '  Updated Widget  ' });

            expect(mockRepo.update).toHaveBeenCalledWith(mockWidget.id, { name: 'Updated Widget' });
            expect(result.name).toBe('Updated Widget');
        });

        it('should throw NotFoundError when widget does not exist', async () => {
            (mockRepo.update as any).mockResolvedValue(null);

            await expect(
                service.updateWidget({ id: mockWidget.id }, { name: 'Updated Widget' })
            ).rejects.toThrow(WidgetNotFoundError);
        });
    });

    describe('deleteWidget', () => {
        it('should delete existing widget', async () => {
            (mockRepo.delete as any).mockResolvedValue(true);

            await service.deleteWidget({ id: mockWidget.id });
            expect(mockRepo.delete).toHaveBeenCalledWith(mockWidget.id);
        });

        it('should throw NotFoundError when widget is not deleted', async () => {
            (mockRepo.delete as any).mockResolvedValue(false);

            await expect(service.deleteWidget({ id: mockWidget.id })).rejects.toThrow(WidgetNotFoundError);
        });
    });
});
