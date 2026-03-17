export interface CartItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}
