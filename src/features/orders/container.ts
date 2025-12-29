import { db } from '@/infrastructure/database/client';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { createOrderRoutes } from './routes/order.routes';
import type { Hono } from 'hono';

/**
 * Orders Feature Container
 * Contains all dependencies specific to the orders feature
 */
export interface OrdersContainer {
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
 * Creates the orders feature container
 * All order-related dependencies are wired here
 */
export function createOrdersContainer(): OrdersContainer {
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
export type OrdersContainerOverrides = Partial<OrdersContainer>;

/**
 * Creates a container with test overrides
 * Useful for injecting mocks in tests
 */
export function createTestOrdersContainer(
    overrides: OrdersContainerOverrides = {}
): OrdersContainer {
    const container = createOrdersContainer();
    return { ...container, ...overrides };
}
