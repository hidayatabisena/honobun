import { db } from '@/infrastructure/database/client';
import { OrderRepository } from '@/modules/orders/order.repository';
import { OrderService } from '@/modules/orders/order.service';
import { OrderController } from '@/modules/orders/order.controller';
import { createOrderRoutes } from '@/modules/orders/order.routes';
import type { Hono } from 'hono';

/**
 * Dependency Container
 * Manual DI - wires all dependencies at application startup
 * TypeScript enforces boundaries (can't access what's not injected)
 */
export interface Container {
    // Repositories
    orderRepository: OrderRepository;

    // Services
    orderService: OrderService;

    // Controllers
    orderController: OrderController;

    // Routes
    orderRoutes: Hono;
}

/**
 * Creates the dependency container
 * All dependencies are wired here in a single place
 */
export function createContainer(): Container {
    // Layer 1: Repositories (database access)
    const orderRepository = new OrderRepository(db);

    // Layer 2: Services (business logic)
    const orderService = new OrderService(orderRepository);

    // Layer 3: Controllers (HTTP handling)
    const orderController = new OrderController(orderService);

    // Routes (connect controllers to HTTP endpoints)
    const orderRoutes = createOrderRoutes(orderController);

    return {
        orderRepository,
        orderService,
        orderController,
        orderRoutes,
    };
}

/**
 * Type for testing - allows overriding specific dependencies
 */
export type ContainerOverrides = Partial<Container>;

/**
 * Creates a container with test overrides
 * Useful for injecting mocks in tests
 */
export function createTestContainer(overrides: ContainerOverrides = {}): Container {
    const container = createContainer();
    return { ...container, ...overrides };
}
