export interface Product {
  id: number;
  name: string;
  price: number;
  img_url: string;
  power?: string;
  description?: string;
  quantity?: number;
  brand?: string;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  model_code?: string;
  colour?: string;
}

export interface ProductData {
  Product: Product;
}

export interface ProductsData {
  allProducts: Product[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  basketItems: number;
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity: number) => void;
  clearCart: () => void;
} 