// lib/types.ts

// Describes the structure of a product available in the store.
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    created_at: string;
    mrp?: number;
}

// --- ADD THIS NEW TYPE ---
// Defines the partial product data needed for list/grid cards.
export interface ProductCardType {
    id: string;
    name: string;
    price: number;
    image_url: string;
    mrp?: number;
    category: string; // Needed for building the correct link in the card
}
// -------------------------

// Represents promotional banners displayed in the application.
export interface Banner {
    id: string;
    image_url: string;
    is_active: boolean;
    sort_order: number;
    category: string;
}

// Defines an item within a user's shopping cart.
export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    products: Product; // Relation to the Product table
}

// Represents a customer's order.
export interface Order {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_price: number;
    shipping_address: any; // Using 'any' for flexibility with JSON address objects
    payment_method: 'COD' | 'Paid';
    order_items: OrderItem[]; // Relation to OrderItem
}

// Details a single item within an order.
export interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: { // Can be a partial Product type if not all fields are needed
        id: string;
        name: string;
        image_url: string;
        category: string;
    };
}

// Defines a user's shipping address.
export interface Address {
    id: string;
    user_id: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    house_no?: string;
    mobile_number?: string;
    landmark?: string;
    created_at?: string;
    updated_at?: string;
}

// Represents a user's profile information.
export interface Profile {
    id: string;
    full_name: string;
    phone_number?: string;
    created_at: string;
    expo_push_token?: string;
}

// Defines the structure for shipping rules, e.g., for free shipping thresholds.
export interface ShippingRule {
    id: number;
    min_order_value: number;
    charge: number;
    is_active: boolean;
}

// Represents a notification for a user.
export interface Notification {
    id: number;
    user_id: string;
    title: string;
    message: string;
    created_at: string;
}

// For managing a list of emails that are allowed access.
export interface AllowedEmail {
    email: string;
    created_at: string;
}