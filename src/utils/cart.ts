// utils/cart.ts

// Kiểu dữ liệu Product dựa trên Prisma schema
// src/utils/cart.ts

// Kiểu dữ liệu Product dựa trên Prisma schema
export interface Product {
  id: number;
  name: string;
  author?: string | null;
  publisher?: string | null;
  isbn?: string | null;
  language?: string | null;
  publishedYear?: number | null;
  pages?: number | null;
  description?: string | null;
  category?: string | null;
  price: number;
  quantity: number; // tồn kho
  sold: number;
  images: { id: number; url: string; productId: number }[];
  variantId?: number;
  [key: string]: unknown; // để mở rộng nếu API có thêm field khác
}


// CartItem kế thừa Product
export interface CartItem extends Product {
  quantity: number;     // số lượng trong giỏ
  maxQuantity: number;  // luôn có, không optional
  selected: boolean;    // luôn có, mặc định false
  image: string;        // luôn có
}

/**
 * Lấy giỏ hàng từ localStorage
 */
export const getCart = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem("cart");
    return cart ? (JSON.parse(cart) as CartItem[]) : [];
  }
  return [];
};

/**
 * Lưu giỏ hàng vào localStorage
 */
export const saveCart = (cart: CartItem[]): void => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

/**
 * Thêm sản phẩm vào giỏ
 */
export const addToCart = (product: Product, stock: number): CartItem[] => {
  const cart = getCart();
  const existing = cart.find((p) => p.id === product.id);

  const image = product.images?.[0]?.url || "/images/default.jpg";

  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, stock);
    existing.maxQuantity = stock;
  } else {
    cart.push({
      ...product,
      quantity: Math.min(1, stock),
      maxQuantity: stock,
      selected: false,
      image,
    });
  }

  saveCart(cart);
  return cart;
};

/**
 * Thêm sản phẩm với số lượng tùy chọn
 */
export const addToCartWithQuantity = (
  product: Product,
  qty: number,
  maxQty: number,
  selected: boolean = false
): void => {
  if (typeof window === "undefined") return;

  const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

  const image = product.images?.[0]?.url || "/images/default.jpg";

  const existing = cart.find((p) => p.id === product.id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, maxQty);
    existing.image = image;
    existing.maxQuantity = maxQty;
    existing.selected = selected ?? existing.selected;
  } else {
    cart.push({
      ...product,
      quantity: qty,
      maxQuantity: maxQty,
      selected: selected ?? false,
      image,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ
 */
export const updateQuantity = (id: number, quantity: number, stock: number): CartItem[] => {
  const cart = getCart();
  const item = cart.find((p) => p.id === id);

  if (item) {
    if (quantity < 1) quantity = 1;
    if (quantity > stock) quantity = stock;
    item.quantity = quantity;
    item.maxQuantity = stock;
  }

  saveCart(cart);
  return cart;
};

/**
 * Đồng bộ giỏ hàng với tồn kho thực tế
 */
export const syncCartWithStock = (products: Product[]): CartItem[] => {
  const cart = getCart();

  const syncedCart = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    const stock = product?.quantity ?? 0;
    const image = product?.images?.[0]?.url || item.image || "/images/default.jpg";

    return {
      ...item,
      quantity: Math.min(item.quantity, stock),
      maxQuantity: stock,
      selected: item.selected ?? false,
      image,
    };
  });

  saveCart(syncedCart);
  return syncedCart;
};

/**
 * Xóa sản phẩm khỏi giỏ
 */
export const removeFromCart = (productId: number, variantId?: number): CartItem[] => {
  let cart = getCart();
  if (variantId != null) {
    cart = cart.filter((p) => !(p.id === productId && p.variantId === variantId));
  } else {
    cart = cart.filter((p) => p.id !== productId);
  }
  saveCart(cart);
  return cart;
};

/**
 * Xóa toàn bộ giỏ
 */
export const clearCart = (): void => {
  if (typeof window !== "undefined") localStorage.removeItem("cart");
};
