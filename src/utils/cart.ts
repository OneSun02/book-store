// utils/cart.ts

/**
 * Lấy giỏ hàng từ localStorage
 */
export const getCart = () => {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

/**
 * Lưu giỏ hàng vào localStorage
 */
export const saveCart = (cart: any[]) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

/**
 * Thêm sản phẩm vào giỏ
 * - Nếu có rồi thì tăng số lượng
 * - Không bao giờ vượt quá tồn kho
 */
export const addToCart = (product: any, stock: number) => {
  const cart = getCart();
  const existing = cart.find((p: any) => p.id === product.id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, stock);
  } else {
    cart.push({ ...product, quantity: Math.min(1, stock) });
  }

  saveCart(cart);
  return cart;
};

/**
 * Thêm sản phẩm với số lượng tùy chọn
 */
export const addToCartWithQuantity = (
  product: any,
  qty: number,
  maxQty: number,
  selected: boolean = false
) => {
  if (typeof window === "undefined") return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Lấy ảnh chính của sản phẩm
  const image = product.images?.[0]?.url || "/images/default.jpg";

  const existing = cart.find((p: any) => p.id === product.id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, maxQty);
    existing.image = image; // thêm dòng này
    if (selected) existing.selected = true;
  } else {
    cart.push({ ...product, quantity: qty, maxQuantity: maxQty, selected, image }); // thêm image
  }

  localStorage.setItem("cart", JSON.stringify(cart));
};




/**
 * Cập nhật số lượng sản phẩm trong giỏ
 * Luôn nằm trong khoảng [1, stock]
 */
export const updateQuantity = (id: number, quantity: number, stock: number) => {
  const cart = getCart();
  const item = cart.find((p: any) => p.id === id);

  if (item) {
    if (quantity < 1) quantity = 1;
    if (quantity > stock) quantity = stock;
    item.quantity = quantity;
  }

  saveCart(cart);
  return cart;
};

/**
 * Đồng bộ giỏ hàng với tồn kho thực tế
 * (dùng khi load lại giỏ hàng từ server)
 */
export const syncCartWithStock = (products: any[]) => {
  const cart = getCart();

  const syncedCart = cart.map((item: any) => {
    const product = products.find((p) => p.id === item.id);
    const stock = product?.stock ?? 0;
    return {
      ...item,
      quantity: Math.min(item.quantity, stock),
      maxQuantity: stock,
    };
  });

  saveCart(syncedCart);
  return syncedCart;
};

/**
 * Xóa sản phẩm khỏi giỏ
 */
// utils/cart.ts
export const removeFromCart = (productId: number, variantId?: number) => {
  let cart = getCart();
  if (variantId != null) {
    cart = cart.filter((p: any) => !(p.id === productId && p.variantId === variantId));
  } else {
    cart = cart.filter((p: any) => p.id !== productId);
  }
  saveCart(cart);
  return cart;
};

/**
 * Xóa toàn bộ giỏ
 */
export const clearCart = () => {
  if (typeof window !== "undefined") localStorage.removeItem("cart");
};
