export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  tag: string;
  emoji: string;
  desc: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}
