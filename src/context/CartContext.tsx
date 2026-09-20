import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, DeliveryZone, Coupon } from '../types.js';
import { useSettings } from './SettingsContext.js';
import { useAuth } from './AuthContext.js';
import { validateCouponApi } from '../lib/api.js';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  grandTotal: number;
  deliveryZone: DeliveryZone;
  setDeliveryZone: (zone: DeliveryZone) => void;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getDeliveryCharge } = useSettings();
  const { user } = useAuth();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lunara_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('DHAKA_CITY');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('lunara_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('lunara_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('lunara_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('lunara_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, size?: string, color?: string, quantity = 1) => {
    const selectedSize = size || product.sizes[0] || 'Standard';
    const selectedColor = color || product.colors[0] || 'Default';
    const unitPrice = product.salePrice ?? product.price;

    setItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.size === selectedSize && item.color === selectedColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          product,
          size: selectedSize,
          color: selectedColor,
          quantity,
          price: unitPrice
        };
        return [...prev, newItem];
      }
    });

    setIsDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate coupon discount
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrder) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discount;
    }
  }

  const deliveryFee = items.length > 0 ? getDeliveryCharge(deliveryZone) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await validateCouponApi(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponError(null);
        return true;
      } else {
        setCouponError(res.message || 'Invalid coupon code');
        return false;
      }
    } catch {
      setCouponError('Error validating coupon. Please try again.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        deliveryFee,
        grandTotal,
        deliveryZone,
        setDeliveryZone,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
