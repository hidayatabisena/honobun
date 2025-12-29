import { db } from '@/infrastructure/database/client';
import { createOrdersContainer, type OrdersContainer } from '@/features/orders/container';
import { createWidgetsContainer, type WidgetsContainer } from '@/features/widgets/container';

/**
 * Application Dependency Container
 * Manual DI - wires all feature containers at application startup
 * TypeScript enforces boundaries (can't access what's not injected)
 * 
 * As the application grows, add feature-specific containers here
 * Example:
 * - orders: OrdersContainer
 * - users: UsersContainer
 * - products: ProductsContainer
 */
export interface Container {
    // Feature containers
    orders: OrdersContainer;
    widgets: WidgetsContainer;

    // Add more feature containers here as the app grows
    // users?: UsersContainer;
    // products?: ProductsContainer;
}

/**
 * Creates the application dependency container
 * Delegates to feature-specific containers for clean separation
 */
export function createContainer(): Container {
    // Create feature-specific containers
    const orders = createOrdersContainer({ db });
    const widgets = createWidgetsContainer({ db });

    // Add more feature containers as needed
    // const users = createUsersContainer();
    // const products = createProductsContainer();

    return {
        orders,
        widgets,
        // Add more feature containers here
        // users,
        // products,
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
