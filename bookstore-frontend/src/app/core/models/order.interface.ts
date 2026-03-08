export interface OrderItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
}

/** Request body for POST /orders/checkout */
export interface CreateOrderRequest {
  shippingAddress: string;
}
